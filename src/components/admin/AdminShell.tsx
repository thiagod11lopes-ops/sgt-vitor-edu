import { Outlet } from 'react-router-dom'

/** Shell mínimo para rotas admin (fora do AppLayout / bottom nav). */
export function AdminShell({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <div className="app-background" aria-hidden="true" />
      <div className="app-background-overlay" aria-hidden="true" />
      <div className="relative z-10 min-h-dvh">{children ?? <Outlet />}</div>
    </>
  )
}
