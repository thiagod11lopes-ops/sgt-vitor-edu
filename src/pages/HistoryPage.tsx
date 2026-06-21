import { motion } from 'framer-motion'
import { Star, Bookmark, Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useHistory } from '@/features/history/useHistory'
import { formatDate, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

export function HistoryPage() {
  const { entries, weeklySummary, toggleMark, important, studyLater, refreshSummary } = useHistory()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tab, setTab] = useState<'all' | 'important' | 'later'>('all')

  const displayed =
    tab === 'important' ? important : tab === 'later' ? studyLater : entries

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar pb-8">
      <header className="glass-strong safe-top px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Brain size={20} className="text-accent" />
          Seu resumo de aprendizado
        </h1>
      </header>

      {/* Weekly Summary */}
      <div className="px-4 py-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 border border-accent/20"
        >
          <div className="flex items-center justify-between mb-2">
            <Badge variant="accent">Resumo semanal</Badge>
            <button onClick={refreshSummary} className="text-[10px] text-accent">
              Atualizar
            </button>
          </div>
          <p
            className="text-xs text-text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: weeklySummary.summaryText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-accent">$1</strong>'),
            }}
          />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="glass rounded-xl p-2">
              <p className="text-lg font-bold text-accent">{weeklySummary.topicsStudied.length}</p>
              <p className="text-[9px] text-text-muted">Temas</p>
            </div>
            <div className="glass rounded-xl p-2">
              <p className="text-lg font-bold text-accent">{weeklySummary.totalQuestions}</p>
              <p className="text-[9px] text-text-muted">Perguntas</p>
            </div>
            <div className="glass rounded-xl p-2">
              <p className="text-lg font-bold text-accent">{important.length}</p>
              <p className="text-[9px] text-text-muted">Importantes</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2 mb-3">
        {(
          [
            { id: 'all', label: 'Todas' },
            { id: 'important', label: '⭐ Importantes' },
            { id: 'later', label: '📌 Estudar depois' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              tab === t.id ? 'bg-accent/20 text-accent border border-accent/30' : 'glass text-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* History list */}
      <div className="px-4 space-y-2">
        {displayed.length === 0 && (
          <p className="text-center text-sm text-text-muted py-8">
            Nenhuma pergunta salva ainda. Use o chat IA para começar!
          </p>
        )}
        {displayed.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {entry.topic && (
                    <Badge variant="default" className="mb-1">
                      {entry.topic}
                    </Badge>
                  )}
                  <p className="text-sm font-medium">{truncate(entry.question, 80)}</p>
                  <p className="text-[10px] text-text-muted mt-1">{formatDate(entry.timestamp)}</p>
                </div>
                {expanded === entry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {expanded === entry.id && (
              <div className="px-4 pb-4 border-t border-white/5">
                <p className="text-xs text-text-secondary mt-3 leading-relaxed whitespace-pre-wrap">
                  {entry.answer.slice(0, 500)}
                  {entry.answer.length > 500 ? '…' : ''}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleMark(entry.id, 'important')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] ${
                      entry.mark === 'important' ? 'bg-accent/20 text-accent' : 'glass text-text-muted'
                    }`}
                  >
                    <Star size={12} /> Importante
                  </button>
                  <button
                    onClick={() => toggleMark(entry.id, 'study_later')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] ${
                      entry.mark === 'study_later' ? 'bg-accent/20 text-accent' : 'glass text-text-muted'
                    }`}
                  >
                    <Bookmark size={12} /> Estudar depois
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
