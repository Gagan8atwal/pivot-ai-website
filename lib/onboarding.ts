/**
 * lib/onboarding.ts
 *
 * Pure model + validation + mapping for the 7-step onboarding wizard.
 *
 * The wizard talks to two backend surfaces:
 *   - `GET/PATCH /app/onboarding`  → wizard progress (`current_step`,
 *     `completed_steps`, free-form `draft`) plus readiness + integrations.
 *   - `GET/PATCH /app/settings`    → the real `business_settings` row.
 *
 * Anything that has a `business_settings` column is persisted there; wizard-only
 * preferences (industry, tone, pronunciation hints, required lead fields, …)
 * live in the onboarding `draft`. `settingsPatchForStep` / `draftFromForm`
 * decide which is which, so no field is ever "saved" to nowhere.
 */

import {
  DAYS,
  isE164,
  isHHMM,
  minutesOf,
  DEFAULT_OPERATING_HOURS,
  DEFAULT_DEPARTMENTS,
  type Department,
  type LangCode,
  type LangText,
  type OperatingHours,
  type TransferMode,
} from '@/lib/settings-ivr'

/* ───────────────────────────── Steps ───────────────────────────── */

export const TOTAL_STEPS = 7

export interface StepMeta {
  id: number
  title: string
  /** Short label used inside the compact progress rail. */
  short: string
  description: string
}

export const ONBOARDING_STEPS: StepMeta[] = [
  {
    id: 1,
    title: 'Business profile',
    short: 'Business',
    description: 'Who you are — the name, location and contact details the AI uses on every call.',
  },
  {
    id: 2,
    title: 'Business hours',
    short: 'Hours',
    description: 'When you are open, and what callers hear outside those hours.',
  },
  {
    id: 3,
    title: 'Receptionist',
    short: 'Receptionist',
    description: 'The greeting, voice and pronunciation your callers actually hear.',
  },
  {
    id: 4,
    title: 'Call routing',
    short: 'Routing',
    description: 'Where calls go when a caller needs a human.',
  },
  {
    id: 5,
    title: 'Lead capture',
    short: 'Leads',
    description: 'What the AI must collect before it lets a caller go.',
  },
  {
    id: 6,
    title: 'Appointments',
    short: 'Booking',
    description: 'Whether the AI books appointments, and which calendar it books into.',
  },
  {
    id: 7,
    title: 'Review & activate',
    short: 'Activate',
    description: 'Check everything, then put your AI receptionist live.',
  },
]

export function stepMeta(step: number): StepMeta {
  return ONBOARDING_STEPS[Math.min(Math.max(step, 1), TOTAL_STEPS) - 1]
}

export function clampStep(step: unknown): number {
  const n = typeof step === 'number' ? Math.trunc(step) : Number.parseInt(String(step ?? ''), 10)
  if (!Number.isFinite(n)) return 1
  return Math.min(Math.max(n, 1), TOTAL_STEPS)
}

/* ───────────────────────────── Option sets ───────────────────────────── */

export const INDUSTRIES: string[] = [
  'Trucking & logistics',
  'Auto repair & collision',
  'Dental practice',
  'Medical clinic',
  'Home services (HVAC, plumbing, electrical)',
  'Legal services',
  'Real estate',
  'Salon, spa & wellness',
  'Restaurant & hospitality',
  'Construction & trades',
  'Veterinary',
  'Professional services',
  'Other',
]

export const TONES: { value: string; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Neutral, efficient, business-first.' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and conversational, still concise.' },
  { value: 'calm', label: 'Calm', description: 'Slower, reassuring — good for urgent or upset callers.' },
  { value: 'concise', label: 'Concise', description: 'Minimal words. Gets to the point fast.' },
]

export const LANGUAGE_OPTIONS: { value: LangCode; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
]

export const TTS_PROVIDERS: { value: string; label: string; hint: string }[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    hint: 'Pick one of the OpenAI voice names below.',
  },
  {
    value: 'elevenlabs',
    label: 'ElevenLabs',
    hint: 'Paste the voice ID from your ElevenLabs voice library (e.g. 21m00Tcm4TlvDq8ikWAM).',
  },
]

