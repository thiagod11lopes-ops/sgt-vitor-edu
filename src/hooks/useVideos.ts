import { useEffect, useState } from 'react'
import {
  getVideos,
  CONTENT_UPDATED_EVENT,
  waitForVideosReady,
} from '@/features/admin/contentService'
import { isConfigured } from '@/services/firebase/config'
import type { Video } from '@/types'

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>(() => getVideos())
  const [loading, setLoading] = useState(() => isConfigured)

  useEffect(() => {
    const refresh = () => {
      setVideos(getVideos())
      setLoading(false)
    }

    window.addEventListener(CONTENT_UPDATED_EVENT, refresh)

    if (!isConfigured) {
      setLoading(false)
      return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh)
    }

    void waitForVideosReady().finally(refresh)

    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh)
  }, [])

  return { videos, loading }
}
