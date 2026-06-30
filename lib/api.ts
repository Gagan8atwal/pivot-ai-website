/**
 * lib/api.ts — Typed fetch client for the ai-receptionist-voice backend.
 *
 * - Targets `process.env.NEXT_PUBLIC_API_BASE`
 *   (default `https://ai-receptionist-voice.onrender.com`).
 * - Attaches `Authorization: Bearer <supabase access token>` to `/app/*`
 *   (and `/auth/ensure-tenant`) calls automatically.
 * - Returns typed responses and throws a typed `ApiError` on failure.
 *
 * This is a *consumer* of the backend. No business/DB/auth logic lives here.
 */

import { getAccessToken } from '@/lib/auth'
import { normalizeBaseUrl } from '@/lib/url'

// Strip whitespace + ALL trailing slashes so `${API_BASE}${path}` never yields
// a double slash (which can produce an invalid request path).
export const API_BASE =
  normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE) ||
  'https://ai-receptionist-voice.onrender.com'

export const isApiConfigured = Boolean(process.env.NEXT_PUBLIC_API_BASE?.trim())

// ─── Error type ───────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

// ─── Core request helper ──────────────────────────────────────────────────────
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  /** Force-attach the bearer token even for non-/app paths. */
  auth?: boolean
  signal?: AbortSignal
}

function needsAuth(path: string, explicit?: boolean): boolean {
  if (explicit) return true
  return path.startsWith('/app') || path.startsWith('/auth/ensure-tenant')
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE}${path.startsWith('/') ? path : `/${path}`}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, query, auth, signal } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (needsAuth(path, auth)) {
    const token = await getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (err) {
    throw new ApiError(
      `Could not reach the backend. ${(err as Error)?.message ?? ''}`.trim(),
      0,
      err
    )
  }

  const text = await res.text()
  let parsed: unknown = undefined
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === 'object' && 'error' in parsed
        ? String((parsed as { error: unknown }).error)
        : undefined) ||
      (parsed && typeof parsed === 'object' && 'message' in parsed
        ? String((parsed as { message: unknown }).message)
        : undefined) ||
      `Request failed (${res.status})`
    throw new ApiError(message, res.status, parsed)
  }

  return parsed as T
}

// ─── Domain types (per the backend contract) ──────────────────────────────────
export type Role =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'dispatcher'
  | 'mechanic'
  | 'employee'
  | 'member'
  | 'driver'
  | 'viewer'

export const ROLE_RANK: Record<Role, number> = {
  owner: 4,
  admin: 3,
  manager: 3,
  dispatcher: 2,
  mechanic: 2,
  employee: 2,
  member: 2,
  driver: 1,
  viewer: 1,
}

export function roleRank(role?: string | null): number {
  if (!role) return 0
  return ROLE_RANK[role as Role] ?? 1
}

/** Permission gates derived from role rank: read=1, write>=2, admin>=3, owner=4. */
export const can = {
  read: (role?: string | null) => roleRank(role) >= 1,
  write: (role?: string | null) => roleRank(role) >= 2,
  admin: (role?: string | null) => roleRank(role) >= 3,
  owner: (role?: string | null) => roleRank(role) >= 4,
}

export interface User {
  id: string
  email: string
  name?: string | null
  [k: string]: unknown
}

export interface Business {
  id: string
  name?: string | null
  plan?: string | null
  [k: string]: unknown
}

export interface MeResponse {
  user: User
  business: Business | null
  role: Role | string | null
}

export interface Lead {
  id: string
  name?: string | null
  phone?: string | null
  email?: string | null
  status?: string | null
  stage?: string | null
  source?: string | null
  value?: number | null
  created_at?: string | null
  updated_at?: string | null
  [k: string]: unknown
}

export interface LeadNote {
  id: string
  lead_id?: string | null
  body?: string | null
  author?: string | null
  created_at?: string | null
  [k: string]: unknown
}

export interface PipelineStage {
  stage: string
  count: number
  value?: number | null
  leads?: Lead[]
}

export interface Task {
  id: string
  title?: string | null
  status?: string | null
  due_at?: string | null
  assignee?: string | null
  lead_id?: string | null
  created_at?: string | null
  [k: string]: unknown
}

export interface Appointment {
  id: string
  title?: string | null
  customer_name?: string | null
  phone?: string | null
  start_at?: string | null
  end_at?: string | null
  status?: string | null
  notes?: string | null
  [k: string]: unknown
}

export interface Settings {
  business_name?: string | null
  greeting?: string | null
  voice_instructions?: string | null
  hours?: unknown
  faqs?: unknown
  services?: unknown
  policies?: unknown
  [k: string]: unknown
}

export interface KnowledgeItem {
  id: string
  type?: string | null
  question?: string | null
  answer?: string | null
  title?: string | null
  body?: string | null
  created_at?: string | null
  [k: string]: unknown
}

export interface TeamMember {
  user_id: string
  email?: string | null
  name?: string | null
  role: Role | string
  status?: string | null
  [k: string]: unknown
}

export interface Billing {
  plan?: string | null
  status?: string | null
  current_period_end?: string | null
  amount?: number | null
  currency?: string | null
  invoices?: Invoice[]
  [k: string]: unknown
}

export interface Invoice {
  id: string
  amount?: number | null
  currency?: string | null
  status?: string | null
  created_at?: string | null
  url?: string | null
  [k: string]: unknown
}

