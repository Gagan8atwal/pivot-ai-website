/**
 * lib/google-calendar.ts — server-only Google Calendar helper.
 *
 * Uses the OAuth2 refresh-token flow and creates an idempotent placeholder
 * event keyed to the public form submission UUID. It returns a structured
 * result and never throws so the persisted lead remains authoritative.
 */

import { OAuth2Client } from 'google-auth-library'

import { calendarEventId, safeErrorMessage } from '@/lib/intake-server'

const DISPLAY_TZ = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Toronto'
const LEAD_TIME_MS = 24 * 60 * 60 * 1000
const DURATION_MIN = 30
const REQUEST_TIMEOUT_MS = 12_000

export interface DemoEventInput {
  submissionId: string
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
  | { status: 'created'; eventId: string; htmlLink: string | null; duplicate?: boolean }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string }

function buildDescription(input: DemoEventInput): string {
  return [
    'New Pivot AI demo request from the website.',
    `Submission ID: ${input.submissionId}`,
    '',
    `Name:        ${input.contactName || '—'}`,
    `Business:    ${input.businessName || '—'}`,
    `Email:       ${input.email || '—'}`,
    `Phone:       ${input.phone || '—'}`,
    `Industry:    ${input.industry || '—'}`,
    `Team size:   ${input.employees || '—'}`,
    `SMS consent: ${input.smsConsent ? 'Yes (web form)' : 'No'}`,
    '',
    'Message:',
    input.message || '—',
    '',
    '— Placeholder only. Contact the lead to confirm the real demo time.',
  ].join('\n')
}

export async function createDemoCalendarEvent(
  input: DemoEventInput
): Promise<CalendarResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim()
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim()
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim()

  const missing: string[] = []
  if (!clientId) missing.push('GOOGLE_CLIENT_ID')
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET')
  if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN')
  if (!calendarId) missing.push('GOOGLE_CALENDAR_ID')
  if (missing.length > 0) {
    return { status: 'skipped', reason: `missing ${missing.join(', ')}` }
  }

  const configuredCalendarId = calendarId as string

  try {
    const oauth2 = new OAuth2Client(clientId, clientSecret, redirectUri)
    oauth2.setCredentials({ refresh_token: refreshToken })

    const { token } = await oauth2.getAccessToken()
    if (!token) {
      return { status: 'failed', reason: 'Could not obtain calendar access token' }
    }

    const start = new Date(Date.now() + LEAD_TIME_MS)
    const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000)
    const eventId = calendarEventId(input.submissionId)

    const requestBody = {
      id: eventId,
      summary: `Pivot AI Demo — ${input.businessName || input.contactName || 'New lead'}`,
      description: buildDescription(input),
      start: { dateTime: start.toISOString(), timeZone: DISPLAY_TZ },
      end: { dateTime: end.toISOString(), timeZone: DISPLAY_TZ },
      attendees: input.email && input.email.includes('@') ? [{ email: input.email }] : undefined,
      reminders: { useDefault: true },
    }

    const url =
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        configuredCalendarId
      )}/events?sendUpdates=none`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    if (response.status === 409) {
      return { status: 'created', eventId, htmlLink: null, duplicate: true }
    }

    if (!response.ok) {
      let reason = `Calendar API HTTP ${response.status}`
      try {
        const errorBody = (await response.json()) as {
          error?: { message?: string; errors?: Array<{ message?: string }> }
        }
        const message =
          errorBody?.error?.message || errorBody?.error?.errors?.[0]?.message
        if (message) reason = `[${response.status}] ${safeErrorMessage(message)}`
      } catch {
        // Keep the status-only reason when the provider body is not JSON.
      }
      return { status: 'failed', reason }
    }

    const data = (await response.json()) as { id?: string; htmlLink?: string }
    if (!data.id) {
      return { status: 'failed', reason: 'Calendar API returned no event id' }
    }
    return { status: 'created', eventId: data.id, htmlLink: data.htmlLink ?? null }
  } catch (error) {
    const candidate = error as {
      message?: string
      code?: number | string
      response?: { data?: { error?: string; error_description?: string } }
      name?: string
    }
    if (candidate.name === 'AbortError') {
      return { status: 'failed', reason: 'Calendar request timed out' }
    }

    const oauth = candidate?.response?.data
    const detail =
      oauth?.error || oauth?.error_description
        ? [oauth?.error, oauth?.error_description].filter(Boolean).join(': ')
        : safeErrorMessage(candidate?.message || 'Unknown Calendar API error')
    const reason = (candidate?.code ? `[${candidate.code}] ` : '') + detail
    return { status: 'failed', reason }
  }
}
