import { createContext, useContext, useState, type ReactNode } from 'react'
import { OCRAnalyzer } from '@/features/ocr/OCRAnalyzer'

interface OCRContextType {
  openOCR: () => void
  closeOCR: () => void
}

const OCRContext = createContext<OCRContextType | null>(null)

export function OCRProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <OCRContext.Provider
      value={{
        openOCR: () => setOpen(true),
        closeOCR: () => setOpen(false),
      }}
    >
      {children}
      <OCRAnalyzer open={open} onClose={() => setOpen(false)} />
    </OCRContext.Provider>
  )
}

export function useOCRPanel() {
  const ctx = useContext(OCRContext)
  if (!ctx) throw new Error('useOCRPanel must be used within OCRProvider')
  return ctx
}
