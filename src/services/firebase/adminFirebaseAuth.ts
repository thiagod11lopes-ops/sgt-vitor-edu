import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type UserCredential,
} from 'firebase/auth'
import { adminAuth, STORE_ADMIN_EMAIL, SYSTEM_ADMIN_EMAIL } from './adminApp'
import { isConfigured } from './config'
import {
  getAllowedGoogleEmails,
  isEmailAllowedForRole,
  loadAdminConfig,
  registerGoogleAdminEmail,
} from './adminConfig'
import { firebaseAuthErrorMessage } from './firebaseAuthErrors'

export type AdminRole = 'system' | 'store'

const REDIRECT_ROLE_KEY = 'sgt-vitor-admin-google-role'
const REDIRECT_PENDING_KEY = 'sgt-vitor-admin-google-redirect'

export interface AdminAuthResult {
  passwordOk: boolean
  firebaseOk: boolean
  errorCode?: string
}

export interface AdminGoogleAuthResult {
  ok: boolean
  firebaseOk: boolean
  redirecting?: boolean
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

/** Safari/iOS bloqueiam pop-up do Google com frequência — usar redirect. */
export function prefersGoogleRedirectAuth(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/i.test(ua)
  const isSafari = /Safari/i.test(ua) && !/Chrom(e|ium)|CriOS|FxiOS|EdgiOS/i.test(ua)
  return isIOS || isSafari
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

async function processGoogleCredential(
  role: AdminRole,
  cred: UserCredential,
): Promise<AdminGoogleAuthResult> {
  if (!adminAuth) {
    return {
      ok: false,
      firebaseOk: false,
      errorMessage: 'Firebase não configurado neste ambiente.',
    }
  }

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
    const allowed = getAllowedGoogleEmails(role)
    const hint =
      allowed.length > 0
        ? `Use a conta Google autorizada (${allowed.join(', ')}).`
        : 'Este e-mail não está na lista de administradores.'
    return {
      ok: false,
      firebaseOk: false,
      errorCode: 'auth/unauthorized-admin',
      errorMessage: `Este Google não está autorizado para este painel. ${hint}`,
    }
  }

  try {
    await registerGoogleAdminEmail(role, email)
  } catch (error: unknown) {
    const code = firebaseErrorCode(error)
    if (code === 'permission-denied') {
      await signOut(adminAuth)
      return {
        ok: false,
        firebaseOk: false,
        errorCode: code,
        errorMessage:
          'Login Google ok, mas falhou ao registrar admin no Firestore. Tente novamente ou use a senha do admin.',
      }
    }
    throw error
  }

  return { ok: true, firebaseOk: true }
}

export function hasPendingAdminGoogleRedirect(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(REDIRECT_PENDING_KEY) === '1'
}

export async function completeAdminGoogleRedirect(
  expectedRole: AdminRole,
): Promise<AdminGoogleAuthResult | null> {
  if (!isConfigured || !adminAuth) return null

  let cred: UserCredential | null = null
  try {
    cred = await getRedirectResult(adminAuth)
  } catch (error: unknown) {
    const code = firebaseErrorCode(error)
    return {
      ok: false,
      firebaseOk: false,
      errorCode: code,
      errorMessage:
        adminFirebaseErrorMessage(code) ??
        firebaseAuthErrorMessage(code) ??
        'Falha ao concluir login com Google.',
    }
  }

  if (!cred) return null

  const storedRole = sessionStorage.getItem(REDIRECT_ROLE_KEY) as AdminRole | null
  sessionStorage.removeItem(REDIRECT_PENDING_KEY)
  sessionStorage.removeItem(REDIRECT_ROLE_KEY)

  return processGoogleCredential(storedRole ?? expectedRole, cred)
}

export async function signInAdminWithGoogle(role: AdminRole): Promise<AdminGoogleAuthResult> {
  if (!isConfigured || !adminAuth) {
    return {
      ok: false,
      firebaseOk: false,
      errorMessage: 'Firebase não configurado neste ambiente.',
    }
  }

  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  if (prefersGoogleRedirectAuth()) {
    sessionStorage.setItem(REDIRECT_ROLE_KEY, role)
    sessionStorage.setItem(REDIRECT_PENDING_KEY, '1')
    await signInWithRedirect(adminAuth, provider)
    return { ok: false, firebaseOk: false, redirecting: true }
  }

  try {
    const cred = await signInWithPopup(adminAuth, provider)
    return processGoogleCredential(role, cred)
  } catch (error: unknown) {
    const code = firebaseErrorCode(error)
    if (code === 'auth/popup-closed-by-user') {
      return { ok: false, firebaseOk: false, errorCode: code }
    }
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request'
    ) {
      sessionStorage.setItem(REDIRECT_ROLE_KEY, role)
      sessionStorage.setItem(REDIRECT_PENDING_KEY, '1')
      await signInWithRedirect(adminAuth, provider)
      return { ok: false, firebaseOk: false, redirecting: true }
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
