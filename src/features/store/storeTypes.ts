import type { StoreBuyerData } from './storeBuyerTypes'

export type StoreCategory = 'armamentos' | 'municoes' | 'acessorios'

export type { StoreBuyerData, CacActivity } from './storeBuyerTypes'
export { CAC_ACTIVITY_LABELS } from './storeBuyerTypes'

export interface StoreProduct {
  id: string
  name: string
  description: string
  category: StoreCategory
  price: number
  brand: string
  caliber?: string
  image: string
  inStock: boolean
  badge?: string
}

export type StoreOrderStatus =
  | 'pending'
  | 'received'
  | 'separated'
  | 'paid'
  | 'completed'
  | 'cancelled'

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash'

export interface StoreOrder {
  id: string
  userId: string
  userName: string
  userEmail: string
  buyer?: StoreBuyerData
  productId: string
  productName: string
  productImage: string
  price: number
  status: StoreOrderStatus
  createdAt: string
  updatedAt: string
  receivedAt?: string
  separatedAt?: string
  paymentDeadline?: string
  paidAt?: string
  paymentMethod?: PaymentMethod
  pickupCode?: string
  completedAt?: string
}

export const ORDER_STATUS_LABELS: Record<StoreOrderStatus, string> = {
  pending: 'Pendente',
  received: 'Solicitação recebida',
  separated: 'Aguardando pagamento',
  paid: 'Pago — retirada',
  completed: 'Retirado',
  cancelled: 'Cancelado',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit: 'Cartão de crédito',
  debit: 'Cartão de débito',
  pix: 'PIX',
  cash: 'Dinheiro',
}

export const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000
