import type { ConsultingMessage } from '@/types'
import {
  createOrUpdateUserSession,
  getUserMessages,
  CONSULTING_UPDATED_EVENT,
} from '@/features/admin/consultingAdminService'

export const EXPERT_STATUS = {
  online: true,
  expertName: 'Sgt Vitor',
  avgResponseMinutes: 15,
  totalAttendances: 1247,
}

export function loadConsultingMessages(uid: string): ConsultingMessage[] {
  return getUserMessages(uid)
}

export async function sendUserConsultingMessage(
  uid: string,
  userName: string,
  userEmail: string,
  content: string,
): Promise<ConsultingMessage[]> {
  const userMsg: Omit<ConsultingMessage, 'id'> = {
    role: 'user',
    content: content.trim(),
    timestamp: new Date().toISOString(),
  }

  const session = await createOrUpdateUserSession(uid, userName, userEmail, userMsg)

  const hasSystemAck = session.messages.some((m) => m.role === 'system')
  if (!hasSystemAck) {
    await createOrUpdateUserSession(uid, userName, userEmail, {
      role: 'system',
      content:
        'Beleza, parceiro! Recebi sua pergunta. O Sgt Vitor vai analisar e responder em breve — fica ligado!',
      timestamp: new Date().toISOString(),
    })
  }

  return getUserMessages(uid)
}

export { CONSULTING_UPDATED_EVENT }
