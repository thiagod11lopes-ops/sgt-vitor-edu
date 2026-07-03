import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  hasPendingAdminGoogleRedirect,
  resolveAdminGoogleRedirectLogin,
} from '@/features/admin/adminAuthService'

/**
 * No PWA (Safari/iOS), o Google OAuth costuma voltar para a start_url (/)
 * em vez de /admin/login. Este gate processa o redirect antes de renderizar o app.
 */
export function AppAdminRedirectGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [blocking, setBlocking] = useState(() => hasPendingAdminGoogleRedirect())

  useEffect(() => {
    if (!blocking) return

    let cancelled = false
    void (async () => {
      const result = await resolveAdminGoogleRedirectLogin('system')
      if (cancelled) return

      if (result?.ok) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/admin/login', { replace: true })
      }
      setBlocking(false)
    })()

    return () => {
      cancelled = true
    }
  }, [blocking, navigate])

  if (blocking) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-bg-primary safe-top safe-bottom">
        <p className="text-sm text-text-muted px-6 text-center">
          Concluindo login administrativo…
        </p>
      </div>
    )
  }

  return <>{children}</>
}
