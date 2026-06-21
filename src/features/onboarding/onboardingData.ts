import type {
  KnowledgeLevel,
  UserGoal,
  PriorExperience,
  LearningPreference,
  UserPersonalization,
} from '@/types'

export const KNOWLEDGE_LEVEL_OPTIONS: { id: KnowledgeLevel; label: string; emoji: string; desc: string }[] = [
  { id: 'iniciante', label: 'Iniciante', emoji: '🌱', desc: 'Estou começando agora' },
  { id: 'intermediario', label: 'Intermediário', emoji: '📚', desc: 'Já tenho alguma base' },
  { id: 'avancado', label: 'Avançado', emoji: '🎓', desc: 'Conhecimento técnico e legal' },
]

export const GOAL_OPTIONS: { id: UserGoal; label: string; emoji: string; desc: string }[] = [
  {
    id: 'defesa_educacional',
    label: 'Defesa pessoal',
    emoji: '🛡️',
    desc: 'Contexto educacional e legal apenas',
  },
  { id: 'esporte', label: 'Esporte / Tiro esportivo', emoji: '🎯', desc: 'Prática esportiva e CAC' },
  { id: 'legislacao_cac', label: 'Legislação e CAC', emoji: '⚖️', desc: 'Estudo de leis e regulamentos' },
  { id: 'seguranca_geral', label: 'Segurança geral', emoji: '🔒', desc: 'Conhecimento e boas práticas' },
]

export const EXPERIENCE_OPTIONS: { id: PriorExperience; label: string; emoji: string }[] = [
  { id: 'nenhuma', label: 'Nenhuma', emoji: '✨' },
  { id: 'basica', label: 'Básica', emoji: '📖' },
  { id: 'profissional', label: 'Profissional / técnica', emoji: '🏅' },
]

export const LEARNING_PREFERENCE_OPTIONS: { id: LearningPreference; label: string; emoji: string }[] = [
  { id: 'texto', label: 'Texto', emoji: '📝' },
  { id: 'videos', label: 'Vídeos', emoji: '🎬' },
  { id: 'simulados', label: 'Simulados', emoji: '🧠' },
  { id: 'resumos', label: 'Resumos rápidos', emoji: '⚡' },
]

export const DEFAULT_PERSONALIZATION: UserPersonalization = {
  onboardingCompleted: false,
  knowledgeLevel: 'iniciante',
  mainGoal: 'legislacao_cac',
  priorExperience: 'nenhuma',
  learningPreferences: ['texto', 'resumos'],
}

export const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Bem-vindo' },
  { id: 'level', title: 'Seu nível' },
  { id: 'goal', title: 'Seu objetivo' },
  { id: 'experience', title: 'Experiência' },
  { id: 'preferences', title: 'Preferências' },
  { id: 'done', title: 'Pronto' },
] as const
