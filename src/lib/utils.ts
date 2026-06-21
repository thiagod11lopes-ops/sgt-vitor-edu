import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseDateBR(date) ?? tryParseIsoDate(date) : date
  if (!d || Number.isNaN(d.getTime())) return typeof date === 'string' ? date : ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/** Converte entrada parcial ou completa para dd/mm/aaaa enquanto digita. */
export function maskDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function parseDateBR(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function isValidDateBR(value: string): boolean {
  return parseDateBR(value) !== null
}

function tryParseIsoDate(value: string): Date | null {
  const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return parseDateBR(`${iso[3]}/${iso[2]}/${iso[1]}`)
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function generateReferralCode(name: string): string {
  const base = name.replace(/\s+/g, '').slice(0, 4).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}${random}`
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}
