/**
 * lib/settings-ivr.ts
 *
 * Pure, framework-free model + validation + mapping for the VS Carriers
 * greetings / IVR settings, bound to the backend `GET/PATCH /app/settings`
 * contract:
 *
 *   ivr_enabled: boolean
 *   transfer_mode: "warm" | "conference"
 *   greetings:            { en?, pa?, hi? }
 *   after_hours_greeting: { en?, pa?, hi? }
 *   holiday_greeting:     { en?, pa?, hi? }
 *   holidays:    string[]                       // "YYYY-MM-DD"
 *   departments: [{ name, label?, option:"1"|"2"|"3", phone }]
 *   operating_hours: { mon:["08:00","18:00"], …, sat:null, sun:null }
 *
 * This file has NO runtime imports (only `import type`, which is erased) and no
 * path aliases, so it can be unit-tested directly with `node scripts/*.mjs`
 * under Node's TypeScript type-stripping.
 */

/* ───────────────────────────── Types ───────────────────────────── */

export type LangCode = 'en' | 'pa' | 'hi'
export type TransferMode = 'warm' | 'conference'
export type DeptOption = '1' | '2' | '3'
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** A greeting block: a string per supported language (form keeps all keys). */
export type LangText = Record<LangCode, string>

export interface Department {
  name: string
  label?: string
  option: DeptOption
  phone: string
}

/** [open, close] in "HH:MM", or null when closed. */
export type DayHours = [string, string] | null
export type OperatingHours = Record<DayKey, DayHours>

export interface IvrSettings {
  ivr_enabled: boolean
  transfer_mode: TransferMode
  greetings: LangText
  after_hours_greeting: LangText
  holiday_greeting: LangText
  holidays: string[]
  departments: Department[]
  operating_hours: OperatingHours
}

/* ───────────────────────────── Constants ───────────────────────────── */

export const LANGS: { code: LangCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
]

export const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

export const TRANSFER_MODES: { value: TransferMode; label: string; description: string }[] = [
  { value: 'warm', label: 'Warm transfer', description: 'AI announces the caller, then connects them.' },
  { value: 'conference', label: 'Conference', description: 'AI stays on the line and bridges both parties.' },
]

const emptyLangText = (): LangText => ({ en: '', pa: '', hi: '' })

/** The three standard departments every tenant starts with (Press 1/2/3). */
export const DEFAULT_DEPARTMENTS: Department[] = [
  { name: 'Dispatch', label: 'Dispatch', option: '1', phone: '' },
  { name: 'Mechanic', label: 'Mechanic', option: '2', phone: '' },
  { name: 'Manager', label: 'Manager', option: '3', phone: '' },
]

export const DEFAULT_OPERATING_HOURS: OperatingHours = {
  mon: ['08:00', '18:00'],
  tue: ['08:00', '18:00'],
  wed: ['08:00', '18:00'],
  thu: ['08:00', '18:00'],
  fri: ['08:00', '18:00'],
  sat: null,
  sun: null,
}

/** A blank but structurally-complete settings form. */
export function emptyIvrSettings(): IvrSettings {
  return {
    ivr_enabled: true,
    transfer_mode: 'warm',
    greetings: emptyLangText(),
    after_hours_greeting: emptyLangText(),
    holiday_greeting: emptyLangText(),
    holidays: [],
    departments: DEFAULT_DEPARTMENTS.map((d) => ({ ...d })),
    operating_hours: { ...DEFAULT_OPERATING_HOURS },
  }
}

