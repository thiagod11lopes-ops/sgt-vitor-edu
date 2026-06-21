import { useState, useCallback } from 'react'
import type { ChatMessage, SourceCitation } from '@/types'
import { streamAIResponse } from '@/services/ai/aiService'
import { useSubscription } from '@/hooks/useSubscription'
import { usePersonalization } from '@/contexts/PersonalizationContext'
import { buildAIProfileContext } from '@/features/profile-personalization/personalizationService'
import { useHistory } from '@/features/history/useHistory'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingSources, setStreamingSources] = useState<SourceCitation[]>([])
  const { canAskQuestion, questionsRemaining } = useSubscription()
  const { personalization } = usePersonalization()
  const { saveQuestion } = useHistory()
  const aiProfile = buildAIProfileContext(personalization)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return false
      if (!canAskQuestion) return false

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsStreaming(true)
      setStreamingContent('')
      setStreamingSources([])

      let fullContent = ''
      let sources: SourceCitation[] = []
      let notFound = false

      const history = messages.map((m) => ({ role: m.role, content: m.content }))

      try {
        for await (const event of streamAIResponse(content, history, aiProfile, personalization)) {
          if (event.type === 'sources') {
            sources = event.data as SourceCitation[]
            setStreamingSources(sources)
          } else if (event.type === 'token') {
            fullContent += event.data as string
            setStreamingContent(fullContent)
          } else if (event.type === 'done') {
            fullContent = event.data as string
            notFound = fullContent.includes('não foi encontrada no material')
          }
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: fullContent,
          sources,
          notFoundInMaterial: notFound,
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMsg])
        saveQuestion(content.trim(), fullContent, sources)
      } catch {
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: 'Ocorreu um erro ao processar sua pergunta. Tente novamente.',
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsStreaming(false)
        setStreamingContent('')
        setStreamingSources([])
      }

      return true
    },
    [isStreaming, canAskQuestion, messages, aiProfile, personalization, saveQuestion]
  )

  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isStreaming,
    streamingContent,
    streamingSources,
    sendMessage,
    clearChat,
    canAskQuestion,
    questionsRemaining,
    aiProfile,
    personalization,
  }
}
