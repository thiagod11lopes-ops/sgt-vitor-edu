import { Navigate, Outlet } from 'react-router-dom'
import { isAdminSessionActive } from '@/features/admin/adminAuthService'

export function AdminGuard() {
  if (!isAdminSessionActive()) {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
