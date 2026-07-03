import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { db, isConfigured } from './config'
import { adminDb } from './adminApp'

export async function seedCollection<T extends { id: string }>(
  firestore: Firestore,
  name: string,
  defaults: T[],
  localKey?: string,
) {
  const snap = await getDocs(collection(firestore, name))
  if (!snap.empty) return

  let items = defaults
  if (localKey) {
    try {
      const raw = localStorage.getItem(localKey)
      if (raw) {
        items = JSON.parse(raw) as T[]
        localStorage.removeItem(localKey)
      }
    } catch {
      /* ignore */
    }
  }

  if (items.length === 0) return

  const batch = writeBatch(firestore)
  for (const item of items) {
    batch.set(doc(firestore, name, item.id), withoutUndefined(item as DocumentData))
  }
  await batch.commit()
}

export function subscribeCollection<T>(
  firestore: Firestore,
  name: string,
  fallback: T[],
  mapDoc: (data: DocumentData, id: string) => T,
  onData: (items: T[]) => void,
) {
  let lastItems: T[] = []
  let notified = false

  return onSnapshot(
    collection(firestore, name),
    (snap) => {
      const items = snap.docs.map((d) => mapDoc(d.data(), d.id))

      if (items.length > 0) {
        lastItems = items
        notified = true
        onData(items)
        return
      }

      if (!snap.metadata.fromCache) {
        lastItems = []
        notified = true
        onData([])
        return
      }

      if (!notified) {
        notified = true
        onData(lastItems.length > 0 ? lastItems : fallback)
      }
    },
    (error) => {
      console.error(`Firestore subscription failed (${name}):`, error)
      if (!notified) notified = true
      onData(lastItems.length > 0 ? lastItems : fallback)
    },
  )
}

function withoutUndefined(data: DocumentData): DocumentData {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  )
}

export async function upsertDoc(
  firestore: Firestore,
  collectionName: string,
  id: string,
  data: DocumentData,
) {
  await setDoc(doc(firestore, collectionName, id), withoutUndefined(data), { merge: true })
}

export async function removeDoc(firestore: Firestore, collectionName: string, id: string) {
  await deleteDoc(doc(firestore, collectionName, id))
}

export { db, adminDb, isConfigured }
