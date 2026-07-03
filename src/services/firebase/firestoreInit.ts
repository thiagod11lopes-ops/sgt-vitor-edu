import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, writeBatch, type Firestore } from 'firebase/firestore'
import { COLLECTIONS, LOCAL_STORAGE_KEYS } from './collections'
import { db, isConfigured, seedCollection, subscribeCollection } from './firestoreHelpers'
import { DOCUMENTS as DEFAULT_DOCUMENTS } from '@/features/library/libraryData'
import { STORE_PRODUCTS } from '@/features/store/storeData'
import type { Video, Document, ConsultingSession, RegisteredUserRecord } from '@/types'
import type { StoreProduct, StoreOrder } from '@/features/store/storeTypes'

let initialized = false

export async function seedFirestoreContent(firestore: Firestore) {
  await Promise.all([
    seedCollection(firestore, COLLECTIONS.documents, DEFAULT_DOCUMENTS, LOCAL_STORAGE_KEYS.documents),
    seedCollection(firestore, COLLECTIONS.storeProducts, STORE_PRODUCTS, LOCAL_STORAGE_KEYS.storeProducts),
  ])
}

export async function initFirestoreData() {
  if (!isConfigured || !db || initialized) return
  initialized = true

  await Promise.all([migrateOrders(), migrateConsulting(), migrateRegistry(), migrateAnalytics()])
}

async function migrateOrders() {
  if (!db) return
  const snap = await getDocs(collection(db, COLLECTIONS.storeOrders))
  if (!snap.empty) return

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.storeOrders)
    if (!raw) return
    const orders = JSON.parse(raw) as StoreOrder[]
    localStorage.removeItem(LOCAL_STORAGE_KEYS.storeOrders)
    const batch = writeBatch(db)
    for (const order of orders) {
      batch.set(doc(db, COLLECTIONS.storeOrders, order.id), order as object)
    }
    await batch.commit()
  } catch {
    /* ignore */
  }
}

async function migrateConsulting() {
  if (!db) return
  const snap = await getDocs(collection(db, COLLECTIONS.consultingSessions))
  if (!snap.empty) return
  try {
    const raw = localStorage.getItem('sgt-vitor-consulting-sessions')
    if (!raw) return
    const sessions = JSON.parse(raw) as ConsultingSession[]
    localStorage.removeItem('sgt-vitor-consulting-sessions')
    const batch = writeBatch(db)
    for (const session of sessions) {
      batch.set(doc(db, COLLECTIONS.consultingSessions, session.id), session as object)
    }
    await batch.commit()
  } catch {
    /* ignore */
  }
}

async function migrateRegistry() {
  if (!db) return
  const snap = await getDocs(collection(db, COLLECTIONS.registeredUsers))
  if (!snap.empty) return
  try {
    const raw = localStorage.getItem('sgt-vitor-user-registry')
    if (!raw) return
    const users = JSON.parse(raw) as RegisteredUserRecord[]
    localStorage.removeItem('sgt-vitor-user-registry')
    const batch = writeBatch(db)
    for (const user of users) {
      batch.set(doc(db, COLLECTIONS.registeredUsers, user.uid), user as object)
    }
    await batch.commit()
  } catch {
    /* ignore */
  }
}

async function migrateAnalytics() {
  if (!db) return
  const ref = doc(db, 'analytics', 'visits')
  const existing = await getDoc(ref)
  if (existing.exists()) return
  try {
    const raw = localStorage.getItem('sgt-vitor-visit-log')
    const log = raw ? JSON.parse(raw) : {}
    localStorage.removeItem('sgt-vitor-visit-log')
    await setDoc(ref, { log })
  } catch {
    await setDoc(ref, { log: {} })
  }
}

export function subscribeVideos(onData: (videos: Video[]) => void) {
  if (!db) return () => {}
  return subscribeCollection(
    db,
    COLLECTIONS.videos,
    [],
    (data, id) => ({ ...data, id } as Video),
    (items) => onData(sortVideos(items)),
  )
}

function sortVideos(videos: Video[]): Video[] {
  return [...videos].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'))
}

export function subscribeDocuments(onData: (docs: Document[]) => void) {
  if (!db) return () => {}
  return subscribeCollection(
    db,
    COLLECTIONS.documents,
    DEFAULT_DOCUMENTS,
    (data, id) => ({ ...data, id } as Document),
    onData,
  )
}

export function subscribeStoreProducts(onData: (products: StoreProduct[]) => void) {
  if (!db) return () => {}
  return subscribeCollection(
    db,
    COLLECTIONS.storeProducts,
    STORE_PRODUCTS,
    (data, id) => ({ ...data, id } as StoreProduct),
    onData,
  )
}

export function subscribeStoreOrders(onData: (orders: StoreOrder[]) => void) {
  if (!db) return () => {}
  return onSnapshot(collection(db, COLLECTIONS.storeOrders), (snap) => {
    onData(
      snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as StoreOrder))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    )
  })
}

export function subscribeConsultingSessions(onData: (sessions: ConsultingSession[]) => void) {
  if (!db) return () => {}
  return onSnapshot(collection(db, COLLECTIONS.consultingSessions), (snap) => {
    onData(
      snap.docs
        .map((d) => ({ ...d.data(), id: d.id } as ConsultingSession))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    )
  })
}

export function subscribeRegisteredUsers(onData: (users: RegisteredUserRecord[]) => void) {
  if (!db) return () => {}
  return onSnapshot(collection(db, COLLECTIONS.registeredUsers), (snap) => {
    onData(snap.docs.map((d) => d.data() as RegisteredUserRecord))
  })
}

export function subscribeVisitLog(onData: (log: Record<string, number>) => void) {
  if (!db) return () => {}
  const ref = doc(db, 'analytics', 'visits')
  return onSnapshot(ref, (snap) => {
    onData((snap.data()?.log as Record<string, number>) ?? {})
  })
}
