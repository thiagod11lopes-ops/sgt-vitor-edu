import { motion } from 'framer-motion'
import type { SourceCitation } from '@/types'
import { FileText, ExternalLink } from 'lucide-react'

interface SourceCitationCardProps {
  sources: SourceCitation[]
}

export function SourceCitationCard({ sources }: SourceCitationCardProps) {
  if (!sources.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-2"
    >
      <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
        <FileText size={12} />
        Fontes citadas
      </p>
      {sources.map((source, i) => (
        <div
          key={`${source.documentId}-${i}`}
          className="glass rounded-xl p-3 border-l-2 border-accent"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-accent truncate">
                📌 {source.documentTitle}
              </p>
              {(source.article || source.page) && (
                <p className="text-[10px] text-text-muted mt-0.5">
                  {source.article && `${source.article}`}
                  {source.article && source.page && ' · '}
                  {source.page && `p. ${source.page}`}
                </p>
              )}
              <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2 italic">
                "{source.excerpt}"
              </p>
            </div>
            <ExternalLink size={14} className="text-text-muted shrink-0 mt-0.5" />
          </div>
        </div>
      ))}
    </motion.div>
  )
}
