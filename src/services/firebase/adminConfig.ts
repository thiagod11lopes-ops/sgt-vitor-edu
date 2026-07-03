import { doc, getDoc, setDoc } from 'firebase/firestore'
import { adminDb } from './adminApp'
import { isConfigured } from './config'
import type { AdminRole } from './adminFirebaseAuth'

export interface AdminConfig {
  systemGoogleEmails: string[]
  storeGoogleEmails: string[]
}

const EMPTY_CONFIG: AdminConfig = {
  systemGoogleEmails: [],
  storeGoogleEmails: [],
}

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return []
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function getAllowedGoogleEmails(role: AdminRole): string[] {
  const raw =
    role === 'system'
      ? import.meta.env.VITE_SYSTEM_ADMIN_GOOGLE_EMAILS
      : import.meta.env.VITE_STORE_ADMIN_GOOGLE_EMAILS
  return parseEmailList(raw)
}

export async function loadAdminConfig(): Promise<AdminConfig> {
  if (!isConfigured || !adminDb) return EMPTY_CONFIG
  const snap = await getDoc(doc(adminDb, 'config', 'admins'))
  if (!snap.exists()) return EMPTY_CONFIG
  const data = snap.data()
  return {
    systemGoogleEmails: (data.systemGoogleEmails ?? []).map((e: string) => e.toLowerCase()),
    storeGoogleEmails: (data.storeGoogleEmails ?? []).map((e: string) => e.toLowerCase()),
  }
}

export async function registerGoogleAdminEmail(role: AdminRole, email: string): Promise<void> {
  if (!isConfigured || !adminDb) return

  const normalized = email.trim().toLowerCase()
  const field = role === 'system' ? 'systemGoogleEmails' : 'storeGoogleEmails'
  const config = await loadAdminConfig()
  const envEmails = getAllowedGoogleEmails(role)
  const current = config[field]

  if (current.includes(normalized) && envEmails.every((e) => current.includes(e))) return

  const nextSystem = new Set(config.systemGoogleEmails)
  const nextStore = new Set(config.storeGoogleEmails)

  if (role === 'system') {
    nextSystem.add(normalized)
    envEmails.forEach((e) => nextSystem.add(e))
  } else {
    nextStore.add(normalized)
    envEmails.forEach((e) => nextStore.add(e))
  }

  await setDoc(
    doc(adminDb, 'config', 'admins'),
    {
      systemGoogleEmails: [...nextSystem],
      storeGoogleEmails: [...nextStore],
    },
    { merge: true },
  )
}

export function isEmailAllowedForRole(role: AdminRole, email: string, config: AdminConfig): boolean {
  const normalized = email.trim().toLowerCase()
  const envAllowed = getAllowedGoogleEmails(role)
  const configList = role === 'system' ? config.systemGoogleEmails : config.storeGoogleEmails

  if (envAllowed.length > 0) {
    return envAllowed.includes(normalized)
  }

  if (configList.length > 0) {
    return configList.includes(normalized)
  }

  // Primeiro acesso: permite Google e registra e-mail no Firestore
  return true
}
