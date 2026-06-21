import type { RegisteredUserRecord, SubscriptionPlan } from '@/types'
import { COLLECTIONS } from '@/services/firebase/collections'
import { db, isConfigured, upsertDoc } from '@/services/firebase/firestoreHelpers'
import { initFirestoreData, subscribeRegisteredUsers } from '@/services/firebase/firestoreInit'

const REGISTRY_KEY = 'sgt-vitor-user-registry'

let usersCache: RegisteredUserRecord[] = []
let subscriptionsStarted = false

function ensureSubscriptions() {
  if (subscriptionsStarted) return
  subscriptionsStarted = true
  if (!isConfigured) return

  void initFirestoreData()
  subscribeRegisteredUsers((items) => {
    usersCache = items
  })
}

function loadRegistryLocal(): RegisteredUserRecord[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRegistryLocal(users: RegisteredUserRecord[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(users))
  usersCache = users
}

export async function registerOrUpdateUser(data: {
  uid: string
  displayName: string
  email: string
  plan: SubscriptionPlan
}) {
  ensureSubscriptions()
  const now = new Date().toISOString()
  const existing = (isConfigured ? usersCache : loadRegistryLocal()).find((u) => u.uid === data.uid)

  const record: RegisteredUserRecord = existing
    ? { ...existing, ...data, lastSeen: now }
    : { ...data, createdAt: now, lastSeen: now }

  if (isConfigured && db) {
    await upsertDoc(db, COLLECTIONS.registeredUsers, data.uid, record as object)
    return
  }

  const registry = loadRegistryLocal()
  const idx = registry.findIndex((u) => u.uid === data.uid)
  if (idx >= 0) registry[idx] = record
  else registry.push(record)
  saveRegistryLocal(registry)
}

export function getRegisteredUsers(): RegisteredUserRecord[] {
  ensureSubscriptions()
  return isConfigured ? usersCache : loadRegistryLocal()
}

export async function updateUserPlan(uid: string, plan: SubscriptionPlan) {
  const users = getRegisteredUsers()
  const user = users.find((u) => u.uid === uid)
  if (!user) return

  const updated = { ...user, plan, lastSeen: new Date().toISOString() }

  if (isConfigured && db) {
    await upsertDoc(db, COLLECTIONS.registeredUsers, uid, updated as object)
    return
  }

  saveRegistryLocal(users.map((u) => (u.uid === uid ? updated : u)))
}

export function getPlanBreakdown() {
  const users = getRegisteredUsers()
  return {
    free: users.filter((u) => u.plan === 'free').length,
    premium: users.filter((u) => u.plan === 'premium').length,
    premium_plus: users.filter((u) => u.plan === 'premium_plus').length,
  }
}
