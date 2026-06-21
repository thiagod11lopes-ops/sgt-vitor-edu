const STORE_ADMIN_SESSION_KEY = 'sgt-vitor-store-admin-session'
const STORE_ADMIN_PASSWORD = import.meta.env.VITE_STORE_ADMIN_PASSWORD || 'lojastgt2024'

export function loginStoreAdmin(password: string): boolean {
  if (password !== STORE_ADMIN_PASSWORD) return false
  localStorage.setItem(STORE_ADMIN_SESSION_KEY, '1')
  return true
}

export function logoutStoreAdmin() {
  localStorage.removeItem(STORE_ADMIN_SESSION_KEY)
}

export function isStoreAdminSessionActive(): boolean {
  return localStorage.getItem(STORE_ADMIN_SESSION_KEY) === '1'
}

export function hasStoreAdminAccess(): boolean {
  return isStoreAdminSessionActive()
}
