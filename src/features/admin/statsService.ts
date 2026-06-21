import type { AdminDashboardStats } from '@/types'
import { getVisitorStats } from './analyticsService'
import { getPlanBreakdown, getRegisteredUsers } from './userRegistryService'
import { getPendingSessionsCount } from './consultingAdminService'
import { getVideos, getDocuments } from './contentService'

export function getAdminDashboardStats(): AdminDashboardStats {
  const users = getRegisteredUsers()
  const planBreakdown = getPlanBreakdown()
  const visitors = getVisitorStats()

  return {
    totalUsers: users.length,
    planBreakdown: {
      free: planBreakdown.free,
      premium: planBreakdown.premium,
      premium_plus: planBreakdown.premium_plus,
    },
    visitors,
    pendingConsulting: getPendingSessionsCount(),
    totalVideos: getVideos().length,
    totalDocuments: getDocuments().length,
  }
}
