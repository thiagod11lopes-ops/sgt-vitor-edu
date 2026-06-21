import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useNotifications } from '@/features/notifications/useNotifications'
import { getNotificationIcon } from '@/features/notifications/notificationService'
import { formatDate } from '@/lib/utils'

export function NotificationPanel() {
  const { notifications, unreadCount, readNotification, readAll } = useNotifications()
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg hover:bg-white/5 text-text-muted"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-[9px] font-bold flex items-center justify-center text-white">
            {unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 inset-x-0 glass-strong rounded-t-3xl max-h-[70dvh] flex flex-col safe-bottom"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <h2 className="text-sm font-bold">Notificações</h2>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={readAll} className="text-[10px] text-accent flex items-center gap-1">
                      <CheckCheck size={12} /> Ler todas
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto hide-scrollbar flex-1 px-4 py-2 space-y-2">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      readNotification(n.id, n.actionUrl)
                      setOpen(false)
                    }}
                    className={`w-full glass rounded-xl p-3 text-left ${!n.read ? 'border-l-2 border-accent' : 'opacity-70'}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getNotificationIcon(n.type)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{n.title}</p>
                        <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-text-muted mt-1">{formatDate(n.timestamp)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
