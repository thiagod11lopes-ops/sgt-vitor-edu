import { useState } from 'react'
import { Clock, QrCode, CreditCard, MapPin, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePaymentCountdown } from '@/hooks/usePaymentCountdown'
import {
  confirmPayment,
  getOrderStatusMessage,
  getPickupQrUrl,
} from '@/features/store/storeOrderService'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type StoreOrder,
} from '@/features/store/storeTypes'
import { cn } from '@/lib/utils'

interface StoreOrderPanelProps {
  order: StoreOrder
  onUpdate: () => void
}

const PAYMENT_METHODS: PaymentMethod[] = ['pix', 'credit', 'debit', 'cash']

export function StoreOrderPanel({ order, onUpdate }: StoreOrderPanelProps) {
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [paying, setPaying] = useState(false)
  const { formatted, expired, remainingMs } = usePaymentCountdown(order)

  const handlePay = () => {
    setPaying(true)
    confirmPayment(order.id, method)
    setPaying(false)
    onUpdate()
  }

  const statusVariant =
    order.status === 'cancelled'
      ? 'danger'
      : order.status === 'paid' || order.status === 'completed'
        ? 'accent'
        : order.status === 'separated'
          ? 'warning'
          : 'default'

  return (
    <div className="glass rounded-xl p-4 border border-white/10 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold">Seu pedido</p>
        <Badge variant={statusVariant}>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      <p className="text-[11px] text-text-secondary leading-relaxed">
        {getOrderStatusMessage(order.status)}
      </p>

      {order.status === 'separated' && formatted && (
        <div
          className={cn(
            'rounded-xl p-3 flex items-center gap-3 border',
            expired ? 'border-red-500/30 bg-red-500/10' : 'border-amber-500/30 bg-amber-500/10'
          )}
        >
          <Clock size={18} className={expired ? 'text-red-400' : 'text-amber-400'} />
          <div>
            <p className="text-[10px] text-text-muted">Prazo para pagamento (24h)</p>
            <p className={cn('text-lg font-mono font-bold', expired ? 'text-red-400' : 'text-amber-400')}>
              {expired ? '00:00:00' : formatted}
            </p>
          </div>
        </div>
      )}

      {order.status === 'separated' && !expired && remainingMs !== null && remainingMs > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Forma de pagamento
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  'text-[10px] py-2 px-2 rounded-lg border transition-colors',
                  method === m
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-white/10 text-text-secondary hover:bg-white/5'
                )}
              >
                {PAYMENT_METHOD_LABELS[m]}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-text-muted flex items-center gap-1">
            <MapPin size={10} />
            Retirada somente presencial na loja
          </p>
          <Button className="w-full" onClick={handlePay} disabled={paying}>
            <CreditCard size={16} />
            Confirmar pagamento — R$ {order.price.toFixed(2).replace('.', ',')}
          </Button>
        </div>
      )}

      {(order.status === 'paid' || order.status === 'completed') && order.pickupCode && (
        <div className="text-center space-y-3">
          <div className="glass rounded-xl p-4 inline-block mx-auto">
            <img
              src={getPickupQrUrl(order.pickupCode)}
              alt="QR Code de retirada"
              className="w-48 h-48 mx-auto rounded-lg bg-white p-2"
            />
          </div>
          <div className="flex items-center justify-center gap-1 text-accent">
            <QrCode size={14} />
            <p className="text-sm font-mono font-bold">{order.pickupCode}</p>
          </div>
          <p className="text-[10px] text-text-muted">
            Apresente este QR code na loja para retirar seu produto.
          </p>
          {order.paymentMethod && (
            <p className="text-[10px] text-text-secondary">
              Pago via {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </p>
          )}
        </div>
      )}

      {order.status === 'completed' && (
        <div className="flex items-center justify-center gap-2 text-green-400 text-xs">
          <CheckCircle2 size={14} />
          Retirada confirmada
        </div>
      )}
    </div>
  )
}
