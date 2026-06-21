import type { ConsultingMessage, ConsultingSession, ConsultingSessionStatus } from '@/types'
import { COLLECTIONS } from '@/services/firebase/collections'
import { adminDb, db, isConfigured, upsertDoc } from '@/services/firebase/firestoreHelpers'
import { initFirestoreData, subscribeConsultingSessions } from '@/services/firebase/firestoreInit'

const SESSIONS_KEY = 'sgt-vitor-consulting-sessions'
export const CONSULTING_UPDATED_EVENT = 'sgt-consulting-updated'

let sessionsCache: ConsultingSession[] = []
let subscriptionsStarted = false

function notifyUpdate() {
  window.dispatchEvent(new Event(CONSULTING_UPDATED_EVENT))
}

function ensureSubscriptions() {
  if (subscriptionsStarted) return
  subscriptionsStarted = true
  if (!isConfigured) return

  void initFirestoreData()
  subscribeConsultingSessions((items) => {
    sessionsCache = items
    notifyUpdate()
  })
}

function loadSessionsLocal(): ConsultingSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessionsLocal(sessions: ConsultingSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  sessionsCache = sessions
  notifyUpdate()
}

function getSessions(): ConsultingSession[] {
  ensureSubscriptions()
  return isConfigured ? sessionsCache : loadSessionsLocal()
}

async function persistSession(session: ConsultingSession) {
  if (isConfigured && db) {
    await upsertDoc(db, COLLECTIONS.consultingSessions, session.id, session as object)
    return
  }
  const sessions = loadSessionsLocal()
  const idx = sessions.findIndex((s) => s.id === session.id)
  if (idx >= 0) sessions[idx] = session
  else sessions.unshift(session)
  saveSessionsLocal(sessions)
}

async function persistSessionAdmin(session: ConsultingSession) {
  if (isConfigured && adminDb) {
    await upsertDoc(adminDb, COLLECTIONS.consultingSessions, session.id, session as object)
    return
  }
  await persistSession(session)
}

export function getAllSessions(): ConsultingSession[] {
  return getSessions()
}

export function getSessionByUserId(userId: string): ConsultingSession | undefined {
  return getSessions().find((s) => s.userId === userId)
}

export function getPendingSessionsCount(): number {
  return getSessions().filter((s) => s.status === 'pending').length
}

export async function createOrUpdateUserSession(
  userId: string,
  userName: string,
  userEmail: string,
  userMessage: Omit<ConsultingMessage, 'id'>,
): Promise<ConsultingSession> {
  const sessions = getSessions()
  let session = sessions.find((s) => s.userId === userId && s.status !== 'closed')

  const msg: ConsultingMessage = { ...userMessage, id: `consult-${Date.now()}` }
  const now = new Date().toISOString()

  if (!session) {
    session = {
      id: `session-${Date.now()}`,
      userId,
      userName,
      userEmail,
      status: 'pending',
      messages: [msg],
      createdAt: now,
      updatedAt: now,
    }
    await persistSession(session)
    return session
  }

  session.messages.push(msg)
  session.status = 'pending'
  session.updatedAt = now
  await persistSession(session)
  return session
}

export async function addExpertReply(sessionId: string, content: string, expertName = 'Sgt Vitor') {
  const session = getSessions().find((s) => s.id === sessionId)
  if (!session) return null

  const msg: ConsultingMessage = {
    id: `consult-${Date.now()}`,
    role: 'expert',
    content,
    timestamp: new Date().toISOString(),
    expertName,
  }

  session.messages.push(msg)
  session.status = 'answered'
  session.updatedAt = new Date().toISOString()
  await persistSessionAdmin(session)
  return session
}

export async function updateSessionStatus(sessionId: string, status: ConsultingSessionStatus) {
  const session = getSessions().find((s) => s.id === sessionId)
  if (!session) return

  session.status = status
  session.updatedAt = new Date().toISOString()
  await persistSessionAdmin(session)
}

export function getUserMessages(userId: string): ConsultingMessage[] {
  const session = getSessionByUserId(userId)
  return session?.messages ?? []
}

export async function clearUserConsultingSessions(userId: string) {
  const remaining = getSessions().filter((s) => s.userId !== userId)
  if (!isConfigured) {
    saveSessionsLocal(remaining)
    return
  }
  saveSessionsLocal(remaining)
}
