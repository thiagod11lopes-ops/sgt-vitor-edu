import { useAuthContext } from '@/contexts/AuthContext'
import { PLAN_LIMITS, type SubscriptionPlan } from '@/types'

export function useSubscription() {
  const { user } = useAuthContext()
  const plan: SubscriptionPlan = user?.plan ?? 'free'
  const limits = PLAN_LIMITS[plan]

  const today = new Date().toISOString().split('T')[0]
  const questionsUsed = user?.dailyQuestionsReset === today ? (user?.dailyQuestionsUsed ?? 0) : 0
  const questionsRemaining =
    limits.dailyQuestions === Infinity ? Infinity : Math.max(0, limits.dailyQuestions - questionsUsed)

  const canAskQuestion = questionsRemaining > 0
  const isPremium = plan === 'premium' || plan === 'premium_plus'
  const isPremiumPlus = plan === 'premium_plus'

  return {
    plan,
    limits,
    questionsUsed,
    questionsRemaining,
    canAskQuestion,
    isPremium,
    isPremiumPlus,
  }
}
