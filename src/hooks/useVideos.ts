import { useEffect, useState } from 'react'
import {
  getVideos,
  CONTENT_UPDATED_EVENT,
  isVideosLoading,
  waitForVideosReady,
} from '@/features/admin/contentService'
import { isConfigured } from '@/services/firebase/config'
import type { Video } from '@/types'

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>(() => getVideos())
  const [loading, setLoading] = useState(() => isConfigured && isVideosLoading())

  useEffect(() => {
    const refresh = () => {
      setVideos(getVideos())
      setLoading(isVideosLoading())
    }

    window.addEventListener(CONTENT_UPDATED_EVENT, refresh)

    if (isConfigured) {
      void waitForVideosReady().then(refresh)
    }

    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh)
  }, [])

  return { videos, loading }
}
