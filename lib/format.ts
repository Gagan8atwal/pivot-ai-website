/**
 * Shared display formatting helpers for the app pages.
 * Pure functions — safe on server or client. Never throw on bad input.
 */

import type { Lead, Appointment } from '@/lib/api'

type BadgeTone = 'default' | 'secondary' | 'amber' | 'success' | 'outline'

/**
 * Best-available appointment start, per the backend contract:
 * prefer `scheduled_start`, else combine `preferred_date` + `preferred_time`,
 * else the legacy `start_at`. Returns null when nothing usable is present.
 */
export function appointmentStart(
  a: Pick<Appointment, 'scheduled_start' | 'preferred_date' | 'preferred_time' | 'start_at'>
): string | null {
  if (a.scheduled_start) return a.scheduled_start
  if (a.preferred_date) {
    return a.preferred_time ? `${a.preferred_date}T${a.preferred_time}` : a.preferred_date
  }
  return a.start_at ?? null
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelative(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(value)
}

export function formatMoney(amount?: number | null, currency = 'usd'): string {
  if (amount === null || amount === undefined) return '—'
  // Stripe-style amounts are usually in cents; heuristically keep as-is if small.
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `$${amount}`
  }
}

export function leadDisplayName(lead: Pick<Lead, 'name' | 'phone' | 'email'>): string {
  return lead.name?.trim() || lead.phone || lead.email || 'Unknown lead'
}

/** Map a free-form status string to a Badge tone. */
export function statusTone(status?: string | null): BadgeTone {
  const s = (status ?? '').toLowerCase()
  if (['won', 'completed', 'closed', 'active', 'booked', 'confirmed', 'paid'].includes(s))
    return 'success'
  if (['new', 'open', 'pending', 'in_progress', 'in progress', 'scheduled'].includes(s))
    return 'amber'
  if (['lost', 'cancelled', 'canceled', 'failed', 'past_due'].includes(s)) return 'default'
  return 'secondary'
}

export function titleCase(value?: string | null): string {
  if (!value) return ''
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
