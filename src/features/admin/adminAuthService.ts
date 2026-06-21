import {
  ensureAdminFirebaseAuth,
  adminFirebaseErrorMessage,
  signOutAdminFirebase,
} from '@/services/firebase/adminFirebaseAuth'

const ADMIN_SESSION_KEY = 'sgt-vitor-admin-session'
const ADMIN_FIREBASE_WARN_KEY = 'sgt-vitor-admin-firebase-warn'

export async function loginAdmin(password: string): Promise<{ ok: boolean; warning?: string }> {
  const result = await ensureAdminFirebaseAuth('system', password)
  if (!result.passwordOk) return { ok: false }

  localStorage.setItem(ADMIN_SESSION_KEY, '1')
  if (result.firebaseOk) {
    localStorage.removeItem(ADMIN_FIREBASE_WARN_KEY)
    return { ok: true }
  }

  const warning = adminFirebaseErrorMessage(result.errorCode) ?? undefined
  if (warning) localStorage.setItem(ADMIN_FIREBASE_WARN_KEY, warning)
  return { ok: true, warning }
}

export function getAdminFirebaseWarning(): string | null {
  return localStorage.getItem(ADMIN_FIREBASE_WARN_KEY)
}

export async function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
  localStorage.removeItem(ADMIN_FIREBASE_WARN_KEY)
  await signOutAdminFirebase()
}

export function isAdminSessionActive(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === '1'
}

export function isAdminUser(role?: string): boolean {
  return role === 'admin'
}

export function hasAdminAccess(role?: string): boolean {
  return isAdminSessionActive() || isAdminUser(role)
}
