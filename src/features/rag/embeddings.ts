/**
 * Embedding service — substitua por OpenAI/Cohere em produção.
 * O vectorStore.ts já usa simpleEmbed como fallback local.
 */
export { simpleEmbed as generateEmbedding } from './vectorStore'
