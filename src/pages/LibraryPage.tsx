import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, FileText, Lock, ChevronRight, X } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/features/library/libraryData'
import { useLibraryDocuments } from '@/hooks/useLibraryDocuments'
import { getPdfObjectUrl, isLocalPdfUrl, parseLocalPdfKey } from '@/features/admin/pdfStorageService'
import { Badge } from '@/components/ui/Badge'
import { useSubscription } from '@/hooks/useSubscription'
import type { Document, DocumentCategory } from '@/types'
import { formatDate } from '@/lib/utils'

export function LibraryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<DocumentCategory | 'all'>('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [pdfViewUrl, setPdfViewUrl] = useState<string | null>(null)
  const { isPremium } = useSubscription()
  const documents = useLibraryDocuments()

  useEffect(() => {
    let cancelled = false
    let blobUrl: string | null = null

    ;(async () => {
      if (!selectedDoc) {
        setPdfViewUrl(null)
        return
      }

      if (isLocalPdfUrl(selectedDoc.url)) {
        const key = parseLocalPdfKey(selectedDoc.url)
        if (!key) {
          setPdfViewUrl(null)
          return
        }
        const url = await getPdfObjectUrl(key)
        if (cancelled) {
          if (url) URL.revokeObjectURL(url)
          return
        }
        blobUrl = url
        setPdfViewUrl(url)
        return
      }

      if (selectedDoc.url.startsWith('http')) {
        setPdfViewUrl(selectedDoc.url)
        return
      }

      setPdfViewUrl(null)
    })()

    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [selectedDoc])

  const filtered = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'all' || doc.category === category
    return matchSearch && matchCategory
  })

  const categories: (DocumentCategory | 'all')[] = ['all', 'legislacao', 'seguranca', 'normas']

  return (
    <div className="h-[calc(100dvh-5rem)] overflow-y-auto hide-scrollbar">
      <header className="glass-strong safe-top px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold mb-3">Biblioteca</h1>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'glass text-text-secondary'
              }`}
            >
              {cat === 'all' ? 'Todos' : `${CATEGORY_ICONS[cat]} ${CATEGORY_LABELS[cat]}`}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-3 space-y-3">
        {filtered.map((doc, i) => {
          const locked = doc.isPremium && !isPremium
          return (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !locked && setSelectedDoc(doc)}
              className={`w-full glass rounded-2xl p-4 text-left flex items-center gap-3 ${
                locked ? 'opacity-60' : 'hover:bg-white/6'
              } transition-colors`}
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-lg">
                {CATEGORY_ICONS[doc.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate">{doc.title}</h3>
                  {doc.isPremium && <Badge variant="premium">Premium</Badge>}
                </div>
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{doc.description}</p>
                <p className="text-[10px] text-text-muted mt-1">
                  {doc.pages} páginas · Atualizado {formatDate(doc.updatedAt)}
                </p>
              </div>
              {locked ? (
                <Lock size={16} className="text-text-muted shrink-0" />
              ) : (
                <ChevronRight size={16} className="text-text-muted shrink-0" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* PDF Viewer Modal */}
      {selectedDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
        >
          <div className="glass-strong safe-top px-4 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">{selectedDoc.title}</h2>
              <p className="text-[10px] text-text-muted">{selectedDoc.pages} páginas</p>
            </div>
            <button
              onClick={() => setSelectedDoc(null)}
              className="p-2 rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 min-h-0 bg-black/40">
            {pdfViewUrl ? (
              <iframe
                title={selectedDoc.title}
                src={pdfViewUrl}
                className="w-full h-full min-h-[60dvh] border-0"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 h-full min-h-[60dvh]">
                <div className="text-center">
                  <FileText size={48} className="text-accent mx-auto mb-4" />
                  <p className="text-sm text-text-secondary mb-2">Visualizador de PDF</p>
                  <p className="text-xs text-text-muted max-w-xs">
                    Nenhum PDF vinculado a este documento. Adicione um arquivo no painel admin da biblioteca.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
