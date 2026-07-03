import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, LogIn, ArrowLeft } from 'lucide-react'
import {
  loginAdmin,
  loginAdminWithGoogle,
  resolveAdminGoogleRedirectLogin,
} from '@/features/admin/adminAuthService'
import { hasPendingAdminGoogleRedirect } from '@/services/firebase/adminFirebaseAuth'
import { Button } from '@/components/ui/Button'
import { AdminShell } from '@/components/admin/AdminShell'
import { AdminGoogleLoginButton } from '@/components/admin/AdminGoogleLoginButton'

export function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await loginAdmin(password)
    if (result.ok) {
      navigate('/admin', { replace: true })
    } else {
      setError('Senha incorreta. Use sgtvitor2024 (padrão) ou a senha definida no deploy.')
    }
    setLoading(false)
  }

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
          <p className="text-xs text-text-muted text-center mb-6">Sgt Vitor — acesso restrito</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-[10px] text-text-muted mb-1 block">Senha de administrador</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                autoComplete="current-password"
                className="w-full glass rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted border border-white/10"
              />
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn size={16} />
              Entrar com senha
            </Button>
          </form>

          <AdminGoogleLoginButton
            disabled={loading}
            onLogin={async () => {
              const result = await loginAdminWithGoogle()
              if (result.redirecting) {
                setRedirecting(true)
                return { ok: false }
              }
              if (result.ok) navigate('/admin', { replace: true })
              return { ok: result.ok, error: result.error }
            }}
          />

          <p className="text-[10px] text-text-muted text-center mt-4">
            Senha padrão: <strong className="text-text-secondary">sgtvitor2024</strong>
            {' · '}
            ou use o Google autorizado
          </p>

          <Link
            to="/"
            className="mt-4 flex items-center justify-center gap-1 text-[11px] text-accent hover:underline"
          >
            <ArrowLeft size={12} />
            Voltar ao aplicativo
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
