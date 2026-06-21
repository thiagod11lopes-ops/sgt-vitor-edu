import { Routes, Route, Navigate } from 'react-router-dom'
import { getDeploymentSurface } from '@/config/deployment'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { AdminShell } from '@/components/admin/AdminShell'
import { HomeRoute } from '@/components/routing/HomeRoute'
import { LibraryPage } from '@/pages/LibraryPage'
import { SimulationsPage } from '@/pages/SimulationsPage'
import { VideosPage } from '@/pages/VideosPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { ConsultingPage } from '@/pages/ConsultingPage'
import { StorePage } from '@/pages/StorePage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminVideosPage } from '@/pages/admin/AdminVideosPage'
import { AdminLibraryPage } from '@/pages/admin/AdminLibraryPage'
import { AdminConsultingPage } from '@/pages/admin/AdminConsultingPage'
import { StoreAdminGuard } from '@/components/store-admin/StoreAdminGuard'
import { StoreAdminLayout } from '@/components/store-admin/StoreAdminLayout'
import { StoreAdminLoginPage } from '@/pages/store-admin/StoreAdminLoginPage'
import { StoreAdminProductsPage } from '@/pages/store-admin/StoreAdminProductsPage'
import { StoreAdminOrdersPage } from '@/pages/store-admin/StoreAdminOrdersPage'

function MainAppRoutes() {
  return (
    <Route element={<AppLayout />}>
      <Route index element={<HomeRoute />} />
      <Route path="biblioteca" element={<LibraryPage />} />
      <Route path="simulados" element={<SimulationsPage />} />
      <Route path="videos" element={<VideosPage />} />
      <Route path="loja" element={<StorePage />} />
      <Route path="progresso" element={<ProgressPage />} />
      <Route path="historico" element={<HistoryPage />} />
      <Route path="consultoria" element={<ConsultingPage />} />
      <Route path="perfil" element={<ProfilePage />} />
    </Route>
  )
}

function SystemAdminRoutes() {
  return (
    <>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="videos" element={<AdminVideosPage />} />
            <Route path="biblioteca" element={<AdminLibraryPage />} />
            <Route path="consultoria" element={<AdminConsultingPage />} />
          </Route>
        </Route>
      </Route>
    </>
  )
}

function StoreAdminRoutes() {
  return (
    <>
      <Route path="/loja-admin/login" element={<StoreAdminLoginPage />} />
      <Route element={<StoreAdminGuard />}>
        <Route element={<StoreAdminLayout />}>
          <Route path="/loja-admin" element={<StoreAdminProductsPage />} />
          <Route path="/loja-admin/pedidos" element={<StoreAdminOrdersPage />} />
        </Route>
      </Route>
    </>
  )
}

export function AppRoutes() {
  const surface = getDeploymentSurface()

  if (surface === 'system-admin') {
    return (
      <Routes>
        {SystemAdminRoutes()}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    )
  }

  if (surface === 'store-admin') {
    return (
      <Routes>
        {StoreAdminRoutes()}
        <Route path="*" element={<Navigate to="/loja-admin/login" replace />} />
      </Routes>
    )
  }

  if (surface === 'app') {
    return (
      <Routes>
        {MainAppRoutes()}
        <Route path="*" element={<Navigate to="/perfil" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {MainAppRoutes()}
      {SystemAdminRoutes()}
      {StoreAdminRoutes()}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
