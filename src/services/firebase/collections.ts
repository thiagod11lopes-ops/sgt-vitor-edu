/**
 * Esquema Firestore compartilhado entre app, admin do sistema e admin da loja.
 * Todas as superfícies usam o mesmo projeto Firebase (VITE_FIREBASE_*).
 */
export const COLLECTIONS = {
  users: 'users',
  videos: 'videos',
  documents: 'documents',
  storeProducts: 'storeProducts',
  storeOrders: 'storeOrders',
  consultingRequests: 'consultingRequests',
  analyticsEvents: 'analyticsEvents',
  pdfAssets: 'pdfAssets',
} as const

export const USER_SUBCOLLECTIONS = {
  messages: 'messages',
  quizResults: 'quizResults',
  history: 'history',
} as const

export const STORAGE_PATHS = {
  pdfRoot: 'library/pdfs',
  storeImages: 'store/images',
} as const

/** Chaves localStorage usadas hoje — referência para migração ao Firestore */
export const LOCAL_STORAGE_KEYS = {
  videos: 'sgt-vitor-videos',
  documents: 'sgt-vitor-documents',
  storeOrders: 'sgt-vitor-store-orders',
  storeProducts: 'sgt-vitor-store-products',
} as const

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS]
