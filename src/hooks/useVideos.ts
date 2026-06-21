import { useEffect, useState } from 'react'
import { getVideos } from '@/features/admin/contentService'
import { CONTENT_UPDATED_EVENT } from '@/features/admin/contentService'
import type { Video } from '@/types'

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>(() => getVideos())

  useEffect(() => {
    const refresh = () => setVideos(getVideos())
    window.addEventListener(CONTENT_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh)
  }, [])

  return videos
}
