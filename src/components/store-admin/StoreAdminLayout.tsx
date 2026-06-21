import { NavLink, Outlet, Link } from 'react-router-dom'
import { Package, ClipboardList, ArrowLeft, LogOut, ShoppingBag } from 'lucide-react'
import { logoutStoreAdmin } from '@/features/store/storeAdminAuthService'
import { cn } from '@/lib/utils'

const links = [
  { to: '/loja-admin', end: true, icon: Package, label: 'Produtos' },
  { to: '/loja-admin/pedidos', icon: ClipboardList, label: 'Pedidos' },
]

export function StoreAdminLayout() {
  const handleLogout = () => {
    void logoutStoreAdmin().finally(() => {
      window.location.href = '/loja-admin/login'
    })
  }

  return (
    <>
      <div className="app-background" aria-hidden="true" />
      <div className="app-background-overlay" aria-hidden="true" />
      <div className="relative z-10 min-h-dvh bg-bg-primary flex flex-col md:flex-row">
        <aside className="glass-strong border-b md:border-b-0 md:border-r border-white/10 md:w-56 shrink-0 safe-top">
          <div className="px-4 py-4 flex items-center gap-2 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ShoppingBag size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold">Admin da Loja</p>
              <p className="text-[9px] text-text-muted">Gestão independente</p>
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
                    isActive ? 'bg-amber-500/15 text-amber-400' : 'text-text-secondary hover:bg-white/5'
                  )
                }
              >
                <link.icon size={14} />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-2 border-t border-white/5 space-y-0.5">
            <Link
              to="/loja"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:bg-white/5"
            >
              <ArrowLeft size={14} />
              Ver loja (clientes)
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto hide-scrollbar safe-top safe-bottom">
          <Outlet />
        </main>
      </div>
    </>
  )
}