export interface SmsLog {
  id: string
  direction?: string | null
  from?: string | null
  to?: string | null
  body?: string | null
  status?: string | null
  created_at?: string | null
  [k: string]: unknown
}

export interface EmailLog {
  id: string
  direction?: string | null
  from?: string | null
  to?: string | null
  subject?: string | null
  status?: string | null
  created_at?: string | null
  [k: string]: unknown
}

export interface Usage {
  [k: string]: unknown
}

// ─── Typed API surface ────────────────────────────────────────────────────────
export const api = {
  // Auth (token attached only where the contract requires it)
  auth: {
    signup: (body: { email: string; password: string; [k: string]: unknown }) =>
      apiFetch<{ ok?: boolean; [k: string]: unknown }>('/auth/signup', {
        method: 'POST',
        body,
      }),
    login: (body: { email: string; password: string }) =>
      apiFetch<{ access_token: string; [k: string]: unknown }>('/auth/login', {
        method: 'POST',
        body,
      }),
    forgotPassword: (body: { email: string }) =>
      apiFetch('/auth/forgot-password', { method: 'POST', body }),
    resetPassword: (body: { password: string; token?: string }) =>
      apiFetch('/auth/reset-password', { method: 'POST', body }),
    ensureTenant: () =>
      apiFetch<{ business?: Business; [k: string]: unknown }>(
        '/auth/ensure-tenant',
        { method: 'POST', auth: true }
      ),
  },

  me: () => apiFetch<MeResponse>('/app/me'),

  leads: {
    list: (query?: RequestOptions['query']) =>
      apiFetch<Lead[]>('/app/leads', { query }),
    get: (id: string) => apiFetch<Lead>(`/app/leads/${id}`),
    update: (id: string, body: Partial<Lead>) =>
      apiFetch<Lead>(`/app/leads/${id}`, { method: 'PATCH', body }),
    notes: {
      list: (leadId: string) =>
        apiFetch<LeadNote[]>(`/app/leads/${leadId}/notes`),
      create: (leadId: string, body: { body: string }) =>
        apiFetch<LeadNote>(`/app/leads/${leadId}/notes`, {
          method: 'POST',
          body,
        }),
    },
  },

  pipeline: () => apiFetch<PipelineStage[]>('/app/pipeline'),

  tasks: {
    list: (query?: RequestOptions['query']) =>
      apiFetch<Task[]>('/app/tasks', { query }),
    create: (body: Partial<Task>) =>
      apiFetch<Task>('/app/tasks', { method: 'POST', body }),
    update: (id: string, body: Partial<Task>) =>
      apiFetch<Task>(`/app/tasks/${id}`, { method: 'PATCH', body }),
  },

  appointments: {
    list: (query?: RequestOptions['query']) =>
      apiFetch<Appointment[]>('/app/appointments', { query }),
  },

  settings: {
    get: () => apiFetch<Settings>('/app/settings'),
    update: (body: Partial<Settings>) =>
      apiFetch<Settings>('/app/settings', { method: 'PATCH', body }),
  },

  knowledge: {
    list: (query?: RequestOptions['query']) =>
      apiFetch<KnowledgeItem[]>('/app/knowledge', { query }),
    create: (body: Partial<KnowledgeItem>) =>
      apiFetch<KnowledgeItem>('/app/knowledge', { method: 'POST', body }),
    update: (id: string, body: Partial<KnowledgeItem>) =>
      apiFetch<KnowledgeItem>(`/app/knowledge/${id}`, { method: 'PATCH', body }),
    remove: (id: string) =>
      apiFetch(`/app/knowledge/${id}`, { method: 'DELETE' }),
  },

  team: {
    list: () => apiFetch<TeamMember[]>('/app/team'),
    invite: (body: { email: string; role: string }) =>
      apiFetch<TeamMember>('/app/team/invite', { method: 'POST', body }),
    update: (userId: string, body: { role: string }) =>
      apiFetch<TeamMember>(`/app/team/${userId}`, { method: 'PATCH', body }),
    remove: (userId: string) =>
      apiFetch(`/app/team/${userId}`, { method: 'DELETE' }),
  },

  billing: {
    get: () => apiFetch<Billing>('/app/billing'),
    changePlan: (body: { plan: string }) =>
      apiFetch('/app/billing/change-plan', { method: 'POST', body }),
    cancel: () => apiFetch('/app/billing/cancel', { method: 'POST' }),
    portal: () => apiFetch<{ url: string }>('/app/billing/portal'),
    /** Public checkout URL for a plan (no auth required). */
    checkoutUrl: (plan: string) => `${API_BASE}/billing/checkout/${plan}`,
  },

  logs: {
    sms: (query?: RequestOptions['query']) =>
      apiFetch<SmsLog[]>('/app/logs/sms', { query }),
    email: (query?: RequestOptions['query']) =>
      apiFetch<EmailLog[]>('/app/logs/email', { query }),
  },

  usage: () => apiFetch<Usage>('/app/usage'),
}

/** Normalize an unknown thrown value into a user-facing message. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Something went wrong.'
}

/**
 * Tolerant list extraction. Backends sometimes wrap arrays as
 * `{ data: [...] }`, `{ items: [...] }`, etc. Returns [] for anything else so
 * the UI can show an honest empty state rather than crash.
 */
export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of ['data', 'items', 'results', 'leads', 'tasks', 'rows', 'appointments']) {
      if (Array.isArray(obj[key])) return obj[key] as T[]
    }
  }
  return []
}
