import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  canAsk?: boolean
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Faça sua pergunta...',
  canAsk = true,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }, [value])

  const handleSubmit = () => {
    if (!value.trim() || disabled || !canAsk) return
    onSend(value)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full">
      {!canAsk && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl px-3 py-2 mb-2 flex items-center gap-2 text-xs text-amber-400"
        >
          <Lock size={14} />
          Limite diário atingido. Faça upgrade para Premium.
        </motion.div>
      )}

      <div className="glass-strong rounded-2xl p-2 flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canAsk ? placeholder : 'Limite atingido...'}
            disabled={disabled || !canAsk}
            rows={1}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none outline-none px-3 py-2.5 max-h-[120px]"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          disabled={!value.trim() || disabled || !canAsk}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
            value.trim() && canAsk && !disabled
              ? 'gradient-accent text-white shadow-lg shadow-blue-500/20'
              : 'bg-white/5 text-text-muted'
          )}
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  )
}
