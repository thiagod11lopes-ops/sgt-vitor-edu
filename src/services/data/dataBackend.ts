import { isConfigured } from '@/services/firebase/config'

export type DataBackend = 'local' | 'firebase'

/**
 * Backend de dados ativo. Com Firebase configurado no .env, todas as superfícies
 * (app, admin sistema, admin loja) apontam para o mesmo projeto.
 */
export function getDataBackend(): DataBackend {
  return isConfigured ? 'firebase' : 'local'
}

export function isSharedDatabaseReady(): boolean {
  return isConfigured
}

export function getDataBackendLabel(): string {
  return getDataBackend() === 'firebase' ? 'Firebase (Firestore)' : 'Local (demo)'
}
