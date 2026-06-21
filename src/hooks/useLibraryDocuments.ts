import { useEffect, useState } from 'react'
import { getDocuments, CONTENT_UPDATED_EVENT } from '@/features/admin/contentService'
import type { Document } from '@/types'

export function useLibraryDocuments() {
  const [documents, setDocuments] = useState<Document[]>(() => getDocuments())

  useEffect(() => {
    const refresh = () => setDocuments(getDocuments())
    window.addEventListener(CONTENT_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, refresh)
  }, [])

  return documents
}