/** Real OpenAI TTS voice names — offered only when the provider is OpenAI. */
export const OPENAI_VOICES: string[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export type LeadFieldKey = 'name' | 'phone' | 'email' | 'reason' | 'urgency' | 'notes'

export const LEAD_FIELDS: { key: LeadFieldKey; label: string; description: string }[] = [
  { key: 'name', label: 'Caller name', description: 'Who is calling.' },
  { key: 'phone', label: 'Callback number', description: 'The number to reach them on.' },
  { key: 'email', label: 'Email address', description: 'For written follow-up and confirmations.' },
  { key: 'reason', label: 'Reason for the call', description: 'What they need, in their words.' },
  { key: 'urgency', label: 'Urgency', description: 'Emergency, today, this week, or no rush.' },
  { key: 'notes', label: 'Extra notes', description: 'Anything else worth passing to your team.' },
]

export type AfterHoursRouting = 'ai_only' | 'voicemail' | 'forward'

export const AFTER_HOURS_ROUTING: {
  value: AfterHoursRouting
  label: string
  description: string
}[] = [
  {
    value: 'ai_only',
    label: 'AI handles it',
    description: 'The AI plays the after-hours greeting and captures the lead. Nobody is called.',
  },
  {
    value: 'voicemail',
    label: 'Take a voicemail',
    description: 'The AI captures the lead and invites the caller to leave a recorded message.',
  },
  {
    value: 'forward',
    label: 'Forward to the on-call number',
    description: 'Urgent callers are transferred to your forwarding number, day or night.',
  },
]

/* ───────────────────────────── Timezones ───────────────────────────── */

/**
 * Curated IANA fallback list. `timezoneOptions()` merges this with the runtime
 * `Intl.supportedValuesOf('timeZone')` list when the browser provides one.
 */
export const FALLBACK_TIMEZONES: string[] = [
  'America/St_Johns',
  'America/Halifax',
  'America/Moncton',
  'America/Toronto',
  'America/Montreal',
  'America/New_York',
  'America/Detroit',
  'America/Chicago',
  'America/Winnipeg',
  'America/Mexico_City',
  'America/Denver',
  'America/Edmonton',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Vancouver',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Bogota',
  'America/Lima',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Lisbon',
  'Europe/Madrid',
  'Europe/Paris',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Zurich',
  'Europe/Rome',
  'Europe/Warsaw',
  'Europe/Athens',
  'Europe/Istanbul',
  'Europe/Kyiv',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Asia/Jerusalem',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Manila',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
]

/** Every IANA zone the runtime knows about, plus the curated fallbacks. */
export function timezoneOptions(): string[] {
  const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }
  let runtime: string[] = []
  if (typeof intl.supportedValuesOf === 'function') {
    try {
      runtime = intl.supportedValuesOf('timeZone')
    } catch {
      runtime = []
    }
  }
  return Array.from(new Set([...FALLBACK_TIMEZONES, ...runtime])).sort((a, b) =>
    a.localeCompare(b)
  )
}

/** The browser's own zone, or '' when it cannot be determined. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}

export function isIanaTimezone(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  try {
    // Throws RangeError for an unknown zone.
    new Intl.DateTimeFormat('en-US', { timeZone: v })
    return true
  } catch {
    return false
  }
}

/* ───────────────────────────── Form model ───────────────────────────── */

export interface PronunciationHint {
  /** The word as written, e.g. "Gagandeep". */
  term: string
  /** How it should be said, e.g. "GUH-gun-deep". */
  sounds_like: string
}

export interface OnboardingForm {
  // Step 1 — business profile
  display_name: string
  legal_name: string
  website: string
  location: string
  industry: string
  timezone: string
  owner_phone: string
  owner_email: string

  // Step 2 — hours
  operating_hours: OperatingHours
  after_hours_greeting: LangText

  // Step 3 — receptionist
  greeting: string
  receptionist_name: string
  tone: string
  language: LangCode
  tts_provider: string
  voice_id: string
  pronunciations: PronunciationHint[]
  spelling_terms: string[]

