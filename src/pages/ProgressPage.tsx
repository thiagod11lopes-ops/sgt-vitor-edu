import { motion } from 'framer-motion'
import { TrendingUp, Target, Brain, BookOpen, Award } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePersonalization } from '@/contexts/PersonalizationContext'
import { buildLearningDashboard, LEVEL_LABELS, DAY_LABELS } from '@/features/learning-dashboard/dashboardService'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function ProgressPage() {
  const { user } = useAuthContext()
  const { personalization } = usePersonalization()
  const uid = user?.uid ?? 'demo-user'
  const data = buildLearningDashboard(uid, personalization.knowledgeLevel)

  const maxEvolution = Math.max(...data.weeklyEvolution, 1)

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar pb-8">
      <header className="glass-strong safe-top px-4 py-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          Seu Progresso
        </h1>
        <p className="text-xs text-text-muted mt-1">Dashboard de evolução de aprendizado</p>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Score ring */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass rounded-3xl p-6 text-center"
        >
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${data.learningScore * 2.64} 264`}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#0a0a0f" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-accent">{data.learningScore}</span>
              <span className="text-[9px] text-text-muted">pontos</span>
            </div>
          </div>
          <Badge variant="accent">{LEVEL_LABELS[data.currentLevel]}</Badge>
          <p className="text-xs text-text-secondary mt-2">
            {data.streakDays} dias de sequência · {data.questionsThisWeek} perguntas esta semana
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Brain, label: 'Perguntas/semana', value: data.questionsThisWeek },
            { icon: Target, label: 'Simulados', value: data.simulationsCompleted },
            { icon: BookOpen, label: 'Temas estudados', value: data.topTopics.length },
            { icon: Award, label: 'Sequência', value: `${data.streakDays}d` },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="!p-3 text-center">
                <stat.icon size={16} className="text-accent mx-auto mb-1" />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[9px] text-text-muted">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly chart */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-4">Evolução semanal</h3>
          <div className="flex items-end justify-between gap-1 h-24">
            {data.weeklyEvolution.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / maxEvolution) * 100}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="w-full gradient-accent rounded-t-md min-h-[4px]"
                />
                <span className="text-[8px] text-text-muted">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top topics */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-3">Assuntos mais estudados</h3>
          {data.topTopics.length === 0 ? (
            <p className="text-xs text-text-muted">Faça perguntas no chat para ver seus temas aqui.</p>
          ) : (
            <div className="space-y-2">
              {data.topTopics.map((t, i) => (
                <div key={t.topic} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-accent w-4">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{t.topic}</p>
                    <div className="h-1 bg-white/8 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full gradient-accent rounded-full"
                        style={{ width: `${(t.count / (data.topTopics[0]?.count ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-text-muted">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
