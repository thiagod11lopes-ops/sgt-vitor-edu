import { useEffect, useState } from 'react'
import { Users, Crown, MessageSquare, Video, BookOpen } from 'lucide-react'
import { StatCard } from '@/components/admin/StatCard'
import { getAdminDashboardStats } from '@/features/admin/statsService'
import { getRegisteredUsers } from '@/features/admin/userRegistryService'
import { PLAN_PRICES } from '@/types'
import type { AdminDashboardStats, RegisteredUserRecord } from '@/types'
import { Badge } from '@/components/ui/Badge'

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [users, setUsers] = useState<RegisteredUserRecord[]>([])

  useEffect(() => {
    setStats(getAdminDashboardStats())
    setUsers(getRegisteredUsers())
  }, [])

  if (!stats) return null

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-xl font-bold mb-1">Dashboard</h1>
      <p className="text-xs text-text-muted mb-6">Visão geral da plataforma</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Inscritos" value={stats.totalUsers} sub="usuários registrados" accent="text-accent" />
        <StatCard label="Visitantes hoje" value={stats.visitors.daily} sub="acessos diários" />
        <StatCard label="Visitantes mês" value={stats.visitors.monthly} sub="acumulado mensal" />
        <StatCard label="Visitantes ano" value={stats.visitors.yearly} sub="acumulado anual" />
        <StatCard
          label="Consultoria pendente"
          value={stats.pendingConsulting}
          sub="aguardando resposta"
          accent={stats.pendingConsulting > 0 ? 'text-amber-400' : undefined}
        />
        <StatCard label="Conteúdo" value={`${stats.totalVideos}v · ${stats.totalDocuments}d`} sub="vídeos · documentos" />
      </div>

      <section className="glass rounded-xl p-4 mb-6 border border-white/5">
        <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Crown size={14} className="text-purple-400" />
          Planos ativos
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {(['free', 'premium', 'premium_plus'] as const).map((plan) => (
            <div key={plan} className="glass rounded-lg p-3 text-center">
              <p className="text-[10px] text-text-muted">{PLAN_PRICES[plan].label}</p>
              <p className="text-xl font-bold">{stats.planBreakdown[plan]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-xl p-4 border border-white/5">
        <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
          <Users size={14} className="text-accent" />
          Usuários inscritos
        </h2>
        {users.length === 0 ? (
          <p className="text-xs text-text-muted">Nenhum usuário registrado ainda. Logins aparecem aqui.</p>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.uid} className="flex items-center justify-between glass rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-semibold">{u.displayName}</p>
                  <p className="text-[10px] text-text-muted">{u.email}</p>
                </div>
                <Badge variant={u.plan === 'free' ? 'default' : 'premium'}>
                  {PLAN_PRICES[u.plan].label}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <a href="/admin/videos" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
          <Video size={18} className="text-accent" />
          <span className="text-xs font-medium">Gerenciar vídeos</span>
        </a>
        <a href="/admin/consultoria" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
          <MessageSquare size={18} className="text-amber-400" />
          <span className="text-xs font-medium">Consultoria premium</span>
        </a>
        <a href="/admin/biblioteca" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors">
          <BookOpen size={18} className="text-green-400" />
          <span className="text-xs font-medium">Gerenciar biblioteca</span>
        </a>
      </div>
    </div>
  )
}
