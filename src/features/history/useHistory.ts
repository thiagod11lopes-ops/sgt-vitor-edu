import { useState, useEffect, useCallback } from 'react'
import type { HistoryEntry, HistoryMark } from '@/types'
import {
  loadHistory,
  addHistoryEntry,
  markHistoryEntry,
  generateWeeklySummary,
  extractTopic,
} from './historyService'
import { useAuthContext } from '@/contexts/AuthContext'

export function useHistory() {
  const { user } = useAuthContext()
  const uid = user?.uid ?? 'demo-user'
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [weeklySummary, setWeeklySummary] = useState(generateWeeklySummary(uid))

  useEffect(() => {
    setEntries(loadHistory(uid))
    setWeeklySummary(generateWeeklySummary(uid))
  }, [uid])

  const saveQuestion = useCallback(
    (question: string, answer: string, sources?: HistoryEntry['sources']) => {
      const entry = addHistoryEntry(uid, {
        question,
        answer,
        sources,
        timestamp: new Date().toISOString(),
        mark: null,
        topic: extractTopic(question),
      })
      setEntries((prev) => [entry, ...prev])
      setWeeklySummary(generateWeeklySummary(uid))
      return entry
    },
    [uid]
  )

  const toggleMark = useCallback(
    (id: string, mark: HistoryMark) => {
      const updated = markHistoryEntry(uid, id, mark)
      setEntries(updated)
    },
    [uid]
  )

  const refreshSummary = useCallback(() => {
    setWeeklySummary(generateWeeklySummary(uid))
  }, [uid])

  return {
    entries,
    weeklySummary,
    saveQuestion,
    toggleMark,
    refreshSummary,
    important: entries.filter((e) => e.mark === 'important'),
    studyLater: entries.filter((e) => e.mark === 'study_later'),
  }
}
