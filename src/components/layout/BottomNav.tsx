import { NavLink } from 'react-router-dom'
import { MessageSquare, BookOpen, Brain, Play, Camera, ShoppingBag, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useOCRPanel } from '@/contexts/OCRContext'
import type { LucideIcon } from 'lucide-react'

type NavTab = {
  type: 'link'
  to: string
  icon: LucideIcon
  label: string
  center?: boolean
}

type ActionTab = {
  type: 'action'
  icon: LucideIcon
  label: string
}

const tabs: (NavTab | ActionTab)[] = [
  { type: 'link', to: '/perfil', icon: User, label: 'Perfil' },
  { type: 'action', icon: Camera, label: 'Analisar' },
  { type: 'link', to: '/loja', icon: ShoppingBag, label: 'Loja' },
  { type: 'link', to: '/videos', icon: Play, label: 'Vídeos', center: true },
  { type: 'link', to: '/', icon: MessageSquare, label: 'Chat' },
  { type: 'link', to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { type: 'link', to: '/simulados', icon: Brain, label: 'Simulados' },
]

export function BottomNav() {
  const { openOCR } = useOCRPanel()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom">
      <div className="glass-strong border-t border-white/10 mx-auto max-w-lg">
        <div className="flex items-end justify-around px-0.5 py-1.5">
          {tabs.map((tab) => {
            if (tab.type === 'action') {
              return (
                <motion.button
                  key="ocr"
                  whileTap={{ scale: 0.9 }}
                  onClick={openOCR}
                  className="relative flex flex-col items-center gap-0.5 px-1.5 py-1.5 min-w-[40px] text-text-muted hover:text-accent transition-colors"
                >
                  <tab.icon size={20} strokeWidth={1.8} />
                  <span className="text-[8px] font-medium">{tab.label}</span>
                </motion.button>
              )
            }

            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-0.5 rounded-xl transition-all duration-300',
                    tab.center ? 'px-1.5 -mt-3' : 'px-1.5 py-1.5 min-w-[40px]',
                    isActive ? 'text-accent' : 'text-text-muted'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !tab.center && (
                      <span className="nav-tab-active-glow" aria-hidden />
                    )}
                    {tab.center ? (
                      <motion.div
                        animate={isActive ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="relative"
                      >
                        {isActive && (
                          <span className="nav-videos-glow nav-videos-active-glow" aria-hidden />
                        )}
                        <div
                          className={cn(
                            'relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                            isActive
                              ? 'nav-videos-btn gradient-videos-animated text-white shadow-[0_0_28px_rgba(59,130,246,0.55)]'
                              : 'glass-strong border border-white/10 text-text-muted'
                          )}
                        >
                          <tab.icon
                            size={24}
                            strokeWidth={isActive ? 2.5 : 1.8}
                            fill={isActive ? 'white' : 'none'}
                            className={isActive ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]' : undefined}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className={cn('relative', isActive && 'nav-tab-active-ring')}
                      >
                        <tab.icon
                          size={20}
                          strokeWidth={isActive ? 2.5 : 1.8}
                          className={isActive ? 'drop-shadow-[0_0_10px_rgba(96,165,250,0.9)]' : undefined}
                        />
                      </motion.div>
                    )}
                    <span
                      className={cn(
                        'text-[8px] font-medium transition-all',
                        isActive && !tab.center && 'font-semibold drop-shadow-[0_0_6px_rgba(96,165,250,0.7)]',
                        tab.center && isActive
                          ? 'font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                          : ''
                      )}
                    >
                      {tab.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className={cn(
                          'absolute -bottom-0 w-5 h-1 rounded-full shadow-[0_0_8px_currentColor]',
                          tab.center ? 'bg-cyan-400 shadow-cyan-400/80' : 'bg-accent shadow-blue-400/80'
                        )}
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
