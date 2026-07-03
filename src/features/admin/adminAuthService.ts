import {
  completeAdminGoogleRedirect,
  ensureAdminFirebaseAuth,
  signInAdminWithGoogle,
  adminFirebaseErrorMessage,
  signOutAdminFirebase,
  type AdminRole,
} from '@/services/firebase/adminFirebaseAuth'
import { isConfigured } from '@/services/firebase/config'
import { adminDb } from '@/services/firebase/adminApp'
import { seedFirestoreContent } from '@/services/firebase/firestoreInit'

const ADMIN_SESSION_KEY = 'sgt-vitor-admin-session'
const ADMIN_FIREBASE_WARN_KEY = 'sgt-vitor-admin-firebase-warn'

async function completeLogin(result: { firebaseOk: boolean; errorCode?: string }) {
  localStorage.setItem(ADMIN_SESSION_KEY, '1')
  if (result.firebaseOk) {
    localStorage.removeItem(ADMIN_FIREBASE_WARN_KEY)
    if (adminDb) {
      try {
        await seedFirestoreContent(adminDb)
      } catch {
        /* seed opcional — não bloqueia login */
      }
    }
    return { ok: true as const }
  }
  const warning = adminFirebaseErrorMessage(result.errorCode) ?? undefined
  if (warning) localStorage.setItem(ADMIN_FIREBASE_WARN_KEY, warning)
  return { ok: true as const, warning }
}

export async function loginAdmin(password: string): Promise<{ ok: boolean; warning?: string }> {
  const result = await ensureAdminFirebaseAuth('system', password)
  if (!result.passwordOk) return { ok: false }
  return completeLogin(result)
}

export async function loginAdminWithGoogle(): Promise<{
  ok: boolean
  warning?: string
  error?: string
  redirecting?: boolean
}> {
  if (!isConfigured) {
    return { ok: false, error: 'Firebase não configurado.' }
  }

  const result = await signInAdminWithGoogle('system')
  if (result.redirecting) {
    return { ok: false, redirecting: true }
  }
  if (!result.ok) {
    return { ok: false, error: result.errorMessage ?? 'Não foi possível entrar com Google.' }
  }

  return completeLogin(result)
}

export async function resolveAdminGoogleRedirectLogin(
  role: AdminRole = 'system',
): Promise<{ ok: boolean; warning?: string; error?: string } | null> {
  const result = await completeAdminGoogleRedirect(role)
  if (!result) return null
  if (!result.ok) {
    return { ok: false, error: result.errorMessage ?? 'Não foi possível entrar com Google.' }
  }
  return completeLogin(result)
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
