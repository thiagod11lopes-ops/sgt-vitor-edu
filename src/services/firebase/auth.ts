import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db, isConfigured } from './config'
import type { UserProfile } from '@/types'
import { generateReferralCode } from '@/lib/utils'

const DEMO_USER: UserProfile = {
  uid: 'demo-user',
  displayName: 'Aluno Demo',
  email: 'demo@sgtvitor.edu',
  plan: 'free',
  knowledgeLevel: 'iniciante',
  personalization: undefined,
  referralCode: 'DEMO1234',
  dailyQuestionsUsed: 0,
  dailyQuestionsReset: new Date().toISOString().split('T')[0],
  totalQuestions: 0,
  badges: [],
  createdAt: new Date().toISOString(),
  notificationsEnabled: false,
}

export function getFreshDemoUser(): UserProfile {
  const today = new Date().toISOString().split('T')[0]
  return {
    ...DEMO_USER,
    dailyQuestionsUsed: 0,
    dailyQuestionsReset: today,
    totalQuestions: 0,
    badges: [],
    personalization: undefined,
    createdAt: new Date().toISOString(),
  }
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase não configurado')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUp(email: string, password: string, displayName: string) {
  if (!auth || !db) throw new Error('Firebase não configurado')
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })

  const profile: UserProfile = {
    uid: cred.user.uid,
    displayName,
    email,
    plan: 'free',
    knowledgeLevel: 'iniciante',
    referralCode: generateReferralCode(displayName),
    dailyQuestionsUsed: 0,
    dailyQuestionsReset: new Date().toISOString().split('T')[0],
    totalQuestions: 0,
    badges: ['primeiro_acesso'],
    createdAt: new Date().toISOString(),
  }

  await setDoc(doc(db, 'users', cred.user.uid), profile)
  return cred
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase não configurado')
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider)
}

export async function signInDemoAnonymous() {
  if (!auth) throw new Error('Firebase não configurado')
  return signInAnonymously(auth)
}

export async function logOut() {
  if (!auth) return
  return signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db || !isConfigured) return { ...DEMO_USER, uid }
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  if (!db) return
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

export { DEMO_USER }
