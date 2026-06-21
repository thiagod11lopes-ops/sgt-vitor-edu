import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ShoppingBag, LogIn, ArrowLeft } from 'lucide-react'
import { loginStoreAdmin } from '@/features/store/storeAdminAuthService'
import { Button } from '@/components/ui/Button'
import { AdminShell } from '@/components/admin/AdminShell'

export function StoreAdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (await loginStoreAdmin(password)) {
        navigate('/loja-admin', { replace: true })
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-center mb-1">Admin da Loja</h1>
          <p className="text-xs text-text-muted text-center mb-6">Gestão de produtos e pedidos — acesso separado</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-[10px] text-text-muted mb-1 block">Senha da loja</span>
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
              Entrar
            </Button>
          </form>

          <p className="text-[10px] text-text-muted text-center mt-4">
            Demo: senha padrão <strong className="text-text-secondary">lojastgt2024</strong>
          </p>

          <Link
            to="/loja"
            className="mt-4 flex items-center justify-center gap-1 text-[11px] text-accent hover:underline"
          >
            <ArrowLeft size={12} />
            Voltar à loja
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
