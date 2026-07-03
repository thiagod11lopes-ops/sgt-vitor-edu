import { auth, isConfigured } from './config'

const DEMO_SESSION_KEY = 'sgt-vitor-auth-session'

/** Aguarda o Firebase Auth e devolve o uid da sessão ativa. */
export async function resolveAuthUid(stateUid?: string): Promise<string | null> {
  if (stateUid) return stateUid

  if (!isConfigured) {
    return localStorage.getItem(DEMO_SESSION_KEY) === 'demo' ? 'demo-user' : null
  }

  if (!auth) return null

  await auth.authStateReady()
  return auth.currentUser?.uid ?? null
}
