import { motion } from 'framer-motion'
import { QUICK_QUESTIONS } from '@/features/chat/quickQuestions'
import { Zap } from 'lucide-react'

interface QuickQuestionsProps {
  onSelect: (prompt: string) => void
}

export function QuickQuestions({ onSelect }: QuickQuestionsProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={16} className="text-accent" />
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Dúvidas Rápidas
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map((q, i) => (
          <motion.button
            key={q.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(q.prompt)}
            className="glass rounded-full px-3.5 py-2 text-xs text-text-secondary hover:text-accent hover:border-accent/30 transition-colors border border-transparent"
          >
            {q.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
