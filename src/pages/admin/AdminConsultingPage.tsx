import { useEffect, useState } from 'react'
import { Send, CheckCircle, Clock, XCircle } from 'lucide-react'
import {
  getAllSessions,
  addExpertReply,
  updateSessionStatus,
  CONSULTING_UPDATED_EVENT,
} from '@/features/admin/consultingAdminService'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { ConsultingSession } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_LABELS = {
  pending: { label: 'Pendente', variant: 'warning' as const, icon: Clock },
  answered: { label: 'Respondida', variant: 'accent' as const, icon: CheckCircle },
  closed: { label: 'Encerrada', variant: 'default' as const, icon: XCircle },
}

export function AdminConsultingPage() {
  const [sessions, setSessions] = useState<ConsultingSession[]>([])
  const [selected, setSelected] = useState<ConsultingSession | null>(null)
  const [reply, setReply] = useState('')

  const refresh = () => {
    const all = getAllSessions()
    setSessions(all)
    if (selected) {
      setSelected(all.find((s) => s.id === selected.id) ?? null)
    }
  }

  useEffect(() => {
    refresh()
    window.addEventListener(CONSULTING_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CONSULTING_UPDATED_EVENT, refresh)
  }, [])

  const handleReply = () => {
    if (!selected || !reply.trim()) return
    addExpertReply(selected.id, reply.trim())
    setReply('')
    refresh()
  }

  const handleClose = (id: string) => {
    updateSessionStatus(id, 'closed')
    refresh()
  }

  return (
    <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4 h-full min-h-[calc(100dvh-2rem)]">
      <div className="md:w-72 shrink-0">
        <h1 className="text-xl font-bold mb-1">Consultoria Premium</h1>
        <p className="text-xs text-text-muted mb-4">Perguntas recebidas dos alunos</p>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto hide-scrollbar">
          {sessions.length === 0 ? (
            <p className="text-xs text-text-muted glass rounded-xl p-4">Nenhuma consultoria recebida ainda.</p>
          ) : (
            sessions.map((s) => {
              const st = STATUS_LABELS[s.status]
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className={cn(
                    'w-full text-left glass rounded-xl p-3 border transition-colors',
                    selected?.id === s.id ? 'border-accent/40 bg-accent/10' : 'border-white/5 hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold truncate">{s.userName}</p>
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </div>
                  <p className="text-[10px] text-text-muted truncate">
                    {s.messages[s.messages.length - 1]?.content}
                  </p>
                  <p className="text-[9px] text-text-muted mt-1">{formatDate(s.updatedAt)}</p>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="flex-1 glass rounded-xl border border-white/5 flex flex-col min-h-0">
        {selected ? (
          <>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{selected.userName}</p>
                <p className="text-[10px] text-text-muted">{selected.userEmail}</p>
              </div>
              {selected.status !== 'closed' && (
                <Button variant="secondary" size="sm" onClick={() => handleClose(selected.id)}>
                  Encerrar
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3">
              {selected.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'rounded-xl px-3 py-2 max-w-[90%] text-xs',
                    msg.role === 'user'
                      ? 'bg-white/8 ml-0 mr-auto'
                      : msg.role === 'expert'
                        ? 'gradient-accent text-white ml-auto mr-0'
                        : 'bg-amber-500/10 text-amber-300 mx-auto text-center'
                  )}
                >
                  {msg.role === 'expert' && msg.expertName && (
                    <p className="text-[9px] opacity-80 mb-0.5">{msg.expertName}</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-[9px] opacity-60 mt-1">{formatDate(msg.timestamp)}</p>
                </div>
              ))}
            </div>

            {selected.status !== 'closed' && (
              <div className="p-4 border-t border-white/5 flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Digite a resposta do Sgt Vitor..."
                  rows={2}
                  className="flex-1 glass rounded-xl px-3 py-2 text-sm outline-none resize-none"
                />
                <Button onClick={handleReply} disabled={!reply.trim()} className="self-end">
                  <Send size={16} />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-xs p-8 text-center">
            Selecione uma consultoria para visualizar e responder
          </div>
        )}
      </div>
    </div>
  )
}
