import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { adminAuth, STORE_ADMIN_EMAIL, SYSTEM_ADMIN_EMAIL } from './adminApp'
import { isConfigured } from './config'

export type AdminRole = 'system' | 'store'

export interface AdminAuthResult {
  passwordOk: boolean
  firebaseOk: boolean
  errorCode?: string
}

function expectedPassword(role: AdminRole): string {
  const envValue =
    role === 'system'
      ? import.meta.env.VITE_ADMIN_PASSWORD
      : import.meta.env.VITE_STORE_ADMIN_PASSWORD
  const fallback = role === 'system' ? 'sgtvitor2024' : 'lojastgt2024'
  if (typeof envValue === 'string' && envValue.trim().length > 0) {
    return envValue.trim()
  }
  return fallback
}

function credentialsFor(role: AdminRole) {
  const password = expectedPassword(role)
  return {
    email: role === 'system' ? SYSTEM_ADMIN_EMAIL : STORE_ADMIN_EMAIL,
    password,
  }
}

function firebaseErrorCode(error: unknown): string | undefined {
  return (error as { code?: string }).code
}

async function signInOrCreateAdmin(email: string, password: string): Promise<AdminAuthResult> {
  if (!isConfigured || !adminAuth) {
    return { passwordOk: true, firebaseOk: false }
  }

  try {
    await signInWithEmailAndPassword(adminAuth, email, password)
    return { passwordOk: true, firebaseOk: true }
  } catch (signInError: unknown) {
    const signInCode = firebaseErrorCode(signInError)

    if (
      signInCode === 'auth/user-not-found' ||
      signInCode === 'auth/invalid-credential' ||
      signInCode === 'auth/invalid-login-credentials'
    ) {
      try {
        await createUserWithEmailAndPassword(adminAuth, email, password)
        return { passwordOk: true, firebaseOk: true }
      } catch (createError: unknown) {
        const createCode = firebaseErrorCode(createError)
        if (createCode === 'auth/email-already-in-use') {
          return { passwordOk: true, firebaseOk: false, errorCode: 'auth/wrong-password-in-firebase' }
        }
        return { passwordOk: true, firebaseOk: false, errorCode: createCode ?? signInCode }
      }
    }

    return { passwordOk: true, firebaseOk: false, errorCode: signInCode }
  }
}

export async function ensureAdminFirebaseAuth(
  role: AdminRole,
  password: string,
): Promise<AdminAuthResult> {
  const trimmed = password.trim()
  const { email, password: validPassword } = credentialsFor(role)

  if (trimmed !== validPassword) {
    return { passwordOk: false, firebaseOk: false }
  }

  return signInOrCreateAdmin(email, validPassword)
}

export function adminFirebaseErrorMessage(code?: string): string | null {
  if (!code) return null
  if (code === 'auth/operation-not-allowed') {
    return 'Ative "E-mail/senha" em Firebase → Authentication → Sign-in method.'
  }
  if (code === 'auth/wrong-password-in-firebase') {
    return 'Senha correta no app, mas a conta Firebase está diferente. Exclua o usuário admin no Firebase Console e entre de novo.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
  }
  return `Firebase: ${code.replace('auth/', '')}`
}

export async function signOutAdminFirebase() {
  if (adminAuth) await signOut(adminAuth)
}

export function isAdminFirebaseReady(role: AdminRole): boolean {
  if (!isConfigured || !adminAuth) return false
  const email = role === 'system' ? SYSTEM_ADMIN_EMAIL : STORE_ADMIN_EMAIL
  return adminAuth.currentUser?.email === email
}
