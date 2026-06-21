import type { HistoryEntry, HistoryMark, WeeklySummary } from '@/types'

const HISTORY_KEY = 'sgt-vitor-history'

function getKey(uid: string) {
  return `${HISTORY_KEY}-${uid}`
}

export function loadHistory(uid: string): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(getKey(uid))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistory(uid: string, entries: HistoryEntry[]) {
  localStorage.setItem(getKey(uid), JSON.stringify(entries))
}

export function addHistoryEntry(uid: string, entry: Omit<HistoryEntry, 'id'>) {
  const entries = loadHistory(uid)
  const newEntry: HistoryEntry = { ...entry, id: `hist-${Date.now()}` }
  saveHistory(uid, [newEntry, ...entries])
  return newEntry
}

export function markHistoryEntry(uid: string, id: string, mark: HistoryMark) {
  const entries = loadHistory(uid).map((e) =>
    e.id === id ? { ...e, mark: e.mark === mark ? null : mark } : e
  )
  saveHistory(uid, entries)
  return entries
}

export function extractTopic(question: string): string {
  const lower = question.toLowerCase()
  if (lower.includes('cac') || lower.includes('registro')) return 'CAC / Registro'
  if (lower.includes('posse')) return 'Posse'
  if (lower.includes('porte')) return 'Porte'
  if (lower.includes('transporte') || lower.includes('transito')) return 'Transporte'
  if (lower.includes('seguranca') || lower.includes('segurança')) return 'Segurança'
  if (lower.includes('calibre')) return 'Calibres'
  return 'Legislação geral'
}

export function generateWeeklySummary(uid: string): WeeklySummary {
  const entries = loadHistory(uid)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekEntries = entries.filter((e) => new Date(e.timestamp).getTime() > weekAgo)

  const topicCounts: Record<string, number> = {}
  weekEntries.forEach((e) => {
    const topic = e.topic ?? extractTopic(e.question)
    topicCounts[topic] = (topicCounts[topic] ?? 0) + 1
  })

  const topicsStudied = [...new Set(weekEntries.map((e) => e.topic ?? extractTopic(e.question)))]

  const questionCounts: Record<string, number> = {}
  weekEntries.forEach((e) => {
    const q = e.question.slice(0, 60)
    questionCounts[q] = (questionCounts[q] ?? 0) + 1
  })

  const topQuestions = Object.entries(questionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([q]) => q)

  const summaryText =
    weekEntries.length === 0
      ? 'Você ainda não fez perguntas esta semana. Comece pelo chat IA ou experimente um simulado!'
      : `Esta semana você estudou **${topicsStudied.length} tema(s)**: ${topicsStudied.join(', ')}. ` +
        `Suas dúvidas mais frequentes foram sobre ${topQuestions[0] ? `"${topQuestions[0]}"` : 'legislação geral'}. ` +
        `Total de ${weekEntries.length} interação(ões) com a IA.`

  return {
    weekStart: new Date(weekAgo).toISOString(),
    topicsStudied,
    topQuestions,
    totalQuestions: weekEntries.length,
    simulationsDone: 0,
    generatedAt: new Date().toISOString(),
    summaryText,
  }
}

export function getMarkedEntries(uid: string, mark: HistoryMark) {
  return loadHistory(uid).filter((e) => e.mark === mark)
}
