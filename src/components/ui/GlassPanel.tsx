import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  strong?: boolean
}

export function GlassPanel({ children, className, strong = false }: GlassPanelProps) {
  return (
    <div className={cn(strong ? 'glass-strong' : 'glass', 'rounded-2xl', className)}>
      {children}
    </div>
  )
}
