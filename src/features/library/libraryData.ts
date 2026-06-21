import type { Document } from '@/types'

export const DOCUMENTS: Document[] = [
  {
    id: 'doc-cac',
    title: 'Lei 10.826/2003 — Estatuto do Desarmamento',
    category: 'legislacao',
    description: 'Lei principal que regula registro, posse e comercialização de armas no Brasil.',
    pages: 45,
    url: '#',
    isPremium: false,
    updatedAt: '2024-01-15',
  },
  {
    id: 'doc-posse',
    title: 'Decreto 9.847/2019 — Regulamentação CAC',
    category: 'legislacao',
    description: 'Decreto que regulamenta o sistema CAC e requisitos de registro.',
    pages: 32,
    url: '#',
    isPremium: false,
    updatedAt: '2024-03-20',
  },
  {
    id: 'doc-porte',
    title: 'Portaria COLOG nº 118/2017',
    category: 'normas',
    description: 'Normas sobre porte de trânsito para CAC e procedimentos militares.',
    pages: 28,
    url: '#',
    isPremium: true,
    updatedAt: '2024-02-10',
  },
  {
    id: 'doc-transporte',
    title: 'Manual de Segurança — Transporte de Armas',
    category: 'seguranca',
    description: 'Procedimentos seguros para transporte de armas de fogo.',
    pages: 15,
    url: '#',
    isPremium: false,
    updatedAt: '2024-04-05',
  },
  {
    id: 'doc-seguranca',
    title: 'Normas de Segurança com Armas de Fogo',
    category: 'seguranca',
    description: 'Regras fundamentais de segurança e boas práticas.',
    pages: 12,
    url: '#',
    isPremium: false,
    updatedAt: '2024-01-30',
  },
  {
    id: 'doc-legislacao',
    title: 'Compêndio Legislativo Atualizado 2024',
    category: 'legislacao',
    description: 'Compilação atualizada de leis e decretos armamentistas.',
    pages: 120,
    url: '#',
    isPremium: true,
    updatedAt: '2024-06-01',
  },
  {
    id: 'doc-calibres',
    title: 'Regulamentação de Calibres — CAC',
    category: 'normas',
    description: 'Tabela de calibres permitidos por modalidade CAC.',
    pages: 22,
    url: '#',
    isPremium: true,
    updatedAt: '2024-05-15',
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  legislacao: 'Legislação',
  seguranca: 'Segurança',
  normas: 'Normas e Regulamentos',
}

export const CATEGORY_ICONS: Record<string, string> = {
  legislacao: '⚖️',
  seguranca: '🛡️',
  normas: '📋',
}
