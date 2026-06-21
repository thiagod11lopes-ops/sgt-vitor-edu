import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserPersonalization, LearningPreference } from '@/types'
import { DEFAULT_PERSONALIZATION } from '@/features/onboarding/onboardingData'
import { loadPersonalization, savePersonalization } from '@/features/profile-personalization/storage'
import { useAuthContext } from '@/contexts/AuthContext'
import { updateUserProfile } from '@/services/firebase/auth'

interface PersonalizationContextType {
  personalization: UserPersonalization
  showOnboarding: boolean
  updatePersonalization: (data: Partial<UserPersonalization>) => void
  completeOnboarding: (data: Omit<UserPersonalization, 'onboardingCompleted' | 'completedAt'>) => Promise<void>
  toggleLearningPreference: (pref: LearningPreference) => void
}

const PersonalizationContext = createContext<PersonalizationContextType | null>(null)

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const { user, refreshProfile } = useAuthContext()
  const [personalization, setPersonalization] = useState<UserPersonalization>(DEFAULT_PERSONALIZATION)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setPersonalization(DEFAULT_PERSONALIZATION)
      setShowOnboarding(false)
      setReady(true)
      return
    }
    const stored = loadPersonalization(user.uid) as UserPersonalization | null
    const fromProfile = user.personalization
    const merged: UserPersonalization = {
      ...DEFAULT_PERSONALIZATION,
      ...fromProfile,
      ...stored,
      knowledgeLevel: stored?.knowledgeLevel ?? fromProfile?.knowledgeLevel ?? user.knowledgeLevel,
    }
    setPersonalization(merged)
    setShowOnboarding(!merged.onboardingCompleted)
    setReady(true)
  }, [user])

  const updatePersonalization = useCallback(
    (data: Partial<UserPersonalization>) => {
      if (!user) return
      setPersonalization((prev) => {
        const next = { ...prev, ...data }
        savePersonalization(user.uid, next)
        return next
      })
      if (data.onboardingCompleted === false) setShowOnboarding(true)
    },
    [user]
  )

  const completeOnboarding = useCallback(
    async (data: Omit<UserPersonalization, 'onboardingCompleted' | 'completedAt'>) => {
      if (!user) return
      const completed: UserPersonalization = {
        ...data,
        onboardingCompleted: true,
        completedAt: new Date().toISOString(),
      }
      setPersonalization(completed)
      savePersonalization(user.uid, completed)
      setShowOnboarding(false)
      await updateUserProfile(user.uid, {
        knowledgeLevel: completed.knowledgeLevel,
        personalization: completed,
      })
      await refreshProfile()
    },
    [user, refreshProfile]
  )

  const toggleLearningPreference = useCallback(
    (pref: LearningPreference) => {
      setPersonalization((prev) => {
        const prefs = prev.learningPreferences.includes(pref)
          ? prev.learningPreferences.filter((p) => p !== pref)
          : [...prev.learningPreferences, pref]
        const next = { ...prev, learningPreferences: prefs.length ? prefs : [pref] }
        if (user) savePersonalization(user.uid, next)
        return next
      })
    },
    [user]
  )

  return (
    <PersonalizationContext.Provider
      value={{
        personalization,
        showOnboarding: ready ? showOnboarding : false,
        updatePersonalization,
        completeOnboarding,
        toggleLearningPreference,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  )
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext)
  if (!ctx) throw new Error('usePersonalization must be used within PersonalizationProvider')
  return ctx
}
