import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { hasAdminAccess } from '@/features/admin/adminAuthService'

export function AdminGuard() {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-primary">
        <p className="text-sm text-text-muted">Carregando...</p>
      </div>
    )
  }

  if (!hasAdminAccess(user?.role)) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
