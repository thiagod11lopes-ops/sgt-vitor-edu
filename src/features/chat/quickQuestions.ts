import type { QuickQuestion } from '@/types'

export const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: 'qq1',
    label: 'Como funciona o registro CAC?',
    prompt: 'Como funciona o registro CAC? Explique o processo, requisitos e modalidades.',
  },
  {
    id: 'qq2',
    label: 'Tipos de posse previstos na lei',
    prompt: 'Quais são os tipos de posse previstos na lei brasileira sobre armas de fogo?',
  },
  {
    id: 'qq3',
    label: 'Diferença entre porte e posse',
    prompt: 'Qual a diferença entre porte e posse de arma de fogo segundo a legislação brasileira?',
  },
  {
    id: 'qq4',
    label: 'Regras de transporte de arma',
    prompt: 'Quais são as regras de transporte de arma de fogo segundo a legislação brasileira?',
  },
  {
    id: 'qq5',
    label: 'Requisitos para renovação do CR',
    prompt: 'Quais são os requisitos para renovação do Certificado de Registro (CR) no sistema CAC?',
  },
  {
    id: 'qq6',
    label: 'Calibres permitidos para CAC',
    prompt: 'Quais calibres são permitidos para atiradores desportivos e colecionadores no sistema CAC?',
  },
]

export const DOUBT_TYPES = [
  { id: 'registro', label: 'Registro / CAC' },
  { id: 'posse', label: 'Posse de Arma' },
  { id: 'porte', label: 'Porte de Arma' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'legislacao', label: 'Legislação Geral' },
]

export const DOUBT_CONTEXTS = [
  { id: 'civil', label: 'Civil / Domiciliar' },
  { id: 'esportivo', label: 'Esportivo / CAC' },
  { id: 'colecao', label: 'Coleção' },
  { id: 'seguranca', label: 'Segurança Pública' },
]

export const KNOWLEDGE_LEVELS = [
  { id: 'iniciante', label: 'Iniciante', emoji: '🌱' },
  { id: 'intermediario', label: 'Intermediário', emoji: '📚' },
  { id: 'avancado', label: 'Avançado', emoji: '🎓' },
]
