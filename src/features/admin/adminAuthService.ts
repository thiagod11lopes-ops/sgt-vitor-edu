import { ensureAdminFirebaseAuth, signOutAdminFirebase } from '@/services/firebase/adminFirebaseAuth'

const ADMIN_SESSION_KEY = 'sgt-vitor-admin-session'

export async function loginAdmin(password: string): Promise<boolean> {
  const ok = await ensureAdminFirebaseAuth('system', password)
  if (ok) localStorage.setItem(ADMIN_SESSION_KEY, '1')
  return ok
}

export async function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
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
