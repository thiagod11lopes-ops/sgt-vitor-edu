import type { UserPersonalization, KnowledgeLevel, UserGoal } from '@/types'
import { GOAL_OPTIONS, KNOWLEDGE_LEVEL_OPTIONS } from '@/features/onboarding/onboardingData'

export interface AIProfileContext {
  level: KnowledgeLevel
  goal: UserGoal
  style: 'simple' | 'balanced' | 'technical'
  depth: 'detailed' | 'moderate' | 'direct'
  includeExamples: boolean
  explanationFrequency: 'high' | 'medium' | 'low'
  preferredFormats: string[]
  goalLabel: string
  levelLabel: string
}

export function buildAIProfileContext(personalization: UserPersonalization): AIProfileContext {
  const level = personalization.knowledgeLevel
  const goalLabel = GOAL_OPTIONS.find((g) => g.id === personalization.mainGoal)?.label ?? 'Geral'
  const levelLabel = KNOWLEDGE_LEVEL_OPTIONS.find((l) => l.id === level)?.label ?? 'Iniciante'

  const styleMap: Record<KnowledgeLevel, AIProfileContext['style']> = {
    iniciante: 'simple',
    intermediario: 'balanced',
    avancado: 'technical',
  }

  const depthMap: Record<KnowledgeLevel, AIProfileContext['depth']> = {
    iniciante: 'detailed',
    intermediario: 'moderate',
    avancado: 'direct',
  }

  const explanationMap: Record<KnowledgeLevel, AIProfileContext['explanationFrequency']> = {
    iniciante: 'high',
    intermediario: 'medium',
    avancado: 'low',
  }

  const formatLabels: Record<string, string> = {
    texto: 'textos e explicações escritas',
    videos: 'vídeos educacionais',
    simulados: 'simulados práticos',
    resumos: 'resumos rápidos',
  }

  return {
    level,
    goal: personalization.mainGoal,
    style: styleMap[level],
    depth: depthMap[level],
    includeExamples: level !== 'avancado',
    explanationFrequency: explanationMap[level],
    preferredFormats: personalization.learningPreferences.map((p) => formatLabels[p] ?? p),
    goalLabel,
    levelLabel,
  }
}

export function getContentSuggestions(personalization: UserPersonalization) {
  const suggestions: { type: string; label: string; path: string }[] = []

  if (personalization.learningPreferences.includes('simulados')) {
    suggestions.push({ type: 'simulado', label: 'Simulado CAC — Fundamentos', path: '/simulados' })
  }
  if (personalization.learningPreferences.includes('videos')) {
    suggestions.push({ type: 'video', label: 'Vídeo: Posse vs Porte', path: '/videos' })
  }
  if (personalization.learningPreferences.includes('texto')) {
    suggestions.push({ type: 'biblioteca', label: 'Lei 10.826/2003 — Estatuto do Desarmamento', path: '/biblioteca' })
  }
  if (personalization.mainGoal === 'legislacao_cac') {
    suggestions.push({ type: 'biblioteca', label: 'Decreto 9.847/2019 — Regulamentação CAC', path: '/biblioteca' })
  }
  if (personalization.mainGoal === 'seguranca_geral') {
    suggestions.push({ type: 'simulado', label: 'Simulado: Segurança com Armas', path: '/simulados' })
  }

  return suggestions.slice(0, 3)
}

export function getPersonalizedGreeting(personalization: UserPersonalization, name: string) {
  const level = personalization.knowledgeLevel
  if (level === 'iniciante') {
    return 'Fala, beleza? Sou a IA treinada pelo Sgt Vitor — vou te explicar tudo na moral, passo a passo, sem enrolação.'
  }
  if (level === 'avancado') {
    return `E aí, ${name}. Sgt Vitor aqui — resposta direta, base legal na ponta do lápis. Bora.`
  }
  return `Fala, ${name}! Sgt Vitor na área. Tamo junto nesse estudo de legislação e treino.`
}
