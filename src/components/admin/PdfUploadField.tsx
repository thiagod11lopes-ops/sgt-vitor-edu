import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/features/admin/pdfStorageService'

interface PdfUploadFieldProps {
  file: File | null
  existingFileName?: string
  onFileChange: (file: File | null) => void
  error?: string
}

export function PdfUploadField({
  file,
  existingFileName,
  onFileChange,
  error,
}: PdfUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const pickFile = (candidate: File | null) => {
    if (!candidate) {
      onFileChange(null)
      return
    }
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) {
      return
    }
    onFileChange(candidate)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) pickFile(dropped)
  }

  const label = file?.name ?? existingFileName

  return (
    <div>
      <span className="text-[10px] text-text-muted mb-1 block">Arquivo PDF *</span>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        onDrop={handleDrop}
        className={cn(
          'glass rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all',
          dragging ? 'border-accent bg-accent/10' : 'border-white/15 hover:border-accent/40 hover:bg-white/5',
          error && 'border-red-500/40'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        />

        {label ? (
          <div className="flex flex-col items-center gap-2">
            <FileText size={28} className="text-accent" />
            <p className="text-xs font-semibold break-all">{label}</p>
            {file && (
              <p className="text-[10px] text-text-muted">{formatFileSize(file.size)}</p>
            )}
            {!file && existingFileName && (
              <p className="text-[10px] text-text-muted">PDF já anexado — selecione outro para substituir</p>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFileChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:underline mt-1"
            >
              <X size={12} />
              Remover seleção
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={28} className="text-text-muted" />
            <p className="text-xs font-medium">Arraste um PDF aqui</p>
            <p className="text-[10px] text-text-muted">ou clique para selecionar do dispositivo</p>
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  )
}
