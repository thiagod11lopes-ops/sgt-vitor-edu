import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { auth, storage, isConfigured } from '@/services/firebase/config'
import { STORAGE_PATHS } from '@/services/firebase/collections'
import { updateUserProfile } from '@/services/firebase/auth'
import { isDefaultProfilePhoto } from '@/lib/profileAssets'
import {
  parseLocalProfilePhotoKey,
  deleteProfilePhotoFile,
  storeProfilePhotoFile,
  validateProfilePhotoFile,
  compressImageForCache,
  isLocalProfilePhotoUrl,
} from './profilePhotoStorage'

const PROFILE_PHOTO_CACHE_KEY = 'sgt-vitor-profile-photo'
const PROFILE_PHOTO_DATA_SUFFIX = '-data'
const STORAGE_UPLOAD_TIMEOUT_MS = 8_000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('storage-timeout')), ms)
    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

export function persistProfilePhotoCache(uid: string, photoURL: string, dataUrl?: string) {
  const value = dataUrl ?? photoURL
  localStorage.setItem(`${PROFILE_PHOTO_CACHE_KEY}-${uid}`, value)
  const dataKey = `${PROFILE_PHOTO_CACHE_KEY}${PROFILE_PHOTO_DATA_SUFFIX}-${uid}`
  if (value.startsWith('data:')) {
    localStorage.setItem(dataKey, value)
  } else if (!isLocalProfilePhotoUrl(photoURL)) {
    localStorage.removeItem(dataKey)
  }
}

export function loadProfilePhotoCache(uid: string): string | undefined {
  const dataKey = `${PROFILE_PHOTO_CACHE_KEY}${PROFILE_PHOTO_DATA_SUFFIX}-${uid}`
  const dataUrl = localStorage.getItem(dataKey)
  if (dataUrl) return dataUrl

  const cached = localStorage.getItem(`${PROFILE_PHOTO_CACHE_KEY}-${uid}`)
  if (cached?.startsWith('data:')) return cached
  return cached ?? undefined
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
  if (previousKey) void deleteProfilePhotoFile(previousKey)

  const dataUrl = await compressImageForCache(file)

  try {
    persistProfilePhotoCache(uid, dataUrl, dataUrl)
  } catch {
    throw new Error('Não foi possível salvar a foto neste aparelho. Libere espaço no navegador.')
  }

  void storeProfilePhotoFile(file, uid).catch(() => {
    /* IndexedDB opcional — localStorage já tem a foto */
  })

  return dataUrl
}

async function tryRemoteUpload(
  uid: string,
  file: File,
  previousPhotoURL?: string,
): Promise<string | null> {
  if (!isConfigured || !auth || !storage) return null

  try {
    await auth.authStateReady()
    if (auth.currentUser?.uid !== uid) return null

    const remoteUrl = await withTimeout(
      uploadToFirebaseStorage(uid, file),
      STORAGE_UPLOAD_TIMEOUT_MS,
    )

    const previousKey = parseLocalProfilePhotoKey(previousPhotoURL)
    if (previousKey) void deleteProfilePhotoFile(previousKey)
    return remoteUrl
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('Faça login')) throw error
    return null
  }
}

export async function uploadProfilePhoto(
  uid: string,
  file: File,
  previousPhotoURL?: string,
): Promise<string> {
  const validationError = validateProfilePhotoFile(file)
  if (validationError) throw new Error(validationError)

  const localUrl = await saveLocalPhoto(uid, file, previousPhotoURL)

  const remoteUrl = await tryRemoteUpload(uid, file, previousPhotoURL)
  return remoteUrl ?? localUrl
}
