import { STORE_PRODUCTS } from './storeData'
import type { StoreProduct } from './storeTypes'
import { COLLECTIONS } from '@/services/firebase/collections'
import { adminDb, isConfigured, removeDoc, upsertDoc } from '@/services/firebase/firestoreHelpers'
import { initFirestoreData, subscribeStoreProducts } from '@/services/firebase/firestoreInit'

const PRODUCTS_KEY = 'sgt-vitor-store-products'
export const STORE_UPDATED_EVENT = 'sgt-store-updated'

let productsCache: StoreProduct[] = STORE_PRODUCTS
let subscriptionsStarted = false

function notify() {
  window.dispatchEvent(new Event(STORE_UPDATED_EVENT))
}

function ensureSubscriptions() {
  if (subscriptionsStarted) return
  subscriptionsStarted = true
  if (!isConfigured) return

  void initFirestoreData()
  subscribeStoreProducts((items) => {
    productsCache = items
    notify()
  })
}

export function getStoreProducts(): StoreProduct[] {
  ensureSubscriptions()
  if (!isConfigured) {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY)
      return raw ? JSON.parse(raw) : STORE_PRODUCTS
    } catch {
      return STORE_PRODUCTS
    }
  }
  return productsCache
}

function saveLocal(products: StoreProduct[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  productsCache = products
  notify()
}

export async function addStoreProduct(product: Omit<StoreProduct, 'id'>) {
  const id = `p-${Date.now()}`
  const item = { ...product, id }

  if (isConfigured && adminDb) {
    await upsertDoc(adminDb, COLLECTIONS.storeProducts, id, item)
    return id
  }

  saveLocal([...getStoreProducts(), item])
  return id
}

export async function updateStoreProduct(id: string, data: Partial<StoreProduct>) {
  const current = getStoreProducts().find((p) => p.id === id)
  if (!current) return

  const updated = { ...current, ...data }

  if (isConfigured && adminDb) {
    await upsertDoc(adminDb, COLLECTIONS.storeProducts, id, updated)
    return
  }

  saveLocal(getStoreProducts().map((p) => (p.id === id ? updated : p)))
}

export async function deleteStoreProduct(id: string) {
  if (isConfigured && adminDb) {
    await removeDoc(adminDb, COLLECTIONS.storeProducts, id)
    return
  }

  saveLocal(getStoreProducts().filter((p) => p.id !== id))
}
