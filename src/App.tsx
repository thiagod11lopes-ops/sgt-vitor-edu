import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PersonalizationProvider } from '@/contexts/PersonalizationContext'
import { OCRProvider } from '@/contexts/OCRContext'
import { AppRoutes } from '@/routing/AppRoutes'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        <OCRProvider>
          <BrowserRouter basename={routerBasename || undefined}>
            <AppRoutes />
          </BrowserRouter>
        </OCRProvider>
      </PersonalizationProvider>
    </AuthProvider>
  )
}
