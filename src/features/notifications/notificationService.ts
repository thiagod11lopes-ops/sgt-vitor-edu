import type { AppNotification, NotificationType, KnowledgeLevel } from '@/types'

const NOTIF_KEY = 'sgt-vitor-notifications'

function getKey(uid: string) {
  return `${NOTIF_KEY}-${uid}`
}

export function loadNotifications(uid: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(getKey(uid))
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return getDefaultNotifications(uid, 'iniciante')
}

export function saveNotifications(uid: string, notifications: AppNotification[]) {
  localStorage.setItem(getKey(uid), JSON.stringify(notifications))
}

export function markNotificationRead(uid: string, id: string) {
  const notifications = loadNotifications(uid).map((n) =>
    n.id === id ? { ...n, read: true } : n
  )
  saveNotifications(uid, notifications)
  return notifications
}

export function markAllRead(uid: string) {
  const notifications = loadNotifications(uid).map((n) => ({ ...n, read: true }))
  saveNotifications(uid, notifications)
  return notifications
}

function getDefaultNotifications(uid: string, level: KnowledgeLevel): AppNotification[] {
  const now = Date.now()
  const base: AppNotification[] = [
    {
      id: 'n1',
      type: 'legislacao',
      title: '📜 Atualização normativa',
      body:
        level === 'avancado'
          ? 'Nova portaria COLOG disponível na biblioteca. Revise alterações no porte de trânsito CAC.'
          : 'Temos uma nova atualização sobre legislação CAC. Confira na biblioteca!',
      timestamp: new Date(now - 3600000).toISOString(),
      read: false,
      actionUrl: '/biblioteca',
    },
    {
      id: 'n2',
      type: 'biblioteca',
      title: '📚 Novo conteúdo',
      body: 'Compêndio Legislativo 2024 adicionado à biblioteca Premium.',
      timestamp: new Date(now - 86400000).toISOString(),
      read: false,
      actionUrl: '/biblioteca',
    },
    {
      id: 'n3',
      type: 'dica_dia',
      title: '💡 Dica do dia',
      body:
        level === 'iniciante'
          ? 'Lembre-se: posse é manter a arma em casa; porte é transitar com ela. São conceitos diferentes!'
          : 'Revise Art. 3º do Decreto 9.847/2019 ao estudar distinções entre posse e porte.',
      timestamp: new Date(now - 172800000).toISOString(),
      read: true,
    },
    {
      id: 'n4',
      type: 'simulado',
      title: '🎯 Lembrete de simulado',
      body: 'Você ainda não fez o simulado "CAC — Fundamentos" esta semana. Pratique agora!',
      timestamp: new Date(now - 259200000).toISOString(),
      read: false,
      actionUrl: '/simulados',
    },
    {
      id: 'n5',
      type: 'resumo_semanal',
      title: '🧠 Resumo semanal',
      body: 'Seu resumo personalizado de aprendizado está pronto. Veja o que estudou esta semana.',
      timestamp: new Date(now - 604800000).toISOString(),
      read: false,
      actionUrl: '/historico',
    },
  ]
  saveNotifications(uid, base)
  return base
}

export function getNotificationIcon(type: NotificationType) {
  const icons: Record<NotificationType, string> = {
    legislacao: '📜',
    biblioteca: '📚',
    dica_dia: '💡',
    resumo_semanal: '🧠',
    simulado: '🎯',
  }
  return icons[type]
}

/** Stub para Firebase Cloud Messaging — configure FCM no .env em produção */
export async function requestPushPermission(_uid: string): Promise<boolean> {
  if (!('Notification' in window)) return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendLocalNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' })
  }
}
