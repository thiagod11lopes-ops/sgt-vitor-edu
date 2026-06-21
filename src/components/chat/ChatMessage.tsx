import { motion } from 'framer-motion'
import type { ChatMessage as ChatMessageType } from '@/types'
import { SourceCitationCard } from './SourceCitation'
import { AlertTriangle, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^## (.*$)/gm, '<h3 class="text-sm font-bold mt-3 mb-1">$1</h3>')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-accent/50 pl-3 my-2 text-text-muted text-xs italic">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 list-decimal text-sm">$2</li>')
    .replace(/📌 _([^_]+)_/g, '<span class="text-accent text-xs block mt-1">📌 $1</span>')
    .replace(/\n/g, '<br/>')
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex gap-3 px-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
          isUser ? 'bg-accent/20 text-accent' : 'bg-white/8 text-text-secondary'
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={cn('max-w-[85%] min-w-0', isUser ? 'text-right' : 'text-left')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'gradient-accent text-white rounded-br-md'
              : 'glass rounded-bl-md'
          )}
        >
          {message.notFoundInMaterial && (
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-2">
              <AlertTriangle size={14} />
              Não encontrado no material
            </div>
          )}
          <div
            className="prose-chat"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceCitationCard sources={message.sources} />
        )}
      </div>
    </motion.div>
  )
}

export function StreamingMessage({ content, sources }: { content: string; sources: import('@/types').SourceCitation[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 px-4">
      <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center shrink-0">
        <Bot size={16} className="text-text-secondary" />
      </div>
      <div className="max-w-[85%] min-w-0">
        <div className="glass rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
          ) : (
            <div className="flex gap-1 py-1">
              <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
              <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
              <span className="typing-dot w-2 h-2 rounded-full bg-accent" />
            </div>
          )}
        </div>
        {sources.length > 0 && content && <SourceCitationCard sources={sources} />}
      </div>
    </motion.div>
  )
}