  // Step 4 — routing
  transfer_mode: TransferMode
  fallback_line: string
  departments: Department[]
  after_hours_routing: AfterHoursRouting

  // Step 5 — lead capture
  required_lead_fields: LeadFieldKey[]

  // Step 6 — appointments
  booking_enabled: boolean
}

const emptyLangText = (): LangText => ({ en: '', pa: '', hi: '' })

export function emptyOnboardingForm(): OnboardingForm {
  return {
    display_name: '',
    legal_name: '',
    website: '',
    location: '',
    industry: '',
    timezone: '',
    owner_phone: '',
    owner_email: '',
    operating_hours: { ...DEFAULT_OPERATING_HOURS },
    after_hours_greeting: emptyLangText(),
    greeting: '',
    receptionist_name: '',
    tone: 'professional',
    language: 'en',
    tts_provider: 'openai',
    voice_id: '',
    pronunciations: [],
    spelling_terms: [],
    transfer_mode: 'warm',
    fallback_line: '',
    departments: DEFAULT_DEPARTMENTS.map((d) => ({ ...d })),
    after_hours_routing: 'ai_only',
    required_lead_fields: ['name', 'phone', 'reason'],
    booking_enabled: false,
  }
}

/* ───────────────────────────── Readers ───────────────────────────── */

function str(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return ''
}

function bool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return fallback
}

function record(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function readLangText(raw: unknown): LangText {
  const out = emptyLangText()
  const obj = record(raw)
  for (const code of ['en', 'pa', 'hi'] as LangCode[]) {
    if (typeof obj[code] === 'string') out[code] = obj[code] as string
  }
  // Tolerate a plain string (some rows store a single-language greeting).
  if (typeof raw === 'string') out.en = raw
  return out
}

function readHours(raw: unknown): OperatingHours {
  const out: OperatingHours = { ...DEFAULT_OPERATING_HOURS }
  const obj = record(raw)
  for (const { key } of DAYS) {
    if (!(key in obj)) continue
    const v = obj[key]
    if (v === null) out[key] = null
    else if (Array.isArray(v) && v.length === 2) out[key] = [String(v[0]), String(v[1])]
  }
  return out
}

function readDepartments(raw: unknown): Department[] {
  const base = DEFAULT_DEPARTMENTS.map((d) => ({ ...d }))
  if (!Array.isArray(raw)) return base
  for (const item of raw) {
    const r = record(item)
    const option = str(r.option)
    const target = base.find((d) => d.option === option)
    if (!target) continue
    target.name = typeof r.name === 'string' ? r.name : target.name
    target.label = typeof r.label === 'string' ? r.label : target.label
    target.phone = typeof r.phone === 'string' ? r.phone : target.phone
  }
  return base
}

function readStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : []
}

function readPronunciations(raw: unknown): PronunciationHint[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => {
      const r = record(item)
      return { term: str(r.term), sounds_like: str(r.sounds_like) }
    })
    .filter((p) => p.term.trim() || p.sounds_like.trim())
}

function readLeadFields(raw: unknown): LeadFieldKey[] | null {
  if (!Array.isArray(raw)) return null
  const valid = new Set(LEAD_FIELDS.map((f) => f.key as string))
  return raw.filter((v): v is LeadFieldKey => typeof v === 'string' && valid.has(v))
}

/** `GET /app/settings` may answer `{ settings }` or the bare row. */
export function unwrapSettings(raw: unknown): Record<string, unknown> {
  const obj = record(raw)
  const inner = obj.settings
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>
  }
  return obj
}

/**
 * Build the wizard form from the persisted `business_settings` row plus the
 * onboarding draft. Settings always win for settings-backed fields — the draft
 * only supplies wizard-only preferences.
 */
