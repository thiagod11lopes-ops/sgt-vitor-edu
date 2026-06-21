import { motion } from 'framer-motion'
import { Crown, Check, X, Sparkles } from 'lucide-react'
import { PLAN_PRICES, type SubscriptionPlan } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface SubscriptionPlansModalProps {
  onContinueFree: () => void
  onClose?: () => void
  title?: string
  subtitle?: string
}

export function SubscriptionPlansModal({
  onContinueFree,
  onClose,
  title = 'Planos de assinatura',
  subtitle = 'Escolha como quer estudar. Você pode começar no Free e evoluir quando quiser.',
}: SubscriptionPlansModalProps) {
  const plans = Object.entries(PLAN_PRICES) as [
    SubscriptionPlan,
    (typeof PLAN_PRICES)[SubscriptionPlan],
  ][]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm safe-top safe-bottom"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong w-full max-w-md rounded-3xl border border-white/10 shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden"
      >
        <div className="px-5 pt-5 pb-3 border-b border-white/5 shrink-0 relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 text-text-muted"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          )}
          <div className="flex items-center gap-2 mb-1 pr-8">
            <Crown size={18} className="text-purple-400" />
            <h2 className="text-lg font-bold">{title}</h2>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 space-y-3">
          {plans.map(([key, p]) => (
            <Card
              key={key}
              className={cn(
                '!p-4',
                key === 'premium' && 'border border-purple-500/30 bg-purple-500/5',
                key === 'premium_plus' && 'border border-amber-500/20'
              )}
            >
              <div className="flex items-center justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">{p.label}</h3>
                  {key === 'free' && <Badge>Recomendado para começar</Badge>}
                  {key === 'premium' && <Badge variant="premium">Popular</Badge>}
                </div>
                {p.price > 0 ? (
                  <span className="text-sm font-bold text-accent shrink-0">
                    R$ {p.price.toFixed(2).replace('.', ',')}/mês
                  </span>
                ) : (
                  <span className="text-sm font-bold text-text-secondary shrink-0">Grátis</span>
                )}
              </div>
              <ul className="space-y-1.5 mb-3">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <Check size={12} className="text-accent shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {key !== 'free' && (
                <Button variant="premium" size="sm" className="w-full" disabled>
                  Assinar {p.label} — em breve
                </Button>
              )}
            </Card>
          ))}
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-white/10 space-y-2">
          <Button className="w-full" onClick={onContinueFree}>
            <Sparkles size={16} />
            Continuar com plano Free
          </Button>
          <p className="text-[10px] text-text-muted text-center">
            Pagamentos e upgrades estarão disponíveis em breve.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
