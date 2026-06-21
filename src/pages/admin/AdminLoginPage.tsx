import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, LogIn, ArrowLeft } from 'lucide-react'
import { loginAdmin } from '@/features/admin/adminAuthService'
import { Button } from '@/components/ui/Button'
import { AdminShell } from '@/components/admin/AdminShell'

export function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (await loginAdmin(password)) {
        navigate('/admin', { replace: true })
      } else {
        setError('Senha incorreta. Tente novamente.')
      }
    } catch {
      setError('Não foi possível autenticar no Firebase. Verifique Authentication no console.')
    } finally {
      setLoading(false)
    }
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
              Entrar no painel
            </Button>
          </form>

          <p className="text-[10px] text-text-muted text-center mt-4">
            Demo: senha padrão <strong className="text-text-secondary">sgtvitor2024</strong>
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
