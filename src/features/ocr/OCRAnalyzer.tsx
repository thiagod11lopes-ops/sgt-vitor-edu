import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, Loader2, Shield, AlertTriangle } from 'lucide-react'
import { useOCR } from '@/features/ocr/useOCR'
import { Button } from '@/components/ui/Button'

interface OCRAnalyzerProps {
  open: boolean
  onClose: () => void
}

export function OCRAnalyzer({ open, onClose }: OCRAnalyzerProps) {
  const { analyzing, result, preview, inputRef, analyze, openCamera, reset } = useOCR()

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) analyze(file)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[85] bg-black/70 backdrop-blur-sm flex flex-col safe-top safe-bottom"
        >
          <div className="glass-strong px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Camera size={16} className="text-accent" />
                Analisar imagem
              </h2>
              <p className="text-[10px] text-text-muted">OCR educacional — peças e equipamentos</p>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-white/5">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-4">
            <div className="glass rounded-2xl p-4 border border-amber-500/20">
              <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Foco exclusivamente educacional e informativo
              </p>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />

            {!preview && !analyzing && (
              <button
                onClick={openCamera}
                className="w-full aspect-video glass rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10"
              >
                <Camera size={40} className="text-accent" />
                <span className="text-sm font-medium">Tirar foto ou escolher imagem</span>
                <span className="text-[10px] text-text-muted">Peças, equipamentos, componentes</span>
              </button>
            )}

            {preview && (
              <img src={preview} alt="Preview" className="w-full rounded-2xl object-cover max-h-48" />
            )}

            {analyzing && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 size={32} className="text-accent animate-spin" />
                <p className="text-sm text-text-secondary">Analisando com OCR + visão computacional...</p>
              </div>
            )}

            {result && !analyzing && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="glass rounded-2xl p-4 border-l-2 border-accent">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Item identificado</p>
                  <p className="text-base font-bold text-accent mt-1">{result.identifiedItem}</p>
                  <p className="text-[10px] text-text-muted mt-1">
                    Confiança: {Math.round(result.confidence * 100)}%
                  </p>
                </div>

                {[
                  { label: 'Função educacional', text: result.educationalFunction },
                  { label: 'Contexto legal/teórico', text: result.legalContext },
                  { label: 'Cuidados de segurança', text: result.safetyNotes },
                ].map((block) => (
                  <div key={block.label} className="glass rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">{block.label}</p>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{block.text}</p>
                  </div>
                ))}

                {result.ragReference && (
                  <div className="glass rounded-xl p-3 flex items-start gap-2">
                    <Shield size={14} className="text-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] text-text-secondary">
                      📌 Referência RAG: <span className="text-accent">{result.ragReference}</span>
                    </p>
                  </div>
                )}

                <Button onClick={reset} variant="secondary" size="sm" className="w-full">
                  Analisar outra imagem
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
