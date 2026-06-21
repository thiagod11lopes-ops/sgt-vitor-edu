import { useEffect, useState } from 'react'
import {
  getRemainingPaymentMs,
  formatRemainingTime,
} from '@/features/store/storeOrderService'
import type { StoreOrder } from '@/features/store/storeTypes'

export function usePaymentCountdown(order: StoreOrder | null) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!order || order.status !== 'separated') {
      setRemaining(null)
      return
    }

    const tick = () => setRemaining(getRemainingPaymentMs(order))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [order?.id, order?.status, order?.paymentDeadline])

  return {
    remainingMs: remaining,
    formatted: remaining !== null ? formatRemainingTime(remaining) : null,
    expired: remaining === 0,
  }
}
