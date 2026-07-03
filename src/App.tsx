import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PersonalizationProvider } from '@/contexts/PersonalizationContext'
import { OCRProvider } from '@/contexts/OCRContext'
import { AppRoutes } from '@/routing/AppRoutes'
import { AppAdminRedirectGate } from '@/components/admin/AppAdminRedirectGate'
import { waitForVideosReady } from '@/features/admin/contentService'
import { isConfigured } from '@/services/firebase/config'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

function FirebaseContentBootstrap() {
  useEffect(() => {
    if (isConfigured) void waitForVideosReady()
  }, [])
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <FirebaseContentBootstrap />
      <PersonalizationProvider>
        <OCRProvider>
          <BrowserRouter basename={routerBasename || undefined}>
            <AppAdminRedirectGate>
              <AppRoutes />
            </AppAdminRedirectGate>
          </BrowserRouter>
        </OCRProvider>
      </PersonalizationProvider>
    </AuthProvider>
  )
}
