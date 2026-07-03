const DEFAULT_PROFILE_PHOTO = 'profile/instructor-glock.svg'

export function getDefaultProfilePhoto(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${DEFAULT_PROFILE_PHOTO}`
}

export function resolveProfilePhoto(photoURL?: string): string {
  if (!photoURL?.trim()) return getDefaultProfilePhoto()
  if (/^(https?:|data:)/i.test(photoURL)) return photoURL

  const normalized = photoURL.replace(/^\//, '')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${normalized}`
}
