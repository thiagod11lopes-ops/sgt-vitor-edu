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

  const batch = writeBatch(firestore)
  for (const item of items) {
    batch.set(doc(firestore, name, item.id), item as DocumentData)
  }
  await batch.commit()
}

export function subscribeCollection<T>(
  firestore: Firestore,
  name: string,
  defaults: T[],
  mapDoc: (data: DocumentData, id: string) => T,
  onData: (items: T[]) => void,
) {
  return onSnapshot(collection(firestore, name), (snap) => {
    if (snap.empty) {
      onData(defaults)
      return
    }
    onData(snap.docs.map((d) => mapDoc(d.data(), d.id)))
  })
}

export async function upsertDoc(
  firestore: Firestore,
  collectionName: string,
  id: string,
  data: DocumentData,
) {
  await setDoc(doc(firestore, collectionName, id), data, { merge: true })
}

export async function removeDoc(firestore: Firestore, collectionName: string, id: string) {
  await deleteDoc(doc(firestore, collectionName, id))
}

export { db, adminDb, isConfigured }