export function formFromServer(
  rawSettings: unknown,
  rawDraft: unknown
): OnboardingForm {
  const s = unwrapSettings(rawSettings)
  const d = record(rawDraft)
  const base = emptyOnboardingForm()

  const language = (['en', 'pa', 'hi'] as string[]).includes(str(d.language))
    ? (str(d.language) as LangCode)
    : base.language

  const routing = AFTER_HOURS_ROUTING.some((r) => r.value === str(d.after_hours_routing))
    ? (str(d.after_hours_routing) as AfterHoursRouting)
    : base.after_hours_routing

  return {
    display_name: str(s.display_name) || str(s.business_name) || str(d.display_name),
    legal_name: str(s.legal_name) || str(d.legal_name),
    website: str(d.website) || str(s.website),
    location: str(s.location) || str(d.location),
    industry: str(d.industry) || str(s.industry),
    timezone: str(s.timezone) || str(d.timezone),
    owner_phone: str(s.owner_phone) || str(d.owner_phone),
    owner_email: str(s.owner_email) || str(d.owner_email),

    operating_hours: 'operating_hours' in s ? readHours(s.operating_hours) : readHours(d.operating_hours),
    after_hours_greeting:
      'after_hours_greeting' in s
        ? readLangText(s.after_hours_greeting)
        : readLangText(d.after_hours_greeting),

    greeting: str(s.greeting) || str(d.greeting),
    receptionist_name: str(d.receptionist_name),
    tone: TONES.some((t) => t.value === str(d.tone)) ? str(d.tone) : base.tone,
    language,
    tts_provider: str(s.tts_provider) || str(d.tts_provider) || base.tts_provider,
    voice_id: str(s.voice_id) || str(d.voice_id),
    pronunciations: readPronunciations(d.pronunciations),
    spelling_terms: readStringArray(d.spelling_terms),

    transfer_mode: str(s.transfer_mode) === 'conference' ? 'conference' : 'warm',
    fallback_line: str(s.fallback_line) || str(d.fallback_line),
    departments: 'departments' in s ? readDepartments(s.departments) : readDepartments(d.departments),
    after_hours_routing: routing,

    required_lead_fields: readLeadFields(d.required_lead_fields) ?? base.required_lead_fields,

    booking_enabled: bool(s.booking_enabled, bool(d.booking_enabled, base.booking_enabled)),
  }
}

/* ───────────────────────────── Writers ───────────────────────────── */

/** Departments with a name, ready for `business_settings.departments`. */
function departmentsPayload(f: OnboardingForm): Department[] {
  return f.departments
    .filter((d) => d.name.trim() || d.phone.trim())
    .map((d) => {
      const out: Department = { name: d.name.trim(), option: d.option, phone: d.phone.trim() }
      if (d.label && d.label.trim()) out.label = d.label.trim()
      return out
    })
}

/**
 * The `business_settings` columns owned by a given step. Only these are sent to
 * `PATCH /app/settings`, so a save never clobbers a field the user is not on.
 */
export function settingsPatchForStep(
  step: number,
  f: OnboardingForm
): Record<string, unknown> {
  switch (step) {
    case 1:
      return {
        display_name: f.display_name.trim(),
        legal_name: f.legal_name.trim(),
        location: f.location.trim(),
        timezone: f.timezone.trim(),
        owner_phone: f.owner_phone.trim(),
        owner_email: f.owner_email.trim(),
      }
    case 2:
      return {
        operating_hours: f.operating_hours,
        after_hours_greeting: {
          en: f.after_hours_greeting.en.trim(),
          pa: f.after_hours_greeting.pa.trim(),
          hi: f.after_hours_greeting.hi.trim(),
        },
        timezone: f.timezone.trim(),
      }
    case 3:
      return {
        greeting: f.greeting.trim(),
        tts_provider: f.tts_provider.trim(),
        voice_id: f.voice_id.trim(),
      }
    case 4:
      return {
        owner_phone: f.owner_phone.trim(),
        transfer_mode: f.transfer_mode,
        fallback_line: f.fallback_line.trim(),
        departments: departmentsPayload(f),
      }
    case 5:
      return {}
    case 6:
      // `calendar_enabled` is owned by the calendar connection itself, not by
      // this toggle — writing it here would claim a connection we do not have.
      return { booking_enabled: f.booking_enabled }
    default:
      return {}
  }
}

