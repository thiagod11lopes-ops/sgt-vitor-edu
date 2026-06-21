import { doc, setDoc } from 'firebase/firestore'
import { db, isConfigured } from '@/services/firebase/config'
import { initFirestoreData, subscribeVisitLog } from '@/services/firebase/firestoreInit'

const VISITS_KEY = 'sgt-vitor-visit-log'

interface VisitLog {
  [date: string]: number
}

let logCache: VisitLog = {}
let subscriptionsStarted = false

function ensureSubscriptions() {
  if (subscriptionsStarted) return
  subscriptionsStarted = true
  if (!isConfigured) return

  void initFirestoreData()
  subscribeVisitLog((log) => {
    logCache = log
  })
}

function loadLogLocal(): VisitLog {
  try {
    const raw = localStorage.getItem(VISITS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLogLocal(log: VisitLog) {
  localStorage.setItem(VISITS_KEY, JSON.stringify(log))
  logCache = log
}

export async function recordVisit() {
  const today = new Date().toISOString().split('T')[0]

  if (isConfigured && db) {
    ensureSubscriptions()
    const log = { ...logCache }
    log[today] = (log[today] ?? 0) + 1
    await setDoc(doc(db, 'analytics', 'visits'), { log }, { merge: true })
    return
  }

  const log = loadLogLocal()
  log[today] = (log[today] ?? 0) + 1
  saveLogLocal(log)
}

export function getVisitorStats() {
  ensureSubscriptions()
  const log = isConfigured ? logCache : loadLogLocal()
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const monthPrefix = today.slice(0, 7)
  const yearPrefix = today.slice(0, 4)

  let daily = 0
  let monthly = 0
  let yearly = 0

  for (const [date, count] of Object.entries(log)) {
    if (date === today) daily += count
    if (date.startsWith(monthPrefix)) monthly += count
    if (date.startsWith(yearPrefix)) yearly += count
  }

  return { daily, monthly, yearly }
}
