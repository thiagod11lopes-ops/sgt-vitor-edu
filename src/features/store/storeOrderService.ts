import type { PaymentMethod, StoreOrder, StoreOrderStatus, StoreProduct } from './storeTypes'
import type { StoreBuyerData } from './storeBuyerTypes'
import { PAYMENT_WINDOW_MS } from './storeTypes'
import { COLLECTIONS } from '@/services/firebase/collections'
import { adminDb, db, isConfigured, upsertDoc } from '@/services/firebase/firestoreHelpers'
import { initFirestoreData, subscribeStoreOrders } from '@/services/firebase/firestoreInit'

const ORDERS_KEY = 'sgt-vitor-store-orders'
export const ORDERS_UPDATED_EVENT = 'sgt-orders-updated'

let ordersCache: StoreOrder[] = []
let subscriptionsStarted = false

function notify() {
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT))
}

function ensureSubscriptions() {
  if (subscriptionsStarted) return
  subscriptionsStarted = true
  if (!isConfigured) return

  void initFirestoreData()
  subscribeStoreOrders((items) => {
    ordersCache = items
    notify()
  })
}

function loadOrdersLocal(): StoreOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveOrdersLocal(orders: StoreOrder[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  ordersCache = orders
  notify()
}

function getOrdersSnapshot(): StoreOrder[] {
  ensureSubscriptions()
  return isConfigured ? ordersCache : loadOrdersLocal()
}

function generatePickupCode(orderId: string) {
  return `SGT-${orderId.slice(-6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function getPickupQrUrl(pickupCode: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(pickupCode)}&size=240&margin=2`
}

export function expireOverdueOrders() {
  const now = Date.now()
  const orders = getOrdersSnapshot()
  let changed = false

  const updated = orders.map((o) => {
    if (o.status === 'separated' && o.paymentDeadline && now > new Date(o.paymentDeadline).getTime()) {
      changed = true
      return { ...o, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
    }
    return o
  })

  if (changed) {
    if (isConfigured && db) {
      const firestore = db
      void Promise.all(
        updated
          .filter((o) => o.status === 'cancelled')
          .map((o) => upsertDoc(firestore, COLLECTIONS.storeOrders, o.id, o)),
      )
    } else {
      saveOrdersLocal(updated)
    }
  }
  return updated
}

export function getAllOrders(): StoreOrder[] {
  return expireOverdueOrders()
}

export function getUserOrders(userId: string): StoreOrder[] {
  return getAllOrders().filter((o) => o.userId === userId)
}

export function getActiveUserOrder(userId: string, productId: string): StoreOrder | undefined {
  return getUserOrders(userId).find(
    (o) => o.productId === productId && !['completed', 'cancelled'].includes(o.status),
  )
}

export async function createOrder(
  userId: string,
  userName: string,
  userEmail: string,
  product: StoreProduct,
  buyer: StoreBuyerData,
): Promise<StoreOrder> {
  const now = new Date().toISOString()
  const order: StoreOrder = {
    id: `ord-${Date.now()}`,
    userId,
    userName: buyer.fullName || userName,
    userEmail: buyer.email || userEmail,
    buyer,
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    price: product.price,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }

  if (isConfigured && db) {
    await upsertDoc(db, COLLECTIONS.storeOrders, order.id, order as object)
    return order
  }

  saveOrdersLocal([order, ...getOrdersSnapshot()])
  return order
}

async function patchOrder(orderId: string, patch: Partial<StoreOrder>, useAdminDb = false) {
  const orders = getOrdersSnapshot()
  const idx = orders.findIndex((o) => o.id === orderId)
  if (idx < 0) return null

  const updated: StoreOrder = {
    ...orders[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  }

  if (isConfigured) {
    const firestore = useAdminDb && adminDb ? adminDb : db
    if (firestore) {
      await upsertDoc(firestore, COLLECTIONS.storeOrders, orderId, updated as object)
      return updated
    }
  }

  orders[idx] = updated
  saveOrdersLocal(orders)
  return updated
}

export async function adminMarkReceived(orderId: string) {
  return patchOrder(
    orderId,
    { status: 'received', receivedAt: new Date().toISOString() },
    true,
  )
}

export async function adminMarkSeparated(orderId: string) {
  const deadline = new Date(Date.now() + PAYMENT_WINDOW_MS).toISOString()
  return patchOrder(
    orderId,
    {
      status: 'separated',
      separatedAt: new Date().toISOString(),
      paymentDeadline: deadline,
    },
    true,
  )
}

export async function adminMarkCompleted(orderId: string) {
  return patchOrder(
    orderId,
    { status: 'completed', completedAt: new Date().toISOString() },
    true,
  )
}

export async function adminCancelOrder(orderId: string) {
  return patchOrder(orderId, { status: 'cancelled' }, true)
}

export async function confirmPayment(orderId: string, method: PaymentMethod) {
  const pickupCode = generatePickupCode(orderId)
  return patchOrder(orderId, {
    status: 'paid',
    paidAt: new Date().toISOString(),
    paymentMethod: method,
    pickupCode,
  })
}

export function getRemainingPaymentMs(order: StoreOrder): number | null {
  if (order.status !== 'separated' || !order.paymentDeadline) return null
  return Math.max(0, new Date(order.paymentDeadline).getTime() - Date.now())
}

export function formatRemainingTime(ms: number) {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function getOrderStatusMessage(status: StoreOrderStatus): string {
  const messages: Record<StoreOrderStatus, string> = {
    pending: 'Pedido pendente — aguardando confirmação da loja.',
    received: 'Solicitação recebida — aguarde o processo de separação.',
    separated: 'Produto separado — realize o pagamento em até 24 horas.',
    paid: 'Pagamento confirmado — apresente o QR code na loja para retirada presencial.',
    completed: 'Pedido retirado com sucesso. Obrigado!',
    cancelled: 'Pedido cancelado — prazo de pagamento expirado ou cancelado pela loja.',
  }
  return messages[status]
}

export async function clearUserStoreOrders(userId: string) {
  const remaining = getOrdersSnapshot().filter((o) => o.userId !== userId)
  if (isConfigured && db) {
    const firestore = db
    const toRemove = getOrdersSnapshot().filter((o) => o.userId === userId)
    await Promise.all(
      toRemove.map((o) => upsertDoc(firestore, COLLECTIONS.storeOrders, o.id, { ...o, status: 'cancelled' })),
    )
    return
  }
  saveOrdersLocal(remaining)
}
