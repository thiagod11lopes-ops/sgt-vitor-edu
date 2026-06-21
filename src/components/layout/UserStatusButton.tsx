import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogIn, LogOut, X, Wifi, WifiOff } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { isConfigured } from '@/services/firebase/config'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface UserStatusButtonProps {
  compact?: boolean
}

export function UserStatusButton({ compact = false }: UserStatusButtonProps) {
  const navigate = useNavigate()
  const {
    user,
    isAuthenticated,
    isOnline,
    login,
    register,
    loginDemo,
    loginWithGoogle,
    logout,
    loading,
  } = useAuthContext()

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const statusOnline = isAuthenticated && isOnline
  const statusLabel = !isAuthenticated
    ? 'Offline'
    : !isOnline
      ? 'Sem conexão'
      : 'Online'

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        if (!isConfigured) {
          loginDemo()
          setOpen(false)
          return
        }
        await login(email, password)
      } else {
        await register(email, password, displayName)
      }
      setOpen(false)
      setEmail('')
      setPassword('')
      setDisplayName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao autenticar')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setSubmitting(true)
    try {
      await loginWithGoogle()
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao entrar com Google')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setOpen(false)
    navigate('/perfil', { replace: true })
  }

  if (loading) return null

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center transition-colors',
          compact
            ? 'gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/8 hover:bg-white/12'
            : 'gap-2 rounded-full pl-1.5 pr-3 py-1 border border-white/10 bg-white/5 hover:bg-white/8'
        )}
        aria-label={`Status: ${statusLabel}. Toque para ${isAuthenticated ? 'sair' : 'entrar'}`}
      >
        {compact ? (
          <>
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                statusOnline ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : 'bg-zinc-500'
              )}
            />
            <span className={statusOnline ? 'text-green-400' : 'text-text-secondary'}>{statusLabel}</span>
          </>
        ) : (
          <>
            <div className="relative w-9 h-9 rounded-full gradient-accent flex items-center justify-center shrink-0">
              <User size={16} className="text-white" />
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0f]',
                  statusOnline ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-zinc-500'
                )}
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-semibold leading-tight truncate max-w-[80px]">
                {isAuthenticated ? user?.displayName?.split(' ')[0] ?? 'Usuário' : 'Visitante'}
              </p>
              <p
                className={cn(
                  'text-[9px] leading-tight flex items-center gap-0.5',
                  statusOnline ? 'text-green-400' : 'text-text-muted'
                )}
              >
                {statusOnline ? <Wifi size={9} /> : <WifiOff size={9} />}
                {statusLabel}
              </p>
            </div>
          </>
        )}
      </motion.button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              key="user-status-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setOpen(false)}
            >
              <motion.div
                key="user-status-dialog"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-strong rounded-2xl w-full max-w-sm p-5 border border-white/10 mx-auto"
              >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full gradient-accent flex items-center justify-center">
                    <User size={18} className="text-white" />
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#12121a]',
                        statusOnline ? 'bg-green-400' : 'bg-zinc-500'
                      )}
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">
                      {isAuthenticated ? user?.displayName : 'Entrar na conta'}
                    </h2>
                    <p className="text-[10px] text-text-muted">
                      {isAuthenticated ? user?.email : 'Acesse sua conta Sgt Vitor'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="glass rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Status</span>
                    <span
                      className={cn(
                        'text-xs font-semibold flex items-center gap-1',
                        statusOnline ? 'text-green-400' : 'text-text-muted'
                      )}
                    >
                      {statusOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                      {statusLabel}
                    </span>
                  </div>
                  <Button variant="secondary" onClick={handleLogout} className="w-full">
                    <LogOut size={16} />
                    Sair da conta
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {isConfigured && (
                    <>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="E-mail"
                        className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-text-muted"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-text-muted"
                      />
                      {mode === 'register' && (
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Seu nome"
                          className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-text-muted"
                        />
                      )}
                    </>
                  )}

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || (isConfigured && (!email || !password))}
                    className="w-full"
                  >
                    <LogIn size={16} />
                    {isConfigured
                      ? mode === 'login'
                        ? 'Entrar'
                        : 'Criar conta'
                      : 'Entrar como demo'}
                  </Button>

                  {isConfigured && (
                    <>
                      <Button variant="secondary" onClick={handleGoogle} disabled={submitting} className="w-full">
                        Entrar com Google
                      </Button>
                      <button
                        type="button"
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="w-full text-[11px] text-accent"
                      >
                        {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
                      </button>
                    </>
                  )}

                  {!isConfigured && (
                    <p className="text-[10px] text-text-muted text-center">
                      Modo demo — configure Firebase no .env para login real.
                    </p>
                  )}
                </div>
              )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
