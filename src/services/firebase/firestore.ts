import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db, isConfigured } from './config'
import type { ChatMessage, QuizResult } from '@/types'

export async function saveChatMessage(userId: string, message: ChatMessage) {
  if (!db || !isConfigured) return
  await setDoc(doc(db, 'users', userId, 'messages', message.id), message)
}

export async function getChatHistory(userId: string, maxMessages = 50): Promise<ChatMessage[]> {
  if (!db || !isConfigured) return []
  const q = query(
    collection(db, 'users', userId, 'messages'),
    orderBy('timestamp', 'desc'),
    limit(maxMessages)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.data() as ChatMessage).reverse()
}

export async function saveQuizResult(userId: string, result: QuizResult) {
  if (!db || !isConfigured) return
  const id = `${result.quizId}_${Date.now()}`
  await setDoc(doc(db, 'users', userId, 'quizResults', id), result)
}

export async function getReferralCount(referralCode: string): Promise<number> {
  if (!db || !isConfigured) return 0
  const q = query(collection(db, 'users'), where('referredBy', '==', referralCode))
  const snap = await getDocs(q)
  return snap.size
}

export async function incrementDailyQuestions(userId: string, current: number) {
  if (!db || !isConfigured) return
  await setDoc(doc(db, 'users', userId), { dailyQuestionsUsed: current + 1 }, { merge: true })
}
