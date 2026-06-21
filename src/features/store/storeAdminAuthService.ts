import { ensureAdminFirebaseAuth, signOutAdminFirebase } from '@/services/firebase/adminFirebaseAuth'

const STORE_ADMIN_SESSION_KEY = 'sgt-vitor-store-admin-session'

export async function loginStoreAdmin(password: string): Promise<boolean> {
  const ok = await ensureAdminFirebaseAuth('store', password)
  if (ok) localStorage.setItem(STORE_ADMIN_SESSION_KEY, '1')
  return ok
}

export async function logoutStoreAdmin() {
  localStorage.removeItem(STORE_ADMIN_SESSION_KEY)
  await signOutAdminFirebase()
}

export function isStoreAdminSessionActive(): boolean {
  return localStorage.getItem(STORE_ADMIN_SESSION_KEY) === '1'
}

export function hasStoreAdminAccess(): boolean {
  return isStoreAdminSessionActive()
}
