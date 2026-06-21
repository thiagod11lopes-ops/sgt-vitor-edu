import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { ChatPage } from '@/pages/ChatPage'

export function HomeRoute() {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50dvh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/perfil" replace />
  }

  return <ChatPage />
}
