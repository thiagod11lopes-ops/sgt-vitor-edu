import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, GraduationCap, Circle, Clock, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  loadConsultingMessages,
  sendUserConsultingMessage,
  EXPERT_STATUS,
  CONSULTING_UPDATED_EVENT,
} from '@/features/premium-consulting/consultingService'
import { useAuthContext } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { ConsultingMessage } from '@/types'

export function ConsultingPage() {
  const { user } = useAuthContext()
  const { isPremium } = useSubscription()
  const uid = user?.uid ?? 'demo-user'
  const userName = user?.displayName ?? 'Visitante'
  const userEmail = user?.email ?? ''
  const [messages, setMessages] = useState<ConsultingMessage[]>(() => loadConsultingMessages(uid))
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const refresh = () => setMessages(loadConsultingMessages(uid))

  useEffect(() => {
    refresh()
    window.addEventListener(CONSULTING_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CONSULTING_UPDATED_EVENT, refresh)
  }, [uid])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const pendingReply =
    messages.some((m) => m.role === 'user') && !messages.some((m) => m.role === 'expert')

  const send = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    sendUserConsultingMessage(uid, userName, userEmail, input.trim())
    setInput('')
    refresh()
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      <header className="glass-strong safe-top px-4 py-3 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-sm font-bold flex items-center gap-2">
              <GraduationCap size={16} className="text-purple-400" />
              Fale com um Especialista
            </h1>
            <p className="text-[10px] text-text-muted">Consultoria Premium — histórico separado da IA</p>
          </div>
          <Badge variant={isPremium ? 'premium' : 'default'}>
            {isPremium ? 'Premium' : 'Demo'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="glass rounded-xl p-2">
            <Circle size={8} className="text-green-400 mx-auto mb-1" fill="currentColor" />
            <p className="text-[9px] text-text-muted">Status</p>
            <p className="text-[10px] font-semibold text-green-400">Online</p>
          </div>
          <div className="glass rounded-xl p-2">
            <Clock size={12} className="text-accent mx-auto mb-1" />
            <p className="text-[9px] text-text-muted">Resposta</p>
            <p className="text-[10px] font-semibold">~{EXPERT_STATUS.avgResponseMinutes} min</p>
          </div>
          <div className="glass rounded-xl p-2">
            <Users size={12} className="text-accent mx-auto mb-1" />
            <p className="text-[9px] text-text-muted">Atendimentos</p>
            <p className="text-[10px] font-semibold">{EXPERT_STATUS.totalAttendances}</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap size={40} className="text-purple-400 mx-auto mb-3" />
            <p className="text-sm font-medium">Consultoria Premium</p>
            <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
              Manda sua dúvida complexa pro Sgt Vitor analisar pessoalmente. Resposta prioritária pra assinantes Premium.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'gradient-premium text-white rounded-br-md'
                  : msg.role === 'system'
                    ? 'glass text-amber-300 text-center mx-auto border border-amber-500/20'
                    : 'glass rounded-bl-md border-l-2 border-purple-400'
              }`}
            >
              {msg.role === 'expert' && (
                <p className="text-[10px] font-semibold text-purple-400 mb-1">
                  🧑‍🏫 {msg.expertName}
                </p>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {pendingReply && messages.some((m) => m.role === 'user') && !messages.some((m) => m.role === 'expert') && (
          <div className="flex gap-1 px-4 py-2 items-center">
            <span className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
            <span className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
            <span className="typing-dot w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-[10px] text-text-muted ml-2">Aguardando Sgt Vitor...</span>
          </div>
        )}
      </div>

      <div className="glass-strong px-4 py-3 safe-bottom shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva sua dúvida complexa..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-text-muted py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <Button variant="premium" size="sm" onClick={send} disabled={!input.trim() || sending}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
