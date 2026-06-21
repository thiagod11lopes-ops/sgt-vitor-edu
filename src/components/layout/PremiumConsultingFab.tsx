import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { cn } from '@/lib/utils'

interface PremiumConsultingFabProps {
  inline?: boolean
}

export function PremiumConsultingFab({ inline = false }: PremiumConsultingFabProps) {
  const { isPremium } = useSubscription()
  const location = useLocation()
  const hidden = location.pathname === '/consultoria'

  if (hidden) return null

  const content = (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider',
        isPremium
          ? 'gradient-premium text-white shadow-md shadow-purple-500/25'
          : 'glass text-text-primary border border-accent/30'
      )}
    >
      <GraduationCap size={12} />
      <span>Consultoria Premium</span>
    </motion.div>
  )

  const tooltip = (
    <span
      role="tooltip"
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1.5 rounded-lg glass-strong border border-white/10 text-[10px] font-normal normal-case tracking-normal text-text-primary whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none shadow-lg"
    >
      Fale direto com Sgt Vitor
    </span>
  )

  if (inline) {
    return (
      <Link to="/consultoria" className="relative group shrink-0">
        {content}
        {tooltip}
      </Link>
    )
  }

  return (
    <Link
      to="/consultoria"
      className="fixed right-4 z-30 top-[calc(env(safe-area-inset-top,0px)+3.75rem)] group"
    >
      {content}
      {tooltip}
    </Link>
  )
}
