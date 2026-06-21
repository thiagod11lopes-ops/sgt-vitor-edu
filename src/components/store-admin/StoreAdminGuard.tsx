import { Navigate, Outlet } from 'react-router-dom'
import { hasStoreAdminAccess } from '@/features/store/storeAdminAuthService'

export function StoreAdminGuard() {
  if (!hasStoreAdminAccess()) {
    return <Navigate to="/loja-admin/login" replace />
  }

  return <Outlet />
}
