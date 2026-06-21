import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Video,
  BookOpen,
  MessageSquare,
  ArrowLeft,
  Shield,
  LogOut,
} from 'lucide-react'
import { logoutAdmin } from '@/features/admin/adminAuthService'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/videos', icon: Video, label: 'Vídeos' },
  { to: '/admin/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/admin/consultoria', icon: MessageSquare, label: 'Consultoria' },
]

export function AdminLayout() {
  const handleLogout = () => {
    logoutAdmin()
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-dvh bg-bg-primary flex flex-col md:flex-row">
      <aside className="glass-strong border-b md:border-b-0 md:border-r border-white/10 md:w-56 shrink-0 safe-top">
        <div className="px-4 py-4 flex items-center gap-2 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold">Painel Admin</p>
            <p className="text-[9px] text-text-muted">Sgt Vitor</p>
          </div>
        </div>

        <nav className="p-2 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  isActive ? 'bg-accent/20 text-accent' : 'text-text-secondary hover:bg-white/5'
                )
              }
            >
              <link.icon size={14} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 mt-auto border-t border-white/5 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:bg-white/5"
          >
            <ArrowLeft size={14} />
            Voltar ao app
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={14} />
            Sair do admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto hide-scrollbar safe-top safe-bottom">
        <Outlet />
      </main>
    </div>
  )
}
