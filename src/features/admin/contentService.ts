import { VIDEOS as DEFAULT_VIDEOS } from '@/features/videos/videoData'
import { DOCUMENTS as DEFAULT_DOCUMENTS } from '@/features/library/libraryData'
import { deletePdfFile, parseLocalPdfKey } from '@/features/admin/pdfStorageService'
import type { Video, Document } from '@/types'

const VIDEOS_KEY = 'sgt-vitor-videos'
const DOCS_KEY = 'sgt-vitor-documents'
export const CONTENT_UPDATED_EVENT = 'sgt-content-updated'

function notifyUpdate() {
  window.dispatchEvent(new Event(CONTENT_UPDATED_EVENT))
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
  try {
    const raw = localStorage.getItem(VIDEOS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_VIDEOS
  } catch {
    return DEFAULT_VIDEOS
  }
}

export function saveVideos(videos: Video[]) {
  localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos))
  notifyUpdate()
}

export function addVideo(video: Omit<Video, 'id'>) {
  const videos = getVideos()
  const id = `v-${Date.now()}`
  saveVideos([...videos, { ...video, id }])
  return id
}

export function updateVideo(id: string, data: Partial<Video>) {
  saveVideos(getVideos().map((v) => (v.id === id ? { ...v, ...data } : v)))
}

export function deleteVideo(id: string) {
  saveVideos(getVideos().filter((v) => v.id !== id))
}

export function getDocuments(): Document[] {
  try {
    const raw = localStorage.getItem(DOCS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_DOCUMENTS
  } catch {
    return DEFAULT_DOCUMENTS
  }
}

export function saveDocuments(docs: Document[]) {
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
  notifyUpdate()
}

export function addDocument(doc: Omit<Document, 'id'>) {
  const docs = getDocuments()
  const id = `doc-${Date.now()}`
  saveDocuments([...docs, { ...doc, id }])
  return id
}

export function updateDocument(id: string, data: Partial<Document>) {
  saveDocuments(getDocuments().map((d) => (d.id === id ? { ...d, ...data } : d)))
}

export function deleteDocument(id: string) {
  const doc = getDocuments().find((d) => d.id === id)
  const pdfKey = doc ? parseLocalPdfKey(doc.url) : null
  if (pdfKey) void deletePdfFile(pdfKey)
  saveDocuments(getDocuments().filter((d) => d.id !== id))
}
