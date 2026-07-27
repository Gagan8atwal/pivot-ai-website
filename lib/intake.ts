export const SMS_CONSENT_VERSION = '2026-07-22-v1'

export const SMS_CONSENT_PREFIX =
  'I agree to receive SMS updates from Pivot AI about my demo request. ' +
  'Message and data rates may apply. Reply STOP to opt out at any time.'

export const SMS_CONSENT_TEXT =
  `${SMS_CONSENT_PREFIX} See our Privacy Policy and Terms of Service.`

export const SMS_CONSENT_METHOD = `web_form:${SMS_CONSENT_VERSION}`

export const INTAKE_LIMITS = {
  maxBodyBytes: 20_000,
  minFormFillMs: 1_500,
  maxFormAgeMs: 24 * 60 * 60 * 1_000,
  rateLimitWindowMs: 15 * 60 * 1_000,
  maxMatchingSubmissionsPerWindow: 3,
} as const

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u

export function createSubmissionId(): string {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
    throw new Error('Secure random UUID generation is unavailable')
  }
  return crypto.randomUUID()
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value.trim())
}

export function boundedText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  const normalized = value.trim()
  if (!normalized || normalized.length > maxLength) return ''
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) return ''
  return normalized
}

export function normalizeEmail(value: unknown): string {
  return boundedText(value, 254).toLowerCase()
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function normalizePhone(value: unknown): string {
  return boundedText(value, 40)
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isValidPhone(value: string): boolean {
  const digits = phoneDigits(value)
  return digits.length >= 7 && digits.length <= 15
}

export function splitName(fullName: string): [string, string | null] {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return [parts[0] ?? '', null]
  return [parts[0], parts.slice(1).join(' ')]
}

export function sameNormalizedEmail(left: unknown, right: unknown): boolean {
  return normalizeEmail(left) === normalizeEmail(right)
}

export function sameNormalizedPhone(left: unknown, right: unknown): boolean {
  return phoneDigits(normalizePhone(left)) === phoneDigits(normalizePhone(right))
}
