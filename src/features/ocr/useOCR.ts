import { useState, useRef, useCallback } from 'react'
import type { OCRAnalysisResult } from '@/types'
import { analyzeImage } from './ocrService'

export function useOCR() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<OCRAnalysisResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const analyze = useCallback(async (file: File) => {
    setAnalyzing(true)
    setResult(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    try {
      const analysis = await analyzeImage(file)
      setResult(analysis)
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const openCamera = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  return { analyzing, result, preview, inputRef, analyze, openCamera, reset }
}
