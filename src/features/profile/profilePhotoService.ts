import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { auth, storage, isConfigured } from '@/services/firebase/config'
import { STORAGE_PATHS } from '@/services/firebase/collections'
import { updateUserProfile } from '@/services/firebase/auth'
import {
  LOCAL_PROFILE_PHOTO_PREFIX,
  parseLocalProfilePhotoKey,
  deleteProfilePhotoFile,
  storeProfilePhotoFile,
  validateProfilePhotoFile,
} from './profilePhotoStorage'

const DEMO_PHOTO_KEY = 'sgt-vitor-profile-photo'

function persistDemoPhoto(uid: string, photoURL: string) {
  localStorage.setItem(`${DEMO_PHOTO_KEY}-${uid}`, photoURL)
}

export function loadDemoPhotoURL(uid: string): string | undefined {
  return localStorage.getItem(`${DEMO_PHOTO_KEY}-${uid}`) ?? undefined
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

  return downloadUrl
}

async function saveLocalPhoto(uid: string, file: File, previousPhotoURL?: string): Promise<string> {
  const previousKey = parseLocalProfilePhotoKey(previousPhotoURL)
  if (previousKey) await deleteProfilePhotoFile(previousKey)

  const key = await storeProfilePhotoFile(file, uid)
  const photoURL = `${LOCAL_PROFILE_PHOTO_PREFIX}${key}`

  if (isConfigured) {
    await updateUserProfile(uid, { photoURL })
    if (auth?.currentUser?.uid === uid) {
      await updateProfile(auth.currentUser, { photoURL })
    }
  } else {
    persistDemoPhoto(uid, photoURL)
  }

  return photoURL
}

export async function uploadProfilePhoto(
  uid: string,
  file: File,
  previousPhotoURL?: string,
): Promise<string> {
  const validationError = validateProfilePhotoFile(file)
  if (validationError) throw new Error(validationError)

  if (isConfigured && auth?.currentUser) {
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

  return saveLocalPhoto(uid, file, previousPhotoURL)
}
