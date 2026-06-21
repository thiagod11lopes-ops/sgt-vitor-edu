import { useEffect, useState } from 'react'
import {
  getUserOrders,
  ORDERS_UPDATED_EVENT,
  expireOverdueOrders,
} from '@/features/store/storeOrderService'
import type { StoreOrder } from '@/features/store/storeTypes'

export function useUserOrders(userId: string) {
  const [orders, setOrders] = useState<StoreOrder[]>(() => getUserOrders(userId))

  useEffect(() => {
    const refresh = () => setOrders(getUserOrders(userId))
    refresh()
    window.addEventListener(ORDERS_UPDATED_EVENT, refresh)
    const interval = setInterval(() => {
      expireOverdueOrders()
      refresh()
    }, 1000)
    return () => {
      window.removeEventListener(ORDERS_UPDATED_EVENT, refresh)
      clearInterval(interval)
    }
  }, [userId])

  return orders
}
