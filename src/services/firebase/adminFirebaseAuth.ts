import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { adminAuth, STORE_ADMIN_EMAIL, SYSTEM_ADMIN_EMAIL } from './adminApp'
import { isConfigured } from './config'
import {
  isEmailAllowedForRole,
  loadAdminConfig,
  registerGoogleAdminEmail,
} from './adminConfig'
import { firebaseAuthErrorMessage } from './firebaseAuthErrors'

export type AdminRole = 'system' | 'store'

export interface AdminAuthResult {
  passwordOk: boolean
  firebaseOk: boolean
  errorCode?: string
}

export interface AdminGoogleAuthResult {
  ok: boolean
  firebaseOk: boolean
  errorCode?: string
  errorMessage?: string
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

export async function signInAdminWithGoogle(role: AdminRole): Promise<AdminGoogleAuthResult> {
  if (!isConfigured || !adminAuth) {
    return {
      ok: false,
      firebaseOk: false,
      errorMessage: 'Firebase não configurado neste ambiente.',
    }
  }

  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const cred = await signInWithPopup(adminAuth, provider)
    const email = cred.user.email

    if (!email) {
      await signOut(adminAuth)
      return {
        ok: false,
        firebaseOk: false,
        errorCode: 'auth/no-email',
        errorMessage: 'Conta Google sem e-mail. Use outra conta.',
      }
    }

    const config = await loadAdminConfig()
    if (!isEmailAllowedForRole(role, email, config)) {
      await signOut(adminAuth)
      return {
        ok: false,
        firebaseOk: false,
        errorCode: 'auth/unauthorized-admin',
        errorMessage: 'Este Google não está autorizado para este painel.',
      }
    }

    await registerGoogleAdminEmail(role, email)
    return { ok: true, firebaseOk: true }
  } catch (error: unknown) {
    const code = firebaseErrorCode(error)
    if (code === 'auth/popup-closed-by-user') {
      return { ok: false, firebaseOk: false, errorCode: code }
    }
    if (code === 'permission-denied') {
      return {
        ok: false,
        firebaseOk: false,
        errorCode: code,
        errorMessage:
          'Login Google ok, mas falhou ao registrar admin no Firestore. Tente novamente ou use a senha do admin.',
      }
    }
    return {
      ok: false,
      firebaseOk: false,
      errorCode: code,
      errorMessage:
        adminFirebaseErrorMessage(code) ??
        firebaseAuthErrorMessage(code) ??
        'Falha ao entrar com Google.',
    }
  }
}

export function adminFirebaseErrorMessage(code?: string): string | null {
  if (!code) return null
  if (code === 'auth/unauthorized-admin') {
    return 'Este e-mail Google não está autorizado para este painel.'
  }
  if (code === 'auth/wrong-password-in-firebase') {
    return 'Senha correta no app, mas a conta Firebase está diferente. Exclua o usuário admin no Firebase Console e entre de novo.'
  }
  return firebaseAuthErrorMessage(code)
}

export async function signOutAdminFirebase() {
  if (adminAuth) await signOut(adminAuth)
}

export async function isAdminFirebaseReady(role: AdminRole): Promise<boolean> {
  if (!isConfigured || !adminAuth?.currentUser?.email) return false

  const email = adminAuth.currentUser.email.toLowerCase()
  if (role === 'system' && email === SYSTEM_ADMIN_EMAIL) return true
  if (role === 'store' && email === STORE_ADMIN_EMAIL) return true

  const config = await loadAdminConfig()
  const list = role === 'system' ? config.systemGoogleEmails : config.storeGoogleEmails
  return list.includes(email)
}