/** Pre-filled first-customer template: VS Carriers Inc. */
export const VS_CARRIERS_IVR_DEFAULTS: IvrSettings = {
  ivr_enabled: true,
  transfer_mode: 'warm',
  greetings: {
    en: 'Thank you for calling VS Carriers. This is our AI assistant — how can I help you today?',
    pa: 'VS Carriers nu phone karan layi dhanvaad. Main tuhadi kiven madad kar sakda haan?',
    hi: 'VS Carriers ko call karne ke liye dhanyavaad. Main aapki kaise madad kar sakta hoon?',
  },
  after_hours_greeting: {
    en: "Thanks for calling VS Carriers. We're currently closed. Leave your name, number, and load details and our team will call you back first thing.",
    pa: 'VS Carriers nu phone karan layi dhanvaad. Asi is vele band haan. Apna naam, number te load di jankari chad do, sadi team tuhanu wapas call karegi.',
    hi: 'VS Carriers ko call karne ke liye dhanyavaad. Hum abhi band hain. Apna naam, number aur load ki jankari chhod dein, hamari team aapko wapas call karegi.',
  },
  holiday_greeting: {
    en: 'Thanks for calling VS Carriers. We are closed for the holiday today. Please leave a message and we will return your call on the next business day.',
    pa: 'VS Carriers nu phone karan layi dhanvaad. Aj chhutti karke asi band haan. Kirpa karke message chad do.',
    hi: 'VS Carriers ko call karne ke liye dhanyavaad. Aaj chhutti ke karan hum band hain. Kripya sandesh chhod dein.',
  },
  holidays: [],
  departments: [
    { name: 'Dispatch', label: 'Dispatch', option: '1', phone: '' },
    { name: 'Mechanic', label: 'Mechanic', option: '2', phone: '' },
    { name: 'Manager', label: 'Sunny', option: '3', phone: '' },
  ],
  operating_hours: {
    mon: ['08:00', '18:00'],
    tue: ['08:00', '18:00'],
    wed: ['08:00', '18:00'],
    thu: ['08:00', '18:00'],
    fri: ['08:00', '18:00'],
    sat: ['09:00', '14:00'],
    sun: null,
  },
}

/* ───────────────────────────── Validators ───────────────────────────── */

/** E.164: a leading + and 8–15 digits (first digit non-zero). */
export function isE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone.trim())
}

/** Strict calendar date "YYYY-MM-DD" (also rejects impossible dates like 02-30). */
export function isYmd(value: string): boolean {
  const v = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  if (m < 1 || m > 12 || d < 1 || d > 31) return false
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

/** 24-hour "HH:MM". */
export function isHHMM(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim())
}

/** Minutes since midnight for an "HH:MM" string (NaN if malformed). */
export function minutesOf(value: string): number {
  if (!isHHMM(value)) return NaN
  const [h, m] = value.split(':').map(Number)
  return h * 60 + m
}

/**
 * Validate a full IvrSettings form. Returns a list of human-readable errors;
 * an empty array means the form is valid.
 */
export function validateIvrSettings(s: IvrSettings): string[] {
  const errors: string[] = []

  if (s.transfer_mode !== 'warm' && s.transfer_mode !== 'conference') {
    errors.push('Transfer mode must be "warm" or "conference".')
  }

  // Departments: unique options, valid phones (when provided).
  const seen = new Set<string>()
  for (const d of s.departments) {
    if (!d.name.trim()) errors.push(`Department for Press ${d.option} needs a name.`)
    if (!['1', '2', '3'].includes(d.option)) {
      errors.push(`Department "${d.name || '?'}" has an invalid menu option.`)
    }
    if (seen.has(d.option)) errors.push(`Two departments share Press ${d.option}.`)
    seen.add(d.option)
    if (d.phone.trim() && !isE164(d.phone)) {
      errors.push(`${d.name || `Press ${d.option}`} phone must be E.164 (e.g. +15555550123).`)
    }
  }

  // Holidays: well-formed unique dates.
  const holidaySeen = new Set<string>()
  for (const h of s.holidays) {
    if (!isYmd(h)) errors.push(`Holiday "${h}" must be a valid YYYY-MM-DD date.`)
    else if (holidaySeen.has(h)) errors.push(`Holiday "${h}" is listed twice.`)
    holidaySeen.add(h)
  }

  // Operating hours: valid times, open before close.
  for (const { key, label } of DAYS) {
    const hours = s.operating_hours[key]
    if (hours === null) continue
    if (!Array.isArray(hours) || hours.length !== 2) {
      errors.push(`${label} hours are malformed.`)
      continue
    }
    const [open, close] = hours
    if (!isHHMM(open) || !isHHMM(close)) {
      errors.push(`${label} hours must be HH:MM (24-hour).`)
    } else if (minutesOf(open) >= minutesOf(close)) {
      errors.push(`${label} open time must be before its close time.`)
    }
  }

  return errors
}

