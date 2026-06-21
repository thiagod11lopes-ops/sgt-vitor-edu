import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { BottomNav } from './BottomNav'
import { PremiumConsultingFab } from './PremiumConsultingFab'
import { OnboardingWizard } from '@/features/onboarding/OnboardingWizard'
import { usePersonalization } from '@/contexts/PersonalizationContext'
import { recordVisit } from '@/features/admin/analyticsService'

export function AppLayout() {
  const { showOnboarding } = usePersonalization()
  const { pathname } = useLocation()
  const isChat = pathname === '/'

  useEffect(() => {
    recordVisit()
  }, [pathname])

  return (
    <>
      <div className="app-background" aria-hidden="true" />
      <div className="app-background-overlay" aria-hidden="true" />

      <div className="app-content flex flex-col min-h-dvh">
        <main className="flex-1 pb-20 overflow-hidden min-h-0">
          <Outlet />
        </main>
        <BottomNav />
        {!isChat && <PremiumConsultingFab />}
      </div>

      {showOnboarding && <OnboardingWizard />}
    </>
  )
}
