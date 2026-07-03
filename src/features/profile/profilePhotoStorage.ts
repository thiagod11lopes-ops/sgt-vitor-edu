const DB_NAME = 'sgt-vitor-profile-photo-store'
const STORE_NAME = 'photos'

export const LOCAL_PROFILE_PHOTO_PREFIX = 'local-photo:'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function parseLocalProfilePhotoKey(photoURL?: string): string | null {
  if (!photoURL?.startsWith(LOCAL_PROFILE_PHOTO_PREFIX)) return null
  return photoURL.slice(LOCAL_PROFILE_PHOTO_PREFIX.length) || null
}

export function isLocalProfilePhotoUrl(photoURL?: string): boolean {
  return !!photoURL?.startsWith(LOCAL_PROFILE_PHOTO_PREFIX)
}

export function validateProfilePhotoFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Use uma imagem JPG, PNG, WebP ou GIF.'
  }
  if (file.size > MAX_BYTES) {
    return 'A imagem deve ter no máximo 5 MB.'
  }
  return null
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode)
        const request = fn(tx.objectStore(STORE_NAME))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
        tx.oncomplete = () => db.close()
        tx.onerror = () => {
          db.close()
          reject(tx.error)
        }
      }),
  )
}

export async function storeProfilePhotoFile(file: File, uid: string): Promise<string> {
  const key = `${uid}-${Date.now()}`
  await runTransaction('readwrite', (store) => store.put(file, key))
  return key
}

export async function getProfilePhotoBlob(key: string): Promise<Blob | null> {
  try {
    const result = await runTransaction<Blob | undefined>('readonly', (store) => store.get(key))
    return result ?? null
  } catch {
    return null
  }
}

export async function getProfilePhotoObjectUrl(key: string): Promise<string | null> {
  const blob = await getProfilePhotoBlob(key)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

export async function deleteProfilePhotoFile(key: string): Promise<void> {
  try {
    await runTransaction('readwrite', (store) => store.delete(key))
  } catch {
    /* ignore */
  }
}

const CACHE_MAX_EDGE = 512
const CACHE_JPEG_QUALITY = 0.82

/** Gera JPEG compacto para persistir em localStorage (sobrevive ao reload). */
export async function compressImageForCache(file: File): Promise<string> {
  if (typeof document === 'undefined') {
    return URL.createObjectURL(file)
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, CACHE_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Não foi possível processar a imagem.')
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao comprimir imagem.'))),
      'image/jpeg',
      CACHE_JPEG_QUALITY,
    )
  })

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Falha ao ler imagem.'))
    reader.readAsDataURL(blob)
  })
}
