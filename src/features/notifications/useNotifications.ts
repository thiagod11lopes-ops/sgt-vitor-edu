import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AppNotification } from '@/types'
import {
  loadNotifications,
  markNotificationRead,
  markAllRead,
  requestPushPermission,
} from './notificationService'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePersonalization } from '@/contexts/PersonalizationContext'

export function useNotifications() {
  const { user } = useAuthContext()
  const { personalization } = usePersonalization()
  const navigate = useNavigate()
  const uid = user?.uid ?? 'demo-user'
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [pushEnabled, setPushEnabled] = useState(false)

  useEffect(() => {
    setNotifications(loadNotifications(uid))
  }, [uid, personalization.knowledgeLevel])

  const unreadCount = notifications.filter((n) => !n.read).length

  const readNotification = useCallback(
    (id: string, actionUrl?: string) => {
      const updated = markNotificationRead(uid, id)
      setNotifications(updated)
      if (actionUrl) navigate(actionUrl)
    },
    [uid, navigate]
  )

  const readAll = useCallback(() => {
    setNotifications(markAllRead(uid))
  }, [uid])

  const enablePush = useCallback(async () => {
    const granted = await requestPushPermission(uid)
    setPushEnabled(granted)
    return granted
  }, [uid])

  return {
    notifications,
    unreadCount,
    pushEnabled,
    readNotification,
    readAll,
    enablePush,
  }
}
