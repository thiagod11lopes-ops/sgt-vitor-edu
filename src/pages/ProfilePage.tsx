import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SurfaceLink } from '@/components/routing/SurfaceLink'
import { motion } from 'framer-motion'
import {
  Crown,
  Share2,
  Copy,
  Check,
  Brain,
  MessageSquare,
  Award,
  ChevronRight,
  History,
  Bell,
  GraduationCap,
  TrendingUp,
  Settings,
  ShoppingBag,
  Shield,
} from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useReferral } from '@/hooks/useReferral'
import { usePersonalization } from '@/contexts/PersonalizationContext'
import { useNotifications } from '@/features/notifications/useNotifications'
import { loadHistory } from '@/features/history/historyService'
import { getSimulationsCount } from '@/features/learning-dashboard/dashboardService'
import { Badge } from '@/components/ui/Badge'
import { UserStatusButton } from '@/components/layout/UserStatusButton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProfileAvatarEditor } from '@/components/profile/ProfileAvatarEditor'
import { PLAN_PRICES } from '@/types'
import { GOAL_OPTIONS, KNOWLEDGE_LEVEL_OPTIONS } from '@/features/onboarding/onboardingData'

export function ProfilePage() {
  const { user, isAuthenticated, loading, updateProfilePhoto } = useAuthContext()
  const { plan, questionsUsed, isPremium } = useSubscription()
  const { referralCode, copied, copyLink, shareLink, stats } = useReferral()
  const { personalization, updatePersonalization } = usePersonalization()
  const { enablePush, pushEnabled } = useNotifications()
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const uid = user?.uid ?? 'demo-user'
  const recordStats = [
    { icon: Brain, label: 'Simulados', value: getSimulationsCount(uid) },
    { icon: MessageSquare, label: 'Perguntas IA', value: loadHistory(uid).length },
  ]

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar pb-8">
      <header className="glass-strong safe-top px-4 pt-6 pb-8 text-center">
        <ProfileAvatarEditor
          className="mb-3"
          photoURL={user?.photoURL}
          displayName={user?.displayName}
          uploading={photoUploading}
          error={photoError}
          onSelectFile={async (file) => {
            if (loading) {
              setPhotoError('Aguarde o login carregar…')
              return
            }
            if (!isAuthenticated) {
              setPhotoError('Entre na sua conta pelo botão Online/Offline acima.')
              return
            }
            setPhotoError('')
            setPhotoUploading(true)
            const uploadTask = updateProfilePhoto(file)
            const timeout = new Promise<never>((_, reject) => {
              window.setTimeout(
                () => reject(new Error('O envio demorou demais. Tente uma imagem menor ou verifique a conexão.')),
                25_000,
              )
            })
            try {
              await Promise.race([uploadTask, timeout])
            } catch (error) {
              setPhotoError(error instanceof Error ? error.message : 'Não foi possível salvar a foto.')
            } finally {
              setPhotoUploading(false)
            }
          }}
        />
        <h1 className="text-lg font-bold">{user?.displayName ?? 'Aluno'}</h1>
        <p className="text-xs text-text-muted">{user?.email}</p>
        <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
          <Badge variant={plan === 'free' ? 'default' : 'premium'}>
            {PLAN_PRICES[plan].label}
          </Badge>
          <UserStatusButton compact />
          <Badge variant="accent">{user?.knowledgeLevel ?? 'iniciante'}</Badge>
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/8 hover:bg-white/12 border border-white/10 text-text-secondary hover:text-accent transition-colors shrink-0"
            title="Painel administrativo"
            aria-label="Painel administrativo"
          >
            <Shield size={13} />
          </Link>
        </div>
      </header>

      {/* Quick links */}
      <div className="px-4 pb-2 grid grid-cols-4 gap-2">
        {[
          { to: '/historico', icon: History, label: 'Histórico' },
          { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
          { to: '/loja', icon: ShoppingBag, label: 'Loja' },
          { to: '/consultoria', icon: GraduationCap, label: 'Especialista' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="glass rounded-xl p-2.5 text-center hover:bg-white/6">
            <item.icon size={18} className="text-accent mx-auto mb-1" />
            <span className="text-[9px] text-text-secondary">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Personalization summary */}
      {personalization.onboardingCompleted && (
        <div className="px-4 py-2">
          <Card className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Settings size={14} className="text-accent" />
                Seu perfil de aprendizado
              </h2>
              <button
                onClick={() => updatePersonalization({ onboardingCompleted: false })}
                className="text-[10px] text-accent"
              >
                Editar
              </button>
            </div>
            <div className="space-y-1 text-xs text-text-secondary">
              <p>
                Nível:{' '}
                <strong className="text-accent">
                  {KNOWLEDGE_LEVEL_OPTIONS.find((l) => l.id === personalization.knowledgeLevel)?.label}
                </strong>
              </p>
              <p>
                Objetivo:{' '}
                <strong className="text-accent">
                  {GOAL_OPTIONS.find((g) => g.id === personalization.mainGoal)?.label}
                </strong>
              </p>
              <p>
                Preferências:{' '}
                {personalization.learningPreferences.join(', ')}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Push notifications */}
      <div className="px-4 py-2">
        <Card className="!p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-accent" />
            <div>
              <p className="text-sm font-medium">Notificações push</p>
              <p className="text-[10px] text-text-muted">Legislação, dicas e resumos semanais</p>
            </div>
          </div>
          <Button
            size="sm"
            variant={pushEnabled ? 'secondary' : 'primary'}
            onClick={() => enablePush()}
          >
            {pushEnabled ? 'Ativas' : 'Ativar'}
          </Button>
        </Card>
      </div>

      {/* Registros */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {recordStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="text-center !p-3">
                <stat.icon size={18} className="text-accent mx-auto mb-1" />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-text-muted">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Plans */}
      {!isPremium && (
        <div className="px-4 py-2">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Crown size={16} className="text-purple-400" />
            Planos
          </h2>
          <div className="space-y-3">
            {(Object.entries(PLAN_PRICES) as [keyof typeof PLAN_PRICES, typeof PLAN_PRICES.free][]).map(
              ([key, p]) => (
                <Card
                  key={key}
                  className={`!p-4 ${key !== 'free' ? 'border border-purple-500/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold">{p.label}</h3>
                    {p.price > 0 ? (
                      <span className="text-sm font-bold text-accent">
                        R$ {p.price.toFixed(2)}/mês
                      </span>
                    ) : (
                      <Badge>Atual</Badge>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-text-secondary flex items-center gap-1.5">
                        <Check size={12} className="text-accent shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {key !== 'free' && (
                    <Button variant="premium" size="sm" className="w-full mt-3">
                      Assinar {p.label}
                    </Button>
                  )}
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* Referral */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Share2 size={16} className="text-accent" />
          Indique e Ganhe
        </h2>
        <Card className="!p-4">
          <p className="text-xs text-text-secondary mb-3">
            Compartilhe conteúdo educativo e ganhe recompensas: acesso premium, badges e mais.
          </p>
          <div className="glass rounded-xl px-3 py-2 flex items-center justify-between mb-3">
            <span className="text-sm font-mono font-bold text-accent">{referralCode}</span>
            <button onClick={copyLink} className="p-1.5 rounded-lg hover:bg-white/5">
              {copied ? <Check size={16} className="text-accent" /> : <Copy size={16} className="text-text-muted" />}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div>
              <p className="text-lg font-bold">{stats.totalReferrals}</p>
              <p className="text-[10px] text-text-muted">Indicações</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stats.activeReferrals}</p>
              <p className="text-[10px] text-text-muted">Ativas</p>
            </div>
            <div>
              <p className="text-lg font-bold">#{stats.rank}</p>
              <p className="text-[10px] text-text-muted">Ranking</p>
            </div>
          </div>
          <Button onClick={shareLink} size="sm" className="w-full">
            <Share2 size={14} />
            Compartilhar link
          </Button>
        </Card>
      </div>

      {/* Badges */}
      <div className="px-4 py-2">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Award size={16} className="text-amber-400" />
          Conquistas
        </h2>
        <div className="flex flex-wrap gap-2">
          {(user?.badges ?? []).map((badge) => (
            <Badge key={badge} variant="accent">
              🏅 {badge.replace(/_/g, ' ')}
            </Badge>
          ))}
          <Badge variant="default">🎯 primeiro simulado</Badge>
          <Badge variant="default">📚 leitor assíduo</Badge>
        </div>
      </div>

      {/* Daily usage */}
      {plan === 'free' && (
        <div className="px-4 py-2">
          <Card className="!p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Perguntas hoje</p>
              <p className="text-sm font-bold">{questionsUsed} / 5</p>
            </div>
            <ChevronRight size={16} className="text-text-muted" />
          </Card>
        </div>
      )}

      <div className="px-4 py-4 text-center">
        <SurfaceLink
          surface="system-admin"
          path="/admin/login"
          className="text-[11px] text-text-muted hover:text-accent transition-colors underline-offset-2 hover:underline"
        >
          Painel administrativo
        </SurfaceLink>
      </div>
    </div>
  )
}
