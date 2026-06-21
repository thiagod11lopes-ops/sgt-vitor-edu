import type { ConsultingMessage, ConsultingSession, ConsultingSessionStatus } from '@/types'

const SESSIONS_KEY = 'sgt-vitor-consulting-sessions'
export const CONSULTING_UPDATED_EVENT = 'sgt-consulting-updated'

function notifyUpdate() {
  window.dispatchEvent(new Event(CONSULTING_UPDATED_EVENT))
}

function loadSessions(): ConsultingSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: ConsultingSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
  notifyUpdate()
}

export function getAllSessions(): ConsultingSession[] {
  return loadSessions().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function getSessionByUserId(userId: string): ConsultingSession | undefined {
  return loadSessions().find((s) => s.userId === userId)
}

export function getPendingSessionsCount(): number {
  return loadSessions().filter((s) => s.status === 'pending').length
}

export function createOrUpdateUserSession(
  userId: string,
  userName: string,
  userEmail: string,
  userMessage: Omit<ConsultingMessage, 'id'>
): ConsultingSession {
  const sessions = loadSessions()
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
    saveSessions([session, ...sessions])
    return session
  }

  session.messages.push(msg)
  session.status = 'pending'
  session.updatedAt = now
  saveSessions(sessions.map((s) => (s.id === session!.id ? session! : s)))
  return session
}

export function addExpertReply(sessionId: string, content: string, expertName = 'Sgt Vitor') {
  const sessions = loadSessions()
  const session = sessions.find((s) => s.id === sessionId)
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
  saveSessions(sessions.map((s) => (s.id === sessionId ? session : s)))
  return session
}

export function updateSessionStatus(sessionId: string, status: ConsultingSessionStatus) {
  const sessions = loadSessions()
  saveSessions(
    sessions.map((s) =>
      s.id === sessionId ? { ...s, status, updatedAt: new Date().toISOString() } : s
    )
  )
}

export function getUserMessages(userId: string): ConsultingMessage[] {
  const session = getSessionByUserId(userId)
  return session?.messages ?? []
}

export function clearUserConsultingSessions(userId: string) {
  saveSessions(loadSessions().filter((s) => s.userId !== userId))
}
