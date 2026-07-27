import { createHash } from 'node:crypto'

import { INTAKE_LIMITS, isUuid } from '@/lib/intake'

export class IntakeRequestError extends Error {
  readonly status: number
  readonly publicMessage: string

  constructor(status: number, publicMessage: string, internalMessage = publicMessage) {
    super(internalMessage)
    this.name = 'IntakeRequestError'
    this.status = status
    this.publicMessage = publicMessage
  }
}

export interface SubmissionMeta {
  submissionId: string
  formStartedAt: number
}

export function requestIp(request: Request): string {
  return (
    request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

export function validatePublicFormOrigin(request: Request): void {
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')

  if (fetchSite === 'cross-site') {
    throw new IntakeRequestError(403, 'Request rejected.', 'cross-site form submission')
  }

  if (!origin) return

  const requestOrigin = new URL(request.url).origin
  const allowed = new Set([
    requestOrigin,
    'https://pivotcalls.co',
    'https://www.pivotcalls.co',
  ])

  if (!allowed.has(origin)) {
    throw new IntakeRequestError(403, 'Request rejected.', `unexpected origin: ${origin}`)
  }
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.startsWith('application/json')) {
    throw new IntakeRequestError(415, 'Content type must be application/json.')
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > INTAKE_LIMITS.maxBodyBytes) {
    throw new IntakeRequestError(413, 'Request body is too large.')
  }

  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > INTAKE_LIMITS.maxBodyBytes) {
    throw new IntakeRequestError(413, 'Request body is too large.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new IntakeRequestError(400, 'Invalid request body.')
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new IntakeRequestError(400, 'Invalid request body.')
  }

  return parsed as Record<string, unknown>
}

export function parseSubmissionMeta(body: Record<string, unknown>, now = Date.now()): SubmissionMeta {
  const submissionId = typeof body.submissionId === 'string' ? body.submissionId.trim() : ''
  const formStartedAt =
    typeof body.formStartedAt === 'number' ? body.formStartedAt : Number(body.formStartedAt)

  if (!isUuid(submissionId)) {
    throw new IntakeRequestError(400, 'Please refresh the page and try again.', 'invalid submission id')
  }

  if (!Number.isFinite(formStartedAt)) {
    throw new IntakeRequestError(400, 'Please refresh the page and try again.', 'invalid form start')
  }

  const age = now - formStartedAt
  if (age < INTAKE_LIMITS.minFormFillMs) {
    throw new IntakeRequestError(429, 'Please wait a moment and try again.', 'form completed too quickly')
  }
  if (age > INTAKE_LIMITS.maxFormAgeMs || age < 0) {
    throw new IntakeRequestError(400, 'This form expired. Please refresh and try again.')
  }

  return { submissionId: submissionId.toLowerCase(), formStartedAt }
}

export function deriveUuid(seed: string): string {
  const hex = createHash('sha256').update(seed).digest('hex').slice(0, 32).split('')
  hex[12] = '5'
  hex[16] = ((Number.parseInt(hex[16] ?? '0', 16) & 0x3) | 0x8).toString(16)
  const value = hex.join('')
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`
}

export function emailEventId(
  submissionId: string,
  source: 'contact_form' | 'demo_request',
  emailType: 'owner_notification' | 'customer_confirmation'
): string {
  return deriveUuid(`pivot-intake-email:${source}:${submissionId}:${emailType}`)
}

export function resendIdempotencyKey(
  submissionId: string,
  source: 'contact_form' | 'demo_request',
  emailType: 'owner_notification' | 'customer_confirmation'
): string {
  return `pivot-intake/${source}/${emailType}/${submissionId}`
}

export function recoveryMarker(
  submissionId: string,
  source: 'contact_form' | 'demo_request'
): string {
  return `submission:${source}:${submissionId}`
}

export function calendarEventId(submissionId: string): string {
  return `pivotdemo${submissionId.replace(/-/g, '').toLowerCase()}`
}

export function rateLimitWindowStart(now = Date.now()): string {
  return new Date(now - INTAKE_LIMITS.rateLimitWindowMs).toISOString()
}

export function safeErrorMessage(error: unknown, maxLength = 500): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/[\r\n\t]+/g, ' ').slice(0, maxLength)
}
