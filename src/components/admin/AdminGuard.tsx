import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import {
  isAdminSessionActive,
  syncAdminSessionFromFirebase,
} from '@/features/admin/adminAuthService'

export function AdminGuard() {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading')

  useEffect(() => {
    let cancelled = false

    void (async () => {
      if (isAdminSessionActive()) {
        if (!cancelled) setStatus('allowed')
        return
      }

      const synced = await syncAdminSessionFromFirebase('system')
      if (!cancelled) setStatus(synced ? 'allowed' : 'denied')
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg-primary">
        <p className="text-sm text-text-muted">Verificando acesso…</p>
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}
