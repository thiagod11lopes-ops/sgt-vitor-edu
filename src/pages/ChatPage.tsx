import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Trash2, History } from 'lucide-react'
import { useChat } from '@/features/chat/useChat'
import { ChatMessage, StreamingMessage } from '@/components/chat/ChatMessage'
import { ChatInput } from '@/components/chat/ChatInput'
import { QuickQuestions } from '@/components/chat/QuickQuestions'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { UserStatusButton } from '@/components/layout/UserStatusButton'
import { PremiumConsultingFab } from '@/components/layout/PremiumConsultingFab'
import { Badge } from '@/components/ui/Badge'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuthContext } from '@/contexts/AuthContext'
import { getPersonalizedGreeting } from '@/features/profile-personalization/personalizationService'

export function ChatPage() {
  const {
    messages,
    isStreaming,
    streamingContent,
    streamingSources,
    sendMessage,
    clearChat,
    canAskQuestion,
    personalization,
  } = useChat()

  const { plan } = useSubscription()
  const { user } = useAuthContext()
  const scrollRef = useRef<HTMLDivElement>(null)

  const greeting = getPersonalizedGreeting(personalization, user?.displayName?.split(' ')[0] ?? 'Aluno')

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async (text: string) => {
    await sendMessage(text)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="glass-strong safe-top px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gradient">Sgt Vitor IA</h1>
            <p className="text-[10px] text-text-muted truncate">
              {personalization.knowledgeLevel} · IA personalizada
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Link to="/historico" className="p-2 rounded-lg hover:bg-white/5 text-text-muted">
            <History size={16} />
          </Link>
          <NotificationPanel />
          <div className="flex items-center gap-1.5">
            <Badge variant={plan === 'free' ? 'default' : 'premium'}>
              {plan === 'free' ? 'Free' : plan === 'premium' ? 'Premium' : 'Plus'}
            </Badge>
            <UserStatusButton compact />
          </div>
          {messages.length > 0 && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={clearChat} className="p-2 rounded-lg hover:bg-white/5 text-text-muted">
              <Trash2 size={16} />
            </motion.button>
          )}
        </div>
      </header>

      <div className="flex justify-end px-4 py-1.5 shrink-0">
        <PremiumConsultingFab inline />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar min-h-0 px-0 pt-2 pb-3 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-4 text-center">
            <div className="w-16 h-16 rounded-2xl gradient-accent mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Shield size={28} className="text-white" />
            </div>
            <h2 className="text-lg font-bold mb-1">Sgt Vitor IA</h2>
            <p className="text-sm text-text-secondary mb-4 max-w-xs mx-auto">{greeting}</p>

            <QuickQuestions onSelect={handleSend} />
          </motion.div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isStreaming && <StreamingMessage content={streamingContent} sources={streamingSources} />}

        {messages.length > 0 && !isStreaming && <QuickQuestions onSelect={handleSend} />}
      </div>

      <div className="shrink-0 px-4 pt-3 pb-6 max-w-lg w-full mx-auto">
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          canAsk={canAskQuestion}
        />
      </div>
    </div>
  )
}
