import { VIDEOS as DEFAULT_VIDEOS } from '@/features/videos/videoData'
import { DOCUMENTS as DEFAULT_DOCUMENTS } from '@/features/library/libraryData'
import { deletePdfFile, parseLocalPdfKey } from '@/features/admin/pdfStorageService'
import { COLLECTIONS } from '@/services/firebase/collections'
import { adminDb, isConfigured, removeDoc, upsertDoc } from '@/services/firebase/firestoreHelpers'
import { adminAuth } from '@/services/firebase/adminApp'
import { initFirestoreData, subscribeDocuments, subscribeVideos } from '@/services/firebase/firestoreInit'
import type { Video, Document } from '@/types'

const VIDEOS_KEY = 'sgt-vitor-videos'
const DOCS_KEY = 'sgt-vitor-documents'
export const CONTENT_UPDATED_EVENT = 'sgt-content-updated'

let videosCache: Video[] = DEFAULT_VIDEOS
let documentsCache: Document[] = DEFAULT_DOCUMENTS
let subscriptionsStarted = false

function notifyUpdate() {
  window.dispatchEvent(new Event(CONTENT_UPDATED_EVENT))
}

function ensureSubscriptions() {
  if (subscriptionsStarted) return
  subscriptionsStarted = true
  if (!isConfigured) return

  void initFirestoreData()
  subscribeVideos((items) => {
    videosCache = items
    notifyUpdate()
  })
  subscribeDocuments((items) => {
    documentsCache = items
    notifyUpdate()
  })
}

export function parseYoutubeId(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = trimmed.match(p)
    if (m?.[1]) return m[1]
  }
  return null
}

export function youtubeThumbnail(id: string) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
}

export function parseInstagramEmbedUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const reel = trimmed.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/i)
  if (reel?.[1]) return `https://www.instagram.com/reel/${reel[1]}/embed`

  const post = trimmed.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/i)
  if (post?.[1]) return `https://www.instagram.com/p/${post[1]}/embed`

  const tv = trimmed.match(/instagram\.com\/tv\/([A-Za-z0-9_-]+)/i)
  if (tv?.[1]) return `https://www.instagram.com/tv/${tv[1]}/embed`

  return null
}

export function getVideoEmbedUrl(video: Pick<Video, 'youtubeId' | 'instagramUrl'>): {
  provider: 'youtube' | 'instagram'
  embedUrl: string
} | null {
  if (video.youtubeId) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`,
    }
  }
  if (video.instagramUrl) {
    const embedUrl = parseInstagramEmbedUrl(video.instagramUrl)
    if (embedUrl) return { provider: 'instagram', embedUrl }
  }
  return null
}

export function getVideos(): Video[] {
  ensureSubscriptions()
  if (!isConfigured) {
    try {
      const raw = localStorage.getItem(VIDEOS_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_VIDEOS
    } catch {
      return DEFAULT_VIDEOS
    }
  }
  return videosCache
}

function saveVideosLocal(videos: Video[]) {
  localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))
  videosCache = videos
  notifyUpdate()
}

function requireAdminFirebaseAuth(action: string) {
  if (!adminAuth?.currentUser) {
    throw new Error(
      `Para ${action}, entre com Google no admin ou reconecte o Firebase (senha sozinha não grava no banco).`,
    )
  }
}

function firebaseWriteError(error: unknown, action: string): Error {
  const code = (error as { code?: string }).code
  if (code === 'permission-denied') {
    return new Error(
      `Sem permissão para ${action}. Saia do admin, entre com Google (${import.meta.env.VITE_SYSTEM_ADMIN_GOOGLE_EMAILS?.split(',')[0] ?? 'conta autorizada'}) e tente de novo.`,
    )
  }
  if (error instanceof Error) return error
  return new Error(`Não foi possível ${action} no Firebase.`)
}

export async function addVideo(video: Omit<Video, 'id'>) {
  const id = `v-${Date.now()}`
  const item = { ...video, id }

  if (isConfigured && adminDb) {
    requireAdminFirebaseAuth('adicionar vídeos')
    try {
      await upsertDoc(adminDb, COLLECTIONS.videos, id, item)
    } catch (error) {
      throw firebaseWriteError(error, 'adicionar vídeos')
    }
    return id
  }

  saveVideosLocal([...getVideos(), item])
  return id
}

export async function updateVideo(id: string, data: Partial<Video>) {
  const current = getVideos().find((v) => v.id === id)
  if (!current) return

  const updated = { ...current, ...data }

  if (isConfigured && adminDb) {
    requireAdminFirebaseAuth('editar vídeos')
    try {
      await upsertDoc(adminDb, COLLECTIONS.videos, id, updated)
    } catch (error) {
      throw firebaseWriteError(error, 'editar vídeos')
    }
    return
  }

  saveVideosLocal(getVideos().map((v) => (v.id === id ? updated : v)))
}

export async function deleteVideo(id: string) {
  if (isConfigured && adminDb) {
    requireAdminFirebaseAuth('excluir vídeos')
    try {
      await removeDoc(adminDb, COLLECTIONS.videos, id)
    } catch {
      throw new Error('Não foi possível excluir o vídeo. Verifique sua conexão com o Firebase.')
    }
    videosCache = videosCache.filter((v) => v.id !== id)
    notifyUpdate()
    return
  }

  saveVideosLocal(getVideos().filter((v) => v.id !== id))
}

export function getDocuments(): Document[] {
  ensureSubscriptions()
  if (!isConfigured) {
    try {
      const raw = localStorage.getItem(DOCS_KEY)
      return raw ? JSON.parse(raw) : DEFAULT_DOCUMENTS
    } catch {
      return DEFAULT_DOCUMENTS
    }
  }
  return documentsCache
}

function saveDocumentsLocal(docs: Document[]) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
  documentsCache = docs
  notifyUpdate()
}

export async function addDocument(doc: Omit<Document, 'id'>) {
  const id = `doc-${Date.now()}`
  const item = { ...doc, id }

  if (isConfigured && adminDb) {
    await upsertDoc(adminDb, COLLECTIONS.documents, id, item)
    return id
  }

  saveDocumentsLocal([...getDocuments(), item])
  return id
}

export async function updateDocument(id: string, data: Partial<Document>) {
  const current = getDocuments().find((d) => d.id === id)
  if (!current) return

  const updated = { ...current, ...data }

  if (isConfigured && adminDb) {
    await upsertDoc(adminDb, COLLECTIONS.documents, id, updated)
    return
  }

  saveDocumentsLocal(getDocuments().map((d) => (d.id === id ? updated : d)))
}

export async function deleteDocument(id: string) {
  const item = getDocuments().find((d) => d.id === id)
  const pdfKey = item ? parseLocalPdfKey(item.url) : null
  if (pdfKey) void deletePdfFile(pdfKey)

  if (isConfigured && adminDb) {
    requireAdminFirebaseAuth('excluir documentos')
    try {
      await removeDoc(adminDb, COLLECTIONS.documents, id)
    } catch {
      throw new Error('Não foi possível excluir o documento. Verifique sua conexão com o Firebase.')
    }
    documentsCache = documentsCache.filter((d) => d.id !== id)
    notifyUpdate()
    return
  }

  saveDocumentsLocal(getDocuments().filter((d) => d.id !== id))
}
