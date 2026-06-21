import {
  ensureAdminFirebaseAuth,
  signInAdminWithGoogle,
  adminFirebaseErrorMessage,
  signOutAdminFirebase,
} from '@/services/firebase/adminFirebaseAuth'
import { isConfigured } from '@/services/firebase/config'

const STORE_ADMIN_SESSION_KEY = 'sgt-vitor-store-admin-session'
const STORE_FIREBASE_WARN_KEY = 'sgt-vitor-store-firebase-warn'

function completeLogin(result: { firebaseOk: boolean; errorCode?: string }) {
  localStorage.setItem(STORE_ADMIN_SESSION_KEY, '1')
  if (result.firebaseOk) {
    localStorage.removeItem(STORE_FIREBASE_WARN_KEY)
    return { ok: true as const }
  }
  const warning = adminFirebaseErrorMessage(result.errorCode) ?? undefined
  if (warning) localStorage.setItem(STORE_FIREBASE_WARN_KEY, warning)
  return { ok: true as const, warning }
}

export async function loginStoreAdmin(password: string): Promise<{ ok: boolean; warning?: string }> {
  const result = await ensureAdminFirebaseAuth('store', password)
  if (!result.passwordOk) return { ok: false }
  return completeLogin(result)
}

export async function loginStoreAdminWithGoogle(): Promise<{
  ok: boolean
  warning?: string
  error?: string
}> {
  if (!isConfigured) {
    return { ok: false, error: 'Firebase não configurado.' }
  }

  const result = await signInAdminWithGoogle('store')
  if (!result.ok) {
    return { ok: false, error: result.errorMessage ?? 'Não foi possível entrar com Google.' }
  }

  return completeLogin(result)
}

export function getStoreAdminFirebaseWarning(): string | null {
  return localStorage.getItem(STORE_FIREBASE_WARN_KEY)
}

export async function logoutStoreAdmin() {
  localStorage.removeItem(STORE_ADMIN_SESSION_KEY)
  localStorage.removeItem(STORE_FIREBASE_WARN_KEY)
  await signOutAdminFirebase()
}

export function isStoreAdminSessionActive(): boolean {
  return localStorage.getItem(STORE_ADMIN_SESSION_KEY) === '1'
}

export function hasStoreAdminAccess(): boolean {
  return isStoreAdminSessionActive()
}
