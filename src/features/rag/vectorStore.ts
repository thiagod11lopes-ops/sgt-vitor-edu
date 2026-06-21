import type { RAGChunk, SourceCitation } from '@/types'
import { KNOWLEDGE_BASE } from '@/features/rag/knowledgeBase'

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

function simpleEmbed(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/)
  const vec = new Array(128).fill(0)
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      vec[word.charCodeAt(i) % 128] += 1
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
  return vec.map((v) => v / norm)
}

export function searchKnowledgeBase(query: string, topK = 3): RAGChunk[] {
  const queryEmbedding = simpleEmbed(query)
  const scored = KNOWLEDGE_BASE.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding ?? simpleEmbed(chunk.content)),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK).filter((s) => s.score > 0.05).map((s) => s.chunk)
}

export function chunksToSources(chunks: RAGChunk[]): SourceCitation[] {
  return chunks.map((chunk, i) => ({
    documentId: chunk.documentId,
    documentTitle: chunk.documentTitle,
    page: chunk.page,
    article: chunk.article,
    excerpt: chunk.content.slice(0, 200) + (chunk.content.length > 200 ? '…' : ''),
    relevanceScore: 1 - i * 0.1,
  }))
}

export { simpleEmbed }
