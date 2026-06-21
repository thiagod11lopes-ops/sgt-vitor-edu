import type { RegisteredUserRecord, SubscriptionPlan } from '@/types'

const REGISTRY_KEY = 'sgt-vitor-user-registry'

function loadRegistry(): RegisteredUserRecord[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRegistry(users: RegisteredUserRecord[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(users))
}

export function registerOrUpdateUser(data: {
  uid: string
  displayName: string
  email: string
  plan: SubscriptionPlan
}) {
  const registry = loadRegistry()
  const now = new Date().toISOString()
  const idx = registry.findIndex((u) => u.uid === data.uid)

  if (idx >= 0) {
    registry[idx] = { ...registry[idx], ...data, lastSeen: now }
  } else {
    registry.push({ ...data, createdAt: now, lastSeen: now })
  }

  saveRegistry(registry)
}

export function getRegisteredUsers(): RegisteredUserRecord[] {
  return loadRegistry()
}

export function updateUserPlan(uid: string, plan: SubscriptionPlan) {
  const registry = loadRegistry()
  const user = registry.find((u) => u.uid === uid)
  if (user) {
    user.plan = plan
    user.lastSeen = new Date().toISOString()
    saveRegistry(registry)
  }
}

export function getPlanBreakdown() {
  const users = loadRegistry()
  return {
    free: users.filter((u) => u.plan === 'free').length,
    premium: users.filter((u) => u.plan === 'premium').length,
    premium_plus: users.filter((u) => u.plan === 'premium_plus').length,
  }
}
