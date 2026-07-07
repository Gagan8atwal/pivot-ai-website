/**
 * lib/google-calendar.ts — server-only Google Calendar helper.
 *
 * Uses the OAuth2 *refresh-token* flow (no service account / domain delegation).
 * `OAuth2Client` from `google-auth-library` is exactly what `google.auth.OAuth2`
 * aliases to inside the `googleapis` package — same client, same
 * `setCredentials({ refresh_token })` call — but importing it directly keeps the
 * build's type-check within normal memory (the full `googleapis` type surface
 * OOMs `next build` on this repo). The event is created via the Calendar v3 REST
 * endpoint using the freshly-minted access token.
 *
 * NEVER import this from a 'use client' file — it reads server-only secrets.
 * It returns a STRUCTURED result and never throws; the caller logs the outcome
 * and always keeps the lead-save + emails working even if the calendar fails.
 */

import { OAuth2Client } from 'google-auth-library'

// Optional override; the instant is fixed regardless (see below), this only
// labels the event's display timezone. Defaults to a sensible North-American zone.
const DISPLAY_TZ = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Toronto'

// The demo isn't scheduled at submit time — the owner reaches out to book it.
// We drop a 30-minute placeholder ~1 business-day out so it surfaces as an
// actionable item on the owner's calendar.
const LEAD_TIME_MS = 24 * 60 * 60 * 1000
const DURATION_MIN = 30

export interface DemoEventInput {
  contactName: string
  businessName: string
  email: string
  phone: string
  industry: string
  employees: string
  message: string
  smsConsent: boolean
}

export type CalendarResult =
  | { status: 'created'; eventId: string; htmlLink: string | null }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string }

function buildDescription(i: DemoEventInput): string {
  return [
    'New Pivot AI demo request from the website.',
    '',
    `Name:        ${i.contactName || '—'}`,
    `Business:    ${i.businessName || '—'}`,
    `Email:       ${i.email || '—'}`,
    `Phone:       ${i.phone || '—'}`,
    `Industry:    ${i.industry || '—'}`,
    `Team size:   ${i.employees || '—'}`,
    `SMS consent: ${i.smsConsent ? 'Yes (web form)' : 'No'}`,
    '',
    'Message:',
    i.message || '—',
    '',
    '— This is a placeholder slot. Contact the lead to confirm the real demo time.',
  ].join('\n')
}

/**
 * Insert a "Pivot AI Demo — {business}" event. Resolves to a structured result;
 * never rejects. Missing config → { status: 'skipped' }. API error → { status: 'failed' }.
 */
export async function createDemoCalendarEvent(
  input: DemoEventInput
): Promise<CalendarResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI // recommended, not required for refresh
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  const missing: string[] = []
  if (!clientId) missing.push('GOOGLE_CLIENT_ID')
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET')
  if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN')
  if (!calendarId) missing.push('GOOGLE_CALENDAR_ID')
  if (missing.length > 0) {
    return { status: 'skipped', reason: `missing ${missing.join(', ')}` }
  }

  try {
    // Same as `new google.auth.OAuth2(id, secret, redirect)` + setCredentials.
    const oauth2 = new OAuth2Client(clientId, clientSecret, redirectUri)
    oauth2.setCredentials({ refresh_token: refreshToken })

    // Exchange the refresh token for a fresh access token.
    const { token } = await oauth2.getAccessToken()
    if (!token) {
      return { status: 'failed', reason: 'Could not obtain access token from refresh token' }
    }

    const start = new Date(Date.now() + LEAD_TIME_MS)
    const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000)

    const title = `Pivot AI Demo — ${input.businessName || input.contactName || 'New lead'}`

    // Attend the customer only if a valid-looking email was provided.
    const attendees =
      input.email && input.email.includes('@') ? [{ email: input.email }] : undefined

    const requestBody = {
      summary: title,
      description: buildDescription(input),
      start: { dateTime: start.toISOString(), timeZone: DISPLAY_TZ },
      end: { dateTime: end.toISOString(), timeZone: DISPLAY_TZ },
      attendees,
      reminders: { useDefault: true },
    }

    // Calendar v3 events.insert. sendUpdates=none: we send our own branded
    // confirmation, so don't let Google also blast a raw invite to the customer.
    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId as string
      )}/events?sendUpdates=none`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!res.ok) {
      let reason = `Calendar API HTTP ${res.status}`
      try {
        const errBody = (await res.json()) as {
          error?: { message?: string; errors?: Array<{ message?: string }> }
        }
        const msg =
          errBody?.error?.message || errBody?.error?.errors?.[0]?.message
        if (msg) reason = `[${res.status}] ${msg}`
      } catch {
        /* non-JSON error body — keep the status-only reason */
      }
      return { status: 'failed', reason }
    }

    const data = (await res.json()) as { id?: string; htmlLink?: string }
    if (!data.id) {
      return { status: 'failed', reason: 'Calendar API returned no event id' }
    }
    return { status: 'created', eventId: data.id, htmlLink: data.htmlLink ?? null }
  } catch (err) {
    const e = err as { message?: string; code?: number | string }
    const reason =
      (e?.code ? `[${e.code}] ` : '') + (e?.message || 'Unknown Calendar API error')
    return { status: 'failed', reason }
  }
}
