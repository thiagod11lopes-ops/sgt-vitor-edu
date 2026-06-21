import { useState } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

export function useReferral() {
  const { user } = useAuthContext()
  const [copied, setCopied] = useState(false)

  const referralCode = user?.referralCode ?? 'DEMO1234'
  const referralLink = `${window.location.origin}?ref=${referralCode}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Sgt Vitor',
          text: 'Aprenda legislação armamentista com IA! Use meu código:',
          url: referralLink,
        })
      } catch {
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  return {
    referralCode,
    referralLink,
    copied,
    copyLink,
    shareLink,
    stats: {
      totalReferrals: 3,
      activeReferrals: 2,
      rank: 12,
      rewards: ['badge_indicador', '1_dia_premium'],
    },
  }
}
