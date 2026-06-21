const VISITS_KEY = 'sgt-vitor-visit-log'

interface VisitLog {
  [date: string]: number
}

function loadLog(): VisitLog {
  try {
    const raw = localStorage.getItem(VISITS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLog(log: VisitLog) {
  localStorage.setItem(VISITS_KEY, JSON.stringify(log))
}

export function recordVisit() {
  const today = new Date().toISOString().split('T')[0]
  const log = loadLog()
  log[today] = (log[today] ?? 0) + 1
  saveLog(log)
}

export function getVisitorStats() {
  const log = loadLog()
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
