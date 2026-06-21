export type SubscriptionPlan = 'free' | 'premium' | 'premium_plus'

export type UserRole = 'user' | 'admin'

export type KnowledgeLevel = 'iniciante' | 'intermediario' | 'avancado'

export type UserGoal =
  | 'defesa_educacional'
  | 'esporte'
  | 'legislacao_cac'
  | 'seguranca_geral'

export type PriorExperience = 'nenhuma' | 'basica' | 'profissional'

export type LearningPreference = 'texto' | 'videos' | 'simulados' | 'resumos'

export type HistoryMark = 'important' | 'study_later' | null

export type NotificationType =
  | 'legislacao'
  | 'biblioteca'
  | 'dica_dia'
  | 'resumo_semanal'
  | 'simulado'

export type DoubtContext = 'civil' | 'esportivo' | 'colecao' | 'seguranca'

export type DocumentCategory = 'legislacao' | 'seguranca' | 'normas'

export interface UserPersonalization {
  onboardingCompleted: boolean
  knowledgeLevel: KnowledgeLevel
  mainGoal: UserGoal
  priorExperience: PriorExperience
  learningPreferences: LearningPreference[]
  completedAt?: string
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  role?: UserRole
  plan: SubscriptionPlan
  knowledgeLevel: KnowledgeLevel
  personalization?: UserPersonalization
  referralCode: string
  referredBy?: string
  dailyQuestionsUsed: number
  dailyQuestionsReset: string
  totalQuestions: number
  badges: string[]
  createdAt: string
  fcmToken?: string
  notificationsEnabled?: boolean
}

export interface SourceCitation {
  documentId: string
  documentTitle: string
  page?: number
  article?: string
  excerpt: string
  relevanceScore: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: SourceCitation[]
  timestamp: string
  notFoundInMaterial?: boolean
  mark?: HistoryMark
  topic?: string
}

export interface HistoryEntry {
  id: string
  question: string
  answer: string
  sources?: SourceCitation[]
  timestamp: string
  mark: HistoryMark
  topic?: string
}

export interface WeeklySummary {
  weekStart: string
  topicsStudied: string[]
  topQuestions: string[]
  totalQuestions: number
  simulationsDone: number
  generatedAt: string
  summaryText: string
}

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

export interface OCRAnalysisResult {
  id: string
  detectedText: string
  identifiedItem?: string
  educationalFunction: string
  legalContext: string
  safetyNotes: string
  ragReference?: string
  confidence: number
  analyzedAt: string
}

export interface ConsultingMessage {
  id: string
  role: 'user' | 'expert' | 'system'
  content: string
  timestamp: string
  expertName?: string
}

export type ConsultingSessionStatus = 'pending' | 'answered' | 'closed'

export interface ConsultingSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  status: ConsultingSessionStatus
  messages: ConsultingMessage[]
  createdAt: string
  updatedAt: string
}

export interface RegisteredUserRecord {
  uid: string
  displayName: string
  email: string
  plan: SubscriptionPlan
  createdAt: string
  lastSeen: string
}

export interface AdminDashboardStats {
  totalUsers: number
  planBreakdown: Record<SubscriptionPlan, number>
  visitors: { daily: number; monthly: number; yearly: number }
  pendingConsulting: number
  totalVideos: number
  totalDocuments: number
}

export interface LearningDashboardData {
  currentLevel: KnowledgeLevel
  weeklyEvolution: number[]
  topTopics: { topic: string; count: number }[]
  simulationsCompleted: number
  learningScore: number
  streakDays: number
  questionsThisWeek: number
}

export interface Document {
  id: string
  title: string
  category: DocumentCategory
  description: string
  pages: number
  url: string
  isPremium: boolean
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  sourceDocumentId: string
  sourceReference: string
  difficulty: KnowledgeLevel
  category: DocumentCategory
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
  isPremium: boolean
  timeLimit?: number
}

export interface QuizResult {
  quizId: string
  score: number
  total: number
  percentage: number
  completedAt: string
  answers: number[]
}

export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  youtubeId?: string
  instagramUrl?: string
  playlist: 'seguranca' | 'legislacao' | 'treinamento'
  isPremium: boolean
  duration?: string
}

export interface QuickQuestion {
  id: string
  label: string
  prompt: string
}

export interface ReferralStats {
  code: string
  totalReferrals: number
  activeReferrals: number
  rank: number
  rewards: string[]
}

export interface StudyProgress {
  documentsRead: number
  quizzesCompleted: number
  averageScore: number
  streakDays: number
  level: KnowledgeLevel
}

export interface RAGChunk {
  id: string
  documentId: string
  documentTitle: string
  content: string
  page?: number
  article?: string
  embedding?: number[]
}

export interface PlanLimits {
  dailyQuestions: number
  libraryAccess: 'basic' | 'full'
  simulations: 'limited' | 'advanced' | 'all'
  exclusiveContent: boolean
  studyTracks: boolean
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    dailyQuestions: 5,
    libraryAccess: 'basic',
    simulations: 'limited',
    exclusiveContent: false,
    studyTracks: false,
  },
  premium: {
    dailyQuestions: Infinity,
    libraryAccess: 'full',
    simulations: 'advanced',
    exclusiveContent: false,
    studyTracks: false,
  },
  premium_plus: {
    dailyQuestions: Infinity,
    libraryAccess: 'full',
    simulations: 'all',
    exclusiveContent: true,
    studyTracks: true,
  },
}

export const PLAN_PRICES = {
  free: { label: 'Free', price: 0, features: ['5 perguntas/dia na IA', 'Biblioteca básica', 'Simulados limitados'] },
  premium: {
    label: 'Premium',
    price: 9.99,
    features: ['IA ilimitada com RAG', 'Simulados avançados', 'Biblioteca completa', 'Atualizações de legislação'],
  },
  premium_plus: {
    label: 'Premium Plus',
    price: 19.99,
    features: ['Tudo do Premium', 'Vídeos exclusivos', 'PDFs do criador', 'Trilhas personalizadas'],
  },
}
