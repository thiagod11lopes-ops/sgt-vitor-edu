const STORAGE_KEY = 'sgt-vitor-personalization'

export function loadPersonalization(uid: string) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${uid}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function savePersonalization(uid: string, data: unknown) {
  localStorage.setItem(`${STORAGE_KEY}-${uid}`, JSON.stringify(data))
}

export function clearPersonalization(uid: string) {
  localStorage.removeItem(`${STORAGE_KEY}-${uid}`)
}