/** Everything the wizard keeps in the onboarding draft. */
export function draftFromForm(f: OnboardingForm): Record<string, unknown> {
  return {
    website: f.website.trim(),
    industry: f.industry,
    receptionist_name: f.receptionist_name.trim(),
    tone: f.tone,
    language: f.language,
    pronunciations: f.pronunciations
      .map((p) => ({ term: p.term.trim(), sounds_like: p.sounds_like.trim() }))
      .filter((p) => p.term || p.sounds_like),
    spelling_terms: f.spelling_terms.map((t) => t.trim()).filter(Boolean),
    after_hours_routing: f.after_hours_routing,
    required_lead_fields: f.required_lead_fields,
    booking_enabled: f.booking_enabled,
  }
}

/* ───────────────────────────── Validation ───────────────────────────── */

/**
 * Names that mean "I have not filled this in yet". Rejected on step 1 so the AI
 * never introduces itself as "New Business".
 */
const PLACEHOLDER_NAMES = new Set([
  'test',
  'tests',
  'testing',
  'test business',
  'test company',
  'new business',
  'new company',
  'my business',
  'my company',
  'business',
  'company',
  'untitled',
  'untitled business',
  'demo',
  'demo business',
  'sample',
  'sample business',
  'example',
  'example business',
  'placeholder',
  'foo',
  'bar',
  'asdf',
  'qwerty',
  'abc',
  'xyz',
  'n/a',
  'na',
  'none',
  'tbd',
  'todo',
  'your business',
  'business name',
])

export function isPlaceholderName(value: string): boolean {
  const v = value.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!v) return false
  if (PLACEHOLDER_NAMES.has(v)) return true
  if (/^(test|testing|demo|sample|placeholder|untitled)\b/.test(v)) return true
  // "aaaa", "1234" and other keyboard mashing.
  if (/^(.)\1+$/.test(v.replace(/\s/g, ''))) return true
  if (/^\d+$/.test(v)) return true
  return false
}

/** Digits only, so `(416) 555-0123` and `+14165550123` compare equal. */
export function phoneDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

/** A dialable number: 10–15 digits once punctuation is stripped. */
export function isDialablePhone(value: string): boolean {
  const d = phoneDigits(value)
  return d.length >= 10 && d.length <= 15
}

export function isEmail(value: string): boolean {
  const v = value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
}

export type StepErrors = Partial<Record<string, string>>

