import {
  ensureAdminFirebaseAuth,
  adminFirebaseErrorMessage,
  signOutAdminFirebase,
} from '@/services/firebase/adminFirebaseAuth'

const STORE_ADMIN_SESSION_KEY = 'sgt-vitor-store-admin-session'
const STORE_FIREBASE_WARN_KEY = 'sgt-vitor-store-firebase-warn'

export async function loginStoreAdmin(password: string): Promise<{ ok: boolean; warning?: string }> {
  const result = await ensureAdminFirebaseAuth('store', password)
  if (!result.passwordOk) return { ok: false }

  localStorage.setItem(STORE_ADMIN_SESSION_KEY, '1')
  if (result.firebaseOk) {
    localStorage.removeItem(STORE_FIREBASE_WARN_KEY)
    return { ok: true }
  }

  const warning = adminFirebaseErrorMessage(result.errorCode) ?? undefined
  if (warning) localStorage.setItem(STORE_FIREBASE_WARN_KEY, warning)
  return { ok: true, warning }
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
