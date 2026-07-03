import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { auth, storage, isConfigured } from '@/services/firebase/config'
import { STORAGE_PATHS } from '@/services/firebase/collections'
import { updateUserProfile } from '@/services/firebase/auth'
import { isDefaultProfilePhoto } from '@/lib/profileAssets'
import {
  LOCAL_PROFILE_PHOTO_PREFIX,
  parseLocalProfilePhotoKey,
  deleteProfilePhotoFile,
  storeProfilePhotoFile,
  validateProfilePhotoFile,
  compressImageForCache,
  isLocalProfilePhotoUrl,
} from './profilePhotoStorage'

const PROFILE_PHOTO_CACHE_KEY = 'sgt-vitor-profile-photo'
const PROFILE_PHOTO_DATA_SUFFIX = '-data'

export function persistProfilePhotoCache(uid: string, photoURL: string, dataUrl?: string) {
  localStorage.setItem(`${PROFILE_PHOTO_CACHE_KEY}-${uid}`, photoURL)
  const dataKey = `${PROFILE_PHOTO_CACHE_KEY}${PROFILE_PHOTO_DATA_SUFFIX}-${uid}`
  if (dataUrl) {
    localStorage.setItem(dataKey, dataUrl)
  } else if (!isLocalProfilePhotoUrl(photoURL)) {
    localStorage.removeItem(dataKey)
  }
}

export function loadProfilePhotoCache(uid: string): string | undefined {
  const dataKey = `${PROFILE_PHOTO_CACHE_KEY}${PROFILE_PHOTO_DATA_SUFFIX}-${uid}`
  const dataUrl = localStorage.getItem(dataKey)
  if (dataUrl) return dataUrl

  return localStorage.getItem(`${PROFILE_PHOTO_CACHE_KEY}-${uid}`) ?? undefined
}

/** @deprecated use loadProfilePhotoCache */
export function loadDemoPhotoURL(uid: string): string | undefined {
  return loadProfilePhotoCache(uid)
}

function photoPriority(url?: string): number {
  if (!url?.trim()) return 0
  if (url.startsWith('data:')) return 100
  if (isLocalProfilePhotoUrl(url)) return 90
  if (/^https:\/\/firebasestorage\.googleapis\.com/i.test(url)) return 80
  if (/^https?:\/\//i.test(url) && !isDefaultProfilePhoto(url)) return 50
  if (isDefaultProfilePhoto(url)) return 10
  return 20
}

/** Escolhe a melhor foto entre cache local, Firestore e Firebase Auth. */
export function resolveProfilePhotoURL(
  uid: string,
  ...candidates: (string | undefined | null)[]
): string | undefined {
  const cached = loadProfilePhotoCache(uid)
  const all = [cached, ...candidates].filter((url): url is string => !!url?.trim())

  let best: string | undefined
  let bestScore = -1
  for (const url of all) {
    const score = photoPriority(url)
    if (score > bestScore) {
      bestScore = score
      best = url
    }
  }

  return best
}

async function uploadToFirebaseStorage(uid: string, file: File): Promise<string> {
  if (!storage || !auth?.currentUser) {
    throw new Error('Faça login para enviar a foto ao servidor.')
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const objectRef = ref(storage, `${STORAGE_PATHS.profilePhotos}/${uid}/avatar.${ext}`)

  await uploadBytes(objectRef, file, { contentType: file.type })
  const downloadUrl = await getDownloadURL(objectRef)

  await updateUserProfile(uid, { photoURL: downloadUrl })
  if (auth.currentUser.uid === uid) {
    await updateProfile(auth.currentUser, { photoURL: downloadUrl })
  }

  persistProfilePhotoCache(uid, downloadUrl)
  return downloadUrl
}

async function saveLocalPhoto(uid: string, file: File, previousPhotoURL?: string): Promise<string> {
  const previousKey = parseLocalProfilePhotoKey(previousPhotoURL)
  if (previousKey) await deleteProfilePhotoFile(previousKey)

  const dataUrl = await compressImageForCache(file)
  const key = await storeProfilePhotoFile(file, uid)
  const localRef = `${LOCAL_PROFILE_PHOTO_PREFIX}${key}`

  persistProfilePhotoCache(uid, localRef, dataUrl)

  if (isConfigured) {
    try {
      if (auth) await auth.authStateReady()
      await updateUserProfile(uid, { photoURL: dataUrl })
    } catch {
      // Foto permanece no localStorage deste aparelho
    }
  }

  return dataUrl
}

export async function uploadProfilePhoto(
  uid: string,
  file: File,
  previousPhotoURL?: string,
): Promise<string> {
  const validationError = validateProfilePhotoFile(file)
  if (validationError) throw new Error(validationError)

  if (isConfigured && auth) {
    await auth.authStateReady()

    if (auth.currentUser?.uid) {
      try {
        const remoteUrl = await uploadToFirebaseStorage(uid, file)
        const previousKey = parseLocalProfilePhotoKey(previousPhotoURL)
        if (previousKey) await deleteProfilePhotoFile(previousKey)
        return remoteUrl
      } catch (error) {
        const message = error instanceof Error ? error.message : ''
        if (message.includes('Faça login')) throw error
      }
    }
  }

  return saveLocalPhoto(uid, file, previousPhotoURL)
}
