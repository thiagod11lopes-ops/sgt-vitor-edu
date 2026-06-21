import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  const Component = onClick ? motion.button : motion.div
  return (
    <Component
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'glass rounded-2xl p-4 text-left w-full',
        hover && 'hover:bg-white/6 transition-colors cursor-pointer',
        className
      )}
    >
      {children}
    </Component>
  )
}
