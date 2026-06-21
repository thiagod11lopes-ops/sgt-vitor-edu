const ADMIN_SESSION_KEY = 'sgt-vitor-admin-session'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'sgtvitor2024'

export function loginAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false
  localStorage.setItem(ADMIN_SESSION_KEY, '1')
  return true
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
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
