import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PersonalizationProvider } from '@/contexts/PersonalizationContext'
import { OCRProvider } from '@/contexts/OCRContext'
import { AppRoutes } from '@/routing/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <PersonalizationProvider>
        <OCRProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </OCRProvider>
      </PersonalizationProvider>
    </AuthProvider>
  )
}
