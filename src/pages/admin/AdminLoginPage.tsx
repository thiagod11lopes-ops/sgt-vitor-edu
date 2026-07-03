import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import { loginAdminWithGoogle, resolveAdminGoogleRedirectLogin } from '@/features/admin/adminAuthService'
import { hasPendingAdminGoogleRedirect } from '@/services/firebase/adminFirebaseAuth'
import { isConfigured } from '@/services/firebase/config'
import { AdminShell } from '@/components/admin/AdminShell'
import { AdminGoogleLoginButton } from '@/components/admin/AdminGoogleLoginButton'

export function AdminLoginPage() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (hasPendingAdminGoogleRedirect()) setRedirecting(true)

    void (async () => {
      const result = await resolveAdminGoogleRedirectLogin('system')
      if (cancelled) return
      setRedirecting(false)
      if (!result) return
      if (result.ok) {
        navigate('/admin', { replace: true })
      } else if (result.error) {
        setError(result.error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  if (redirecting) {
    return (
      <AdminShell>
        <div className="min-h-dvh flex items-center justify-center p-4">
          <p className="text-sm text-text-muted">Concluindo login com Google…</p>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="min-h-dvh flex items-center justify-center p-4 safe-top safe-bottom">
        <div className="glass-strong rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-xl">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-4">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-center mb-1">Painel Administrativo</h1>
          <p className="text-xs text-text-muted text-center mb-6">
            Sgt Vitor — entre com a conta Google autorizada
          </p>

          {error && <p className="text-xs text-red-400 text-center mb-3">{error}</p>}

          {isConfigured ? (
            <AdminGoogleLoginButton
              standalone
              onLogin={async () => {
                setError('')
                const result = await loginAdminWithGoogle()
                if (result.redirecting) {
                  setRedirecting(true)
                  return { ok: false }
                }
                if (result.ok) navigate('/admin', { replace: true })
                if (result.error) setError(result.error)
                return { ok: result.ok, error: result.error }
              }}
            />
          ) : (
            <p className="text-xs text-red-400 text-center">
              Firebase não configurado neste ambiente.
            </p>
          )}

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1 text-[11px] text-accent hover:underline"
          >
            <ArrowLeft size={12} />
            Voltar ao aplicativo
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
