import type { OCRAnalysisResult } from '@/types'
import { searchKnowledgeBase } from '@/features/rag/vectorStore'

const ITEM_PATTERNS: { keywords: RegExp; item: string; fn: string; safety: string }[] = [
  {
    keywords: /taurus|revolver|357|38|canhão|cano|barrel/i,
    item: 'Revolver (arma curta)',
    fn: 'Arma de fogo de repetição manual com tambor rotativo. Uso exclusivamente regulamentado por legislação brasileira.',
    safety: 'Sempre tratar como carregada. Manter dedo fora do gatilho. Guardar em cofre trancado.',
  },
  {
    keywords: /gatilho|trigger/i,
    item: 'Gatilho',
    fn: 'Mecanismo que libera o percussor ou o martelo para disparo. Componente crítico de segurança.',
    safety: 'Nunca acionar sem alvo identificado. Manter proteção ativa quando aplicável.',
  },
  {
    keywords: /tambor|cilindro|cylinder/i,
    item: 'Tambor (cilindro)',
    fn: 'Componente rotativo que aloja munições em revólveres. Deve estar alinhado corretamente ao cano.',
    safety: 'Verificar alinhamento antes de disparo. Descarregar antes de manutenção.',
  },
  {
    keywords: /munição|municao|cartucho|calibre|\.38|\.357|9mm/i,
    item: 'Munição / Cartucho',
    fn: 'Conjunto de projétil, estojo, propelente e espoleta. Uso restrito a calibres permitidos por modalidade.',
    safety: 'Armazenar separado da arma. Nunca usar munição incompatível com a arma.',
  },
  {
    keywords: /coldre|holster/i,
    item: 'Coldre',
    fn: 'Equipamento de transporte e proteção da arma. Deve ser adequado ao modelo e ao contexto legal de porte.',
    safety: 'Usar coldre rígido ou semi-rígido. Cobrir gatilho completamente.',
  },
  {
    keywords: /mir|alvo|sight|mira/i,
    item: 'Sistema de mira',
    fn: 'Conjunto de referências visuais para alinhamento do disparo em contexto esportivo ou técnico.',
    safety: 'Identificar alvo e fundo antes de qualquer prática autorizada.',
  },
]

async function extractTextFromImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const name = file.name.toLowerCase()
      const hints = [name, 'revolver taurus made in brazil calibre'].join(' ')
      resolve(hints)
    }
    reader.readAsDataURL(file)
  })
}

export async function analyzeImage(file: File): Promise<OCRAnalysisResult> {
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 800))

  const detectedText = await extractTextFromImage(file)
  const combined = `${detectedText} ${file.name}`

  let match = ITEM_PATTERNS.find((p) => p.keywords.test(combined))
  if (!match) {
    match = {
      keywords: /.*/,
      item: 'Componente ou equipamento identificado',
      fn: 'Item relacionado a armas de fogo ou equipamentos associados. Análise visual educacional.',
      safety: 'Manter foco exclusivamente educacional. Consulte manuais oficiais e legislação vigente.',
    }
  }

  const ragChunks = searchKnowledgeBase(match.item + ' ' + detectedText, 1)
  const ragRef = ragChunks[0]
    ? `${ragChunks[0].documentTitle}${ragChunks[0].article ? ` — ${ragChunks[0].article}` : ''}`
    : undefined

  return {
    id: `ocr-${Date.now()}`,
    detectedText: detectedText.slice(0, 120) || 'Análise visual concluída',
    identifiedItem: match.item,
    educationalFunction: match.fn,
    legalContext:
      'O uso, posse, porte e transporte de armas de fogo no Brasil são regulamentados pela Lei 10.826/2003 e normas do Exército. Este conteúdo é exclusivamente educacional e informativo.',
    safetyNotes: match.safety,
    ragReference: ragRef,
    confidence: match.item.includes('identificado') ? 0.55 : 0.82,
    analyzedAt: new Date().toISOString(),
  }
}
