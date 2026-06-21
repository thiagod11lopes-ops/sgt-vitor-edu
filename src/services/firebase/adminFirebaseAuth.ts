import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { adminAuth, STORE_ADMIN_EMAIL, SYSTEM_ADMIN_EMAIL } from './adminApp'
import { isConfigured } from './config'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sgtvitor2024'
const STORE_ADMIN_PASSWORD = import.meta.env.VITE_STORE_ADMIN_PASSWORD || 'lojastgt2024'

export type AdminRole = 'system' | 'store'

function credentialsFor(role: AdminRole) {
  return role === 'system'
    ? { email: SYSTEM_ADMIN_EMAIL, password: ADMIN_PASSWORD }
    : { email: STORE_ADMIN_EMAIL, password: STORE_ADMIN_PASSWORD }
}

export async function ensureAdminFirebaseAuth(role: AdminRole, password: string): Promise<boolean> {
  const { email, password: expectedPassword } = credentialsFor(role)
  if (password !== expectedPassword) return false

  if (!isConfigured || !adminAuth) return true

  try {
    await signInWithEmailAndPassword(adminAuth, email, password)
    return true
  } catch (error: unknown) {
    const code = (error as { code?: string }).code
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(adminAuth, email, password)
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

export async function signOutAdminFirebase() {
  if (adminAuth) await signOut(adminAuth)
}

export function isAdminFirebaseReady(role: AdminRole): boolean {
  if (!isConfigured || !adminAuth) return true
  const email = role === 'system' ? SYSTEM_ADMIN_EMAIL : STORE_ADMIN_EMAIL
  return adminAuth.currentUser?.email === email
}
