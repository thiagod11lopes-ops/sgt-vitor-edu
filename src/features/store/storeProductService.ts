import { STORE_PRODUCTS } from './storeData'
import type { StoreProduct } from './storeTypes'

const PRODUCTS_KEY = 'sgt-vitor-store-products'
export const STORE_UPDATED_EVENT = 'sgt-store-updated'

function notify() {
  window.dispatchEvent(new Event(STORE_UPDATED_EVENT))
}

export function getStoreProducts(): StoreProduct[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    return raw ? JSON.parse(raw) : STORE_PRODUCTS
  } catch {
    return STORE_PRODUCTS
  }
}

export function saveStoreProducts(products: StoreProduct[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
  notify()
}

export function addStoreProduct(product: Omit<StoreProduct, 'id'>) {
  const products = getStoreProducts()
  const id = `p-${Date.now()}`
  saveStoreProducts([...products, { ...product, id }])
  return id
}

export function updateStoreProduct(id: string, data: Partial<StoreProduct>) {
  saveStoreProducts(getStoreProducts().map((p) => (p.id === id ? { ...p, ...data } : p)))
}

export function deleteStoreProduct(id: string) {
  saveStoreProducts(getStoreProducts().filter((p) => p.id !== id))
}
