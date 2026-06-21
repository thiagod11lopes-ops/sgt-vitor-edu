import { clearPersonalization } from '@/features/profile-personalization/storage'
import { clearUserConsultingSessions } from '@/features/admin/consultingAdminService'
import { clearUserStoreOrders } from '@/features/store/storeOrderService'

export const DEMO_UID = 'demo-user'

/** Remove todos os dados locais do usuário demo para começar do zero. */
export function resetDemoUserData() {
  clearPersonalization(DEMO_UID)
  localStorage.removeItem(`sgt-vitor-history-${DEMO_UID}`)
  localStorage.removeItem(`sgt-vitor-notifications-${DEMO_UID}`)
  localStorage.removeItem(`sgt-vitor-sim-results-${DEMO_UID}`)
  clearUserConsultingSessions(DEMO_UID)
  clearUserStoreOrders(DEMO_UID)
}