/* ───────────────────────────── Mapping ───────────────────────────── */

function readLangText(raw: unknown): LangText {
  const out = emptyLangText()
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    for (const code of ['en', 'pa', 'hi'] as LangCode[]) {
      if (typeof obj[code] === 'string') out[code] = obj[code] as string
    }
  }
  return out
}

function readHours(raw: unknown): OperatingHours {
  const out: OperatingHours = { ...DEFAULT_OPERATING_HOURS }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    for (const { key } of DAYS) {
      if (key in obj) {
        const v = obj[key]
        if (v === null) out[key] = null
        else if (Array.isArray(v) && v.length === 2) {
          out[key] = [String(v[0]), String(v[1])]
        }
      }
    }
  }
  return out
}

function readDepartments(raw: unknown): Department[] {
  // Start from the three standard rows, overlay any backend values by option.
  const base = DEFAULT_DEPARTMENTS.map((d) => ({ ...d }))
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue
      const r = item as Record<string, unknown>
      const option = String(r.option ?? '') as DeptOption
      const target = base.find((d) => d.option === option)
      const dept: Department = {
        name: typeof r.name === 'string' ? r.name : target?.name ?? '',
        label: typeof r.label === 'string' ? r.label : target?.label,
        option: (['1', '2', '3'].includes(option) ? option : target?.option ?? '1') as DeptOption,
        phone: typeof r.phone === 'string' ? r.phone : '',
      }
      if (target) Object.assign(target, dept)
      else base.push(dept)
    }
  }
  return base
}

/** Build a complete editable form from a raw `GET /app/settings` response. */
export function normalizeIvrSettings(raw: unknown): IvrSettings {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    ivr_enabled: typeof obj.ivr_enabled === 'boolean' ? obj.ivr_enabled : true,
    transfer_mode: obj.transfer_mode === 'conference' ? 'conference' : 'warm',
    greetings: readLangText(obj.greetings),
    after_hours_greeting: readLangText(obj.after_hours_greeting),
    holiday_greeting: readLangText(obj.holiday_greeting),
    holidays: Array.isArray(obj.holidays) ? obj.holidays.filter((h) => typeof h === 'string') : [],
    departments: readDepartments(obj.departments),
    operating_hours: readHours(obj.operating_hours),
  }
}

/**
 * Build the exact `PATCH /app/settings` payload from the form. Greetings keep
 * all three language keys (empty string clears a language). Department labels
 * are omitted when blank.
 */
export function buildIvrPayload(s: IvrSettings): {
  ivr_enabled: boolean
  transfer_mode: TransferMode
  greetings: LangText
  after_hours_greeting: LangText
  holiday_greeting: LangText
  holidays: string[]
  departments: Department[]
  operating_hours: OperatingHours
} {
  return {
    ivr_enabled: s.ivr_enabled,
    transfer_mode: s.transfer_mode,
    greetings: trimLangText(s.greetings),
    after_hours_greeting: trimLangText(s.after_hours_greeting),
    holiday_greeting: trimLangText(s.holiday_greeting),
    holidays: s.holidays.map((h) => h.trim()).filter(Boolean),
    departments: s.departments.map((d) => {
      const out: Department = {
        name: d.name.trim(),
        option: d.option,
        phone: d.phone.trim(),
      }
      if (d.label && d.label.trim()) out.label = d.label.trim()
      return out
    }),
    operating_hours: s.operating_hours,
  }
}

function trimLangText(t: LangText): LangText {
  return { en: t.en.trim(), pa: t.pa.trim(), hi: t.hi.trim() }
}

/* ───────────────────────────── Role gating ───────────────────────────── */

/**
 * Whether a role may WRITE settings (admin and above). Mirrors the app's
 * `can.admin` rule (role rank >= 3: owner, admin, manager).
 */
export function isAdminRole(role?: string | null): boolean {
  if (!role) return false
  return ['owner', 'admin', 'manager'].includes(role.toLowerCase())
}
