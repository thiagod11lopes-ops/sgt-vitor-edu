const DEFAULT_PROFILE_PHOTO = 'profile/instructor-glock.svg'

export function getDefaultProfilePhoto(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${DEFAULT_PROFILE_PHOTO}`
}

export function isDefaultProfilePhoto(photoURL?: string): boolean {
  if (!photoURL?.trim()) return true
  const normalized = photoURL.toLowerCase()
  return (
    normalized.includes('instructor-glock.svg') ||
    normalized.includes(DEFAULT_PROFILE_PHOTO) ||
    normalized.endsWith('/profile/instructor-glock.svg')
  )
}

import { isLocalProfilePhotoUrl } from '@/features/profile/profilePhotoStorage'

export function resolveProfilePhoto(photoURL?: string): string {
  if (!photoURL?.trim()) return getDefaultProfilePhoto()
  if (isLocalProfilePhotoUrl(photoURL)) return getDefaultProfilePhoto()
  if (/^(https?:|data:)/i.test(photoURL)) return photoURL

  const normalized = photoURL.replace(/^\//, '')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${normalized}`
}
