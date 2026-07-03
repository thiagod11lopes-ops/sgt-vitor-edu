import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  onAuthChange,
  getUserProfile,
  signIn,
  signUp,
  signInWithGoogle,
  logOut,
  signInDemoAnonymous,
  DEMO_USER,
  getFreshDemoUser,
} from '@/services/firebase/auth'
import { isConfigured } from '@/services/firebase/config'
import { registerOrUpdateUser } from '@/features/admin/userRegistryService'
import { resetDemoUserData } from '@/features/demo/demoDataService'
import { uploadProfilePhoto } from '@/features/profile/profilePhotoService'
import type { UserProfile } from '@/types'

const SESSION_KEY = 'sgt-vitor-auth-session'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  isOnline: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  loginDemo: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfilePhoto: (file: File) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isOnline: true,
  login: async () => {},
  register: async () => {},
  loginDemo: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  updateProfilePhoto: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.uid) {
      const profile = await getUserProfile(user.uid)
      if (profile) setUser(profile)
    }
  }, [user?.uid])

  const trackUser = useCallback((profile: UserProfile) => {
    registerOrUpdateUser({
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      plan: profile.plan,
    })
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid)
        const base =
          profile ?? {
            ...DEMO_USER,
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? DEMO_USER.displayName,
          }
        const withPhoto = {
          ...base,
          photoURL: base.photoURL ?? firebaseUser.photoURL ?? undefined,
        }
        setUser(withPhoto)
        setIsAuthenticated(true)
        trackUser(withPhoto)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setLoading(false)
    })
    return unsub
  }, [trackUser])

  const login = useCallback(async (email: string, password: string) => {
    if (!isConfigured) throw new Error('Configure o Firebase para login com e-mail.')
    await signIn(email, password)
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isConfigured) throw new Error('Configure o Firebase para criar conta.')
    await signUp(email, password, displayName)
  }, [])

  const loginDemo = useCallback(async () => {
    resetDemoUserData()
    if (isConfigured) {
      await signInDemoAnonymous()
      return
    }
    const freshUser = getFreshDemoUser()
    localStorage.setItem(SESSION_KEY, 'demo')
    setUser(freshUser)
    setIsAuthenticated(true)
    trackUser(freshUser)
  }, [trackUser])

  const updateProfilePhoto = useCallback(
    async (file: File) => {
      if (!user?.uid) throw new Error('Entre na sua conta para alterar a foto.')

      const photoURL = await uploadProfilePhoto(user.uid, file, user.photoURL)
      setUser({ ...user, photoURL })
      if (isConfigured) await refreshProfile()
    },
    [user, refreshProfile],
  )

  const loginWithGoogle = useCallback(async () => {
    if (!isConfigured) throw new Error('Configure o Firebase para login com Google.')
    await signInWithGoogle()
  }, [])

  const logout = useCallback(async () => {
    if (isConfigured) {
      await logOut()
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isOnline,
        login,
        register,
        loginDemo,
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfilePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
