import { useEffect, useState } from 'react'
import { ClipboardList, Package, Clock } from 'lucide-react'
import {
  getAllOrders,
  adminMarkReceived,
  adminMarkSeparated,
  adminMarkCompleted,
  adminCancelOrder,
  ORDERS_UPDATED_EVENT,
} from '@/features/store/storeOrderService'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type StoreOrder,
} from '@/features/store/storeTypes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { StoreOrderBuyerDetails } from '@/components/store/StoreOrderBuyerDetails'

export function StoreAdminOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>(() => getAllOrders())

  const refreshOrders = () => setOrders(getAllOrders())

  useEffect(() => {
    const handler = () => refreshOrders()
    window.addEventListener(ORDERS_UPDATED_EVENT, handler)
    const interval = setInterval(refreshOrders, 2000)
    return () => {
      window.removeEventListener(ORDERS_UPDATED_EVENT, handler)
      clearInterval(interval)
    }
  }, [])

  const pendingCount = orders.filter((o) => o.status === 'pending').length

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
        <ClipboardList size={20} className="text-amber-400" />
        Pedidos
      </h1>
      <p className="text-xs text-text-muted mb-4">
        {pendingCount > 0 ? `${pendingCount} pedido(s) aguardando confirmação` : 'Gestão de pedidos da loja'}
      </p>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-xs text-text-muted glass rounded-xl p-4">Nenhum pedido ainda.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-bold">{order.productName}</p>
                  <p className="text-[10px] text-text-muted">{formatDate(order.createdAt)}</p>
                </div>
                <Badge
                  variant={
                    order.status === 'pending'
                      ? 'warning'
                      : order.status === 'paid'
                        ? 'accent'
                        : order.status === 'cancelled'
                          ? 'danger'
                          : 'default'
                  }
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>
              <p className="text-sm font-bold text-accent mb-3">
                R$ {order.price.toFixed(2).replace('.', ',')}
              </p>
              <StoreOrderBuyerDetails order={order} defaultOpen={order.status === 'pending'} />
              {order.paymentMethod && (
                <p className="text-[10px] text-text-muted mb-2">
                  Pagamento: {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                </p>
              )}
              {order.pickupCode && (
                <p className="text-[10px] font-mono text-accent mb-2">QR: {order.pickupCode}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <Button size="sm" onClick={() => { void adminMarkReceived(order.id).then(refreshOrders) }}>
                    <Package size={14} /> Confirmar recebimento
                  </Button>
                )}
                {order.status === 'received' && (
                  <Button size="sm" onClick={() => { void adminMarkSeparated(order.id).then(refreshOrders) }}>
                    <Clock size={14} /> Produto separado
                  </Button>
                )}
                {order.status === 'paid' && (
                  <Button size="sm" variant="secondary" onClick={() => { void adminMarkCompleted(order.id).then(refreshOrders) }}>
                    Confirmar retirada
                  </Button>
                )}
                {!['completed', 'cancelled'].includes(order.status) && (
                  <Button size="sm" variant="ghost" onClick={() => { void adminCancelOrder(order.id).then(refreshOrders) }}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