/** Field-keyed validation for a single step. Empty object === valid. */
export function validateStep(step: number, f: OnboardingForm): StepErrors {
  const e: StepErrors = {}

  if (step === 1) {
    const name = f.display_name.trim()
    if (!name) e.display_name = 'Enter the business name callers will hear.'
    else if (name.length < 2) e.display_name = 'That name looks too short to be real.'
    else if (isPlaceholderName(name))
      e.display_name = `"${name}" looks like a placeholder. Enter the real business name.`

    if (!f.timezone.trim()) e.timezone = 'Choose the timezone your business operates in.'
    else if (!isIanaTimezone(f.timezone)) e.timezone = 'Choose a timezone from the list.'

    if (f.owner_phone.trim() && !isDialablePhone(f.owner_phone))
      e.owner_phone = 'Enter 10–15 digits, including the country code.'
    if (f.owner_email.trim() && !isEmail(f.owner_email))
      e.owner_email = 'Enter a valid email address.'
  }

  if (step === 2) {
    if (!f.timezone.trim()) e.timezone = 'Hours need a timezone. Set it on step 1 or choose one here.'
    else if (!isIanaTimezone(f.timezone)) e.timezone = 'Choose a timezone from the list.'

    let anyOpen = false
    for (const { key, label } of DAYS) {
      const hours = f.operating_hours[key]
      if (hours === null) continue
      anyOpen = true
      const [open, close] = hours
      if (!isHHMM(open) || !isHHMM(close)) {
        e[`hours_${key}`] = `${label} times must be HH:MM.`
      } else if (minutesOf(open) >= minutesOf(close)) {
        e[`hours_${key}`] = `${label} opens at or after it closes.`
      }
    }
    if (!anyOpen) e.operating_hours = 'Mark at least one day as open.'
  }

  if (step === 3) {
    const greeting = f.greeting.trim()
    if (!greeting) e.greeting = 'Write the greeting callers hear when the AI answers.'
    else if (greeting.length < 10) e.greeting = 'That greeting is too short to say out loud.'

    if (!f.tts_provider.trim()) e.tts_provider = 'Choose a voice provider.'
    if (!f.voice_id.trim()) e.voice_id = 'Choose or enter the voice the AI speaks with.'
    else if (f.tts_provider === 'openai' && !OPENAI_VOICES.includes(f.voice_id.trim()))
      e.voice_id = `OpenAI voices are: ${OPENAI_VOICES.join(', ')}.`

    f.pronunciations.forEach((p, i) => {
      if (p.term.trim() && !p.sounds_like.trim())
        e[`pron_${i}`] = 'Add how this term should be pronounced.'
      if (!p.term.trim() && p.sounds_like.trim()) e[`pron_${i}`] = 'Add the term this applies to.'
    })
  }

  if (step === 4) {
    if (!f.owner_phone.trim()) e.owner_phone = 'Enter the number the AI transfers callers to.'
    else if (!isDialablePhone(f.owner_phone))
      e.owner_phone = 'Enter 10–15 digits, including the country code.'

    if (f.fallback_line.trim() && !isDialablePhone(f.fallback_line))
      e.fallback_line = 'Enter 10–15 digits, including the country code.'

    if (f.after_hours_routing === 'forward' && !f.owner_phone.trim())
      e.after_hours_routing = 'After-hours forwarding needs a forwarding number.'

    f.departments.forEach((d, i) => {
      const phone = d.phone.trim()
      if (!phone) return
      if (!d.name.trim()) e[`dept_name_${i}`] = 'Name this department.'
      if (!isDialablePhone(phone) && !isE164(phone))
        e[`dept_phone_${i}`] = 'Enter 10–15 digits, including the country code.'
    })
  }

  if (step === 5) {
    if (f.required_lead_fields.length === 0)
      e.required_lead_fields = 'Require at least one field, or the AI cannot pass on a lead.'
    if (
      !f.required_lead_fields.includes('phone') &&
      !f.required_lead_fields.includes('email')
    )
      e.required_lead_fields =
        'Require a callback number or an email — otherwise you cannot reach the caller back.'
  }

  return e
}

/** True when the step has no validation errors. */
export function isStepValid(step: number, f: OnboardingForm): boolean {
  return Object.keys(validateStep(step, f)).length === 0
}

/* ───────────────────────────── Presentation helpers ───────────────────────────── */

/**
 * Exactly what the caller hears: the greeting as typed, with the supported
 * tokens resolved. No tokens → the text is returned verbatim.
 */
export function greetingPreview(f: OnboardingForm): string {
  const business = f.display_name.trim()
  const receptionist = f.receptionist_name.trim()
  return f.greeting
    .replace(/\{\{?\s*(business_name|business|display_name)\s*\}?\}/gi, business)
    .replace(/\{\{?\s*(receptionist_name|assistant_name|name)\s*\}?\}/gi, receptionist)
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** "Mon–Fri 08:00–18:00 · Sat closed" style summary for the review step. */
export function summarizeHours(hours: OperatingHours): string[] {
  return DAYS.map(({ key, label }) => {
    const h = hours[key]
    return h === null ? `${label}: Closed` : `${label}: ${h[0]}–${h[1]}`
  })
}

/** Local `HH:MM` for the autosave indicator. */
export function formatSavedAt(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/** Human label for a readiness issue whose `field` maps to a wizard step. */
export const FIELD_STEP: Record<string, number> = {
  display_name: 1,
  legal_name: 1,
  location: 1,
  timezone: 1,
  owner_email: 1,
  operating_hours: 2,
  after_hours_greeting: 2,
  greeting: 3,
  greetings: 3,
  voice_id: 3,
  tts_provider: 3,
  owner_phone: 4,
  fallback_line: 4,
  transfer_mode: 4,
  departments: 4,
  routing_rules: 4,
  transfer_rules: 4,
  booking_enabled: 6,
  calendar: 6,
  calendar_enabled: 6,
  phone: 7,
  phone_number: 7,
  sms: 7,
  email: 7,
}

export function stepForField(field: string): number | null {
  return FIELD_STEP[field] ?? null
}
