import type { Video } from '@/types'

export const VIDEOS: Video[] = [
  {
    id: 'v1',
    title: 'Como funciona o Registro CAC — Passo a Passo',
    description: 'Tutorial completo sobre o processo de registro no sistema CAC.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'jfKfPfyJRdk',
    playlist: 'legislacao',
    isPremium: false,
    duration: '18:32',
  },
  {
    id: 'v2',
    title: 'Regras de Segurança — 4 Regras Fundamentais',
    description: 'As 4 regras de ouro para manuseio seguro de armas.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'jfKfPfyJRdk',
    playlist: 'seguranca',
    isPremium: false,
    duration: '12:15',
  },
  {
    id: 'v3',
    title: 'Posse vs Porte — Entenda a Diferença',
    description: 'Explicação detalhada sobre posse e porte de armas.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'jfKfPfyJRdk',
    playlist: 'legislacao',
    isPremium: false,
    duration: '15:40',
  },
  {
    id: 'v4',
    title: 'Treinamento Teórico — Mecanismos de Armas',
    description: 'Fundamentos teóricos sobre funcionamento de armas curtas.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'jfKfPfyJRdk',
    playlist: 'treinamento',
    isPremium: true,
    duration: '25:00',
  },
  {
    id: 'v5',
    title: 'Transporte Seguro de Armas — Guia Completo',
    description: 'Como transportar armas conforme a legislação.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'jfKfPfyJRdk',
    playlist: 'seguranca',
    isPremium: false,
    duration: '10:22',
  },
  {
    id: 'v6',
    title: 'Conteúdo Exclusivo — Análise Legislativa 2024',
    description: 'Análise exclusiva das mudanças legislativas recentes.',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    youtubeId: 'jfKfPfyJRdk',
    playlist: 'legislacao',
    isPremium: true,
    duration: '32:18',
  },
]

export const PLAYLIST_LABELS: Record<string, string> = {
  seguranca: 'Segurança',
  legislacao: 'Legislação',
  treinamento: 'Treinamento Teórico',
}

export const PLAYLIST_ICONS: Record<string, string> = {
  seguranca: '🛡️',
  legislacao: '⚖️',
  treinamento: '🎯',
}
