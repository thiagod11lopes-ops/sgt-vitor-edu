const DB_NAME = 'sgt-vitor-pdf-store'
const STORE_NAME = 'pdfs'

export const LOCAL_PDF_PREFIX = 'local-pdf:'

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
  fn: (store: IDBObjectStore) => IDBRequest<T>
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
      })
  )
}

export function parseLocalPdfKey(url: string): string | null {
  if (!url.startsWith(LOCAL_PDF_PREFIX)) return null
  return url.slice(LOCAL_PDF_PREFIX.length) || null
}

export function isLocalPdfUrl(url: string): boolean {
  return url.startsWith(LOCAL_PDF_PREFIX)
}

export async function storePdfFile(file: File): Promise<string> {
  const key = `pdf-${Date.now()}`
  await runTransaction('readwrite', (store) => store.put(file, key))
  return key
}

export async function getPdfBlob(key: string): Promise<Blob | null> {
  try {
    const result = await runTransaction<Blob | undefined>('readonly', (store) => store.get(key))
    return result ?? null
  } catch {
    return null
  }
}

export async function getPdfObjectUrl(key: string): Promise<string | null> {
  const blob = await getPdfBlob(key)
  if (!blob) return null
  return URL.createObjectURL(blob)
}

export async function deletePdfFile(key: string): Promise<void> {
  try {
    await runTransaction('readwrite', (store) => store.delete(key))
  } catch {
    /* ignore */
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
