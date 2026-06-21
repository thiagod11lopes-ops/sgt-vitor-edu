import { useEffect, useState } from 'react'
import { getStoreProducts, STORE_UPDATED_EVENT } from '@/features/store/storeProductService'
import type { StoreProduct } from '@/features/store/storeTypes'

export function useStoreProducts() {
  const [products, setProducts] = useState<StoreProduct[]>(() => getStoreProducts())

  useEffect(() => {
    const refresh = () => setProducts(getStoreProducts())
    window.addEventListener(STORE_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(STORE_UPDATED_EVENT, refresh)
  }, [])

  return products
}
