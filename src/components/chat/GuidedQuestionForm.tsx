import { useState } from 'react'
import { motion } from 'framer-motion'
import { DOUBT_TYPES, DOUBT_CONTEXTS, KNOWLEDGE_LEVELS } from '@/features/chat/quickQuestions'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Send } from 'lucide-react'

interface GuidedQuestionFormProps {
  onSubmit: (prompt: string) => void
}

export function GuidedQuestionForm({ onSubmit }: GuidedQuestionFormProps) {
  const [doubtType, setDoubtType] = useState('')
  const [context, setContext] = useState('')
  const [level, setLevel] = useState('')
  const [details, setDetails] = useState('')

  const handleSubmit = () => {
    if (!doubtType || !context || !level) return

    const typeLabel = DOUBT_TYPES.find((t) => t.id === doubtType)?.label ?? doubtType
    const contextLabel = DOUBT_CONTEXTS.find((c) => c.id === context)?.label ?? context
    const levelLabel = KNOWLEDGE_LEVELS.find((l) => l.id === level)?.label ?? level

    const prompt = `[Dúvida Guiada]
Tipo: ${typeLabel}
Contexto: ${contextLabel}
Nível: ${levelLabel}
${details ? `Detalhes: ${details}` : ''}

Por favor, responda com base nos documentos oficiais, citando fontes.`

    onSubmit(prompt)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 pb-2"
    >
      <GlassPanel className="p-4 space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Tipo de dúvida
          </label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {DOUBT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setDoubtType(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                  doubtType === t.id
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'glass text-text-secondary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Contexto
          </label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {DOUBT_CONTEXTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setContext(c.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                  context === c.id
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'glass text-text-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Nível de conhecimento
          </label>
          <div className="flex gap-1.5 mt-1.5">
            {KNOWLEDGE_LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] transition-colors text-center ${
                  level === l.id
                    ? 'bg-accent/20 text-accent border border-accent/30'
                    : 'glass text-text-secondary'
                }`}
              >
                {l.emoji} {l.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Descreva sua dúvida com mais detalhes (opcional)..."
          rows={2}
          className="w-full glass rounded-xl px-3 py-2 text-xs text-text-primary placeholder:text-text-muted resize-none outline-none"
        />

        <Button
          onClick={handleSubmit}
          disabled={!doubtType || !context || !level}
          size="sm"
          className="w-full"
        >
          <Send size={14} />
          Enviar dúvida guiada
        </Button>
      </GlassPanel>
    </motion.div>
  )
}
