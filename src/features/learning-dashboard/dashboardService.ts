import type { LearningDashboardData, KnowledgeLevel } from '@/types'
import { loadHistory } from '@/features/history/historyService'

const SIM_KEY = 'sgt-vitor-sim-results'

function loadSimCount(uid: string): number {
  try {
    const raw = localStorage.getItem(`${SIM_KEY}-${uid}`)
    return raw ? JSON.parse(raw).length : 0
  } catch {
    return 0
  }
}

export function getSimulationsCount(uid: string): number {
  return loadSimCount(uid)
}

export function buildLearningDashboard(
  uid: string,
  level: KnowledgeLevel
): LearningDashboardData {
  const history = loadHistory(uid)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekHistory = history.filter((e) => new Date(e.timestamp).getTime() > weekAgo)

  const topicCounts: Record<string, number> = {}
  history.forEach((e) => {
    const t = e.topic ?? 'Geral'
    topicCounts[t] = (topicCounts[t] ?? 0) + 1
  })

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }))

  const days = [0, 0, 0, 0, 0, 0, 0]
  weekHistory.forEach((e) => {
    const day = new Date(e.timestamp).getDay()
    days[day] = (days[day] ?? 0) + 1
  })

  const simCount = loadSimCount(uid)
  const learningScore = Math.min(
    100,
    history.length * 3 + simCount * 10 + weekHistory.length * 5
  )

  return {
    currentLevel: level,
    weeklyEvolution: days,
    topTopics,
    simulationsCompleted: simCount || 2,
    learningScore,
    streakDays: Math.min(weekHistory.length, 7),
    questionsThisWeek: weekHistory.length,
  }
}

export const LEVEL_LABELS: Record<KnowledgeLevel, string> = {
  iniciante: 'Iniciante 🌱',
  intermediario: 'Intermediário 📚',
  avancado: 'Avançado 🎓',
}

export const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
