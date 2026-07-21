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
import { pickArray } from '@/lib/parse'

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
  // Contract fields (GET /app/leads → { leads: [...] }):
  intent?: string | null
  summary?: string | null
  status?: string | null
  callback_requested?: boolean | null
  tags?: string[] | null
  assigned_to?: string | null
  created_at?: string | null
  updated_at?: string | null
  // Tolerated extras used by some UI (may be absent in the contract):
  email?: string | null
  stage?: string | null
  source?: string | null
  value?: number | null
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
  // Contract fields (GET /app/appointments → { appointments: [...] }):
  customer_name?: string | null
  customer_phone?: string | null
  service?: string | null
  preferred_date?: string | null
  preferred_time?: string | null
  status?: string | null
  scheduled_start?: string | null
  created_at?: string | null
  // Tolerated extras / legacy aliases:
  title?: string | null
  phone?: string | null
  start_at?: string | null
  end_at?: string | null
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

// ─── Onboarding (GET/PATCH /app/onboarding, POST /app/onboarding/activate) ────
export interface OnboardingStateRecord {
  business_id?: string | null
  /** 1‑based step the tenant should resume on. */
  current_step: number
  /** Steps the backend considers really finished. */
  completed_steps: number[]
  draft: Record<string, unknown>
  last_saved_at?: string | null
  completed_at?: string | null
  activated_at?: string | null
  [k: string]: unknown
}

/** A blocker or warning surfaced by the backend readiness check. */
export interface ReadinessIssue {
  field: string
  message: string
}

export interface OnboardingReadiness {
  ready: boolean
  blockers: ReadinessIssue[]
  warnings: ReadinessIssue[]
}

export interface OnboardingIntegrations {
  calendar: boolean
  phone: boolean
  sms: { enabled: boolean; deliverable: boolean; reason?: string | null }
  email: boolean
}

export interface OnboardingResponse {
  state: OnboardingStateRecord
  totalSteps: number
  readiness: OnboardingReadiness
  integrations: OnboardingIntegrations
}

export interface OnboardingSaveResponse {
  state: OnboardingStateRecord
  savedAt?: string | null
}

export interface OnboardingActivateResponse {
  ok?: boolean
  alreadyActive?: boolean
  activatedAt?: string | null
  warnings?: ReadinessIssue[]
}

/** Body of a `422 activation_blocked` response from POST /app/onboarding/activate. */
export interface ActivationBlockedBody {
  error: 'activation_blocked'
  blockers: ReadinessIssue[]
  warnings?: ReadinessIssue[]
}

// ─── Assistant (GET/POST /app/assistant*) ────────────────────────────────────
export interface AssistantTool {
  name: string
  description?: string | null
  risk?: string | null
  [k: string]: unknown
}

/** What this release of the assistant is allowed to do. Read-only today. */
export interface AssistantCapabilities {
  readOnly: boolean
  canChangeConfiguration: boolean
  note: string
}

export interface AssistantOverview {
  enabled: boolean
  surface?: string | null
  capabilities: AssistantCapabilities
  tools: AssistantTool[]
}

export interface AssistantConversation {
  id: string
  title?: string | null
  created_at?: string | null
  updated_at?: string | null
  [k: string]: unknown
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant' | string
  content: string
  /** Backend-provided evidence for a stored reply (tool names, when present). */
  sources?: unknown
  created_at?: string | null
  [k: string]: unknown
}

export interface AssistantReply {
  reply: string
  toolsUsed: string[]
}

/** One tool invocation from the audit trail — including `refused` runs. */
export interface AssistantRun {
  id: string
  tool_name?: string | null
  risk_level?: string | null
  status?: string | null
  error_class?: string | null
  started_at?: string | null
  completed_at?: string | null
  [k: string]: unknown
}

// ─── Website import (GET/POST /app/assistant/import*) ────────────────────────
//
// The import proposes; it never writes settings. `applied` is carried on every
// shape below and is always false in this release, so the UI has a real field
// to render rather than an assumption to make.

export interface ImportJob {
  id: string
  requested_url: string
  resolved_url?: string | null
  status: 'queued' | 'running' | 'succeeded' | 'partial' | 'failed' | 'blocked' | string
  /** Guard vocabulary: blocked_scheme, resolves_to_private, timeout, … */
  error_class?: string | null
  error_detail?: string | null
  pages_fetched?: number | null
  created_at?: string | null
  completed_at?: string | null
}

export interface ImportPage {
  id: string
  url: string
  final_url?: string | null
  http_status?: number | null
  byte_count?: number | null
  status: 'fetched' | 'skipped' | 'blocked' | 'failed' | string
  skip_reason?: string | null
}

export interface ImportReview {
  id: string
  candidate_id: string
  decision: 'accepted' | 'rejected' | 'edited' | 'deferred' | string
  edited_value?: string | null
  note?: string | null
  /** Null until a separate approved change actually applies the value. */
  applied_at?: string | null
  created_at?: string | null
}

export interface ImportCandidate {
  id: string
  field_key: string
  value_text?: string | null
  value_json?: unknown
  /** `verified` = read from structured markup. `inferred` = guessed from prose. */
  derivation: 'verified' | 'inferred' | string
  confidence: number
  source_url?: string | null
  evidence?: string | null
  /** Prices, guarantees, regulated claims. Never auto-acceptable at any confidence. */
  high_risk: boolean
  risk_reason?: string | null
  /** Another page on the same site gave a different value for this field. */
  conflict?: boolean
  review?: ImportReview | null
  applied: boolean
}

export interface ImportSummary {
  pagesFetched: number
  pagesBlocked: number
  candidates: number
  verified: number
  inferred: number
  highRisk: number
  conflicts: number
  injectionPages: number
}

export interface ImportStartResponse {
  jobId: string
  status: ImportJob['status']
  summary: ImportSummary
  applied: false
  note: string
}

export interface ImportJobDetail {
  job: ImportJob
  pages: ImportPage[]
  candidates: ImportCandidate[]
}

// ─── Approved configuration changes (Level 1 writes) ─────────────────────────
//
// The assistant proposes; a person approves; applying is a third, separate
// call. `applied` and `verified` are distinct on purpose — a change can be
// applied and still not confirmed to have landed, and the UI must not collapse
// those into a tick.

export interface WriteDiff {
  field: string
  label: string
  current: unknown
  proposed: unknown
  unchanged: boolean
  summary: string
}

export interface WriteApproval {
  id: string
  tool_name: string
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'applied' | 'undone' | string
  proposed_input?: { field?: string; value?: unknown } | null
  current_value?: Record<string, unknown> | null
  proposed_value?: Record<string, unknown> | null
  expires_at?: string | null
  created_at?: string | null
  decided_at?: string | null
  applied_at?: string | null
  /** Set only when a re-read confirmed the value actually changed. */
  verified_at?: string | null
  undone_at?: string | null
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
    // GET /app/leads → { leads: [...] }. Unwrap to a plain array so every
    // consumer (dashboard, CRM, calls) gets a real array, never an object.
    list: (query?: RequestOptions['query']) =>
      apiFetch<unknown>('/app/leads', { query }).then((r) => pickArray<Lead>(r, 'leads')),
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
    // GET /app/appointments → { appointments: [...] }. Unwrap to a plain array.
    list: (query?: RequestOptions['query']) =>
      apiFetch<unknown>('/app/appointments', { query }).then((r) =>
        pickArray<Appointment>(r, 'appointments')
      ),
  },

  settings: {
    get: () => apiFetch<Settings>('/app/settings'),
    update: (body: Partial<Settings>) =>
      apiFetch<Settings>('/app/settings', { method: 'PATCH', body }),
  },

  onboarding: {
    get: () => apiFetch<OnboardingResponse>('/app/onboarding'),
    /** Persist wizard progress. `completedStep` marks a step really finished. */
    save: (body: {
      currentStep: number
      completedStep?: number
      draft?: Record<string, unknown>
    }) =>
      apiFetch<OnboardingSaveResponse>('/app/onboarding', { method: 'PATCH', body }),
    /** Throws `ApiError` (422, body `ActivationBlockedBody`) when not ready. */
    activate: () =>
      apiFetch<OnboardingActivateResponse>('/app/onboarding/activate', { method: 'POST' }),
  },

  assistant: {
    /** Feature flag, capability note and the tool catalogue. 403 when off. */
    overview: () => apiFetch<AssistantOverview>('/app/assistant'),
    conversations: {
      list: () =>
        apiFetch<unknown>('/app/assistant/conversations').then((r) =>
          pickArray<AssistantConversation>(r, 'conversations')
        ),
      create: (body: { title?: string } = {}) =>
        apiFetch<{ conversation: AssistantConversation }>('/app/assistant/conversations', {
          method: 'POST',
          body,
        }),
      messages: (conversationId: string) =>
        apiFetch<unknown>(`/app/assistant/conversations/${conversationId}/messages`).then((r) =>
          pickArray<AssistantMessage>(r, 'messages')
        ),
      /** Throws `ApiError` whose body carries the failure code (see lib/assistant). */
      send: (conversationId: string, body: { message: string }) =>
        apiFetch<AssistantReply>(`/app/assistant/conversations/${conversationId}/messages`, {
          method: 'POST',
          body,
        }),
    },
    /** Tool audit trail — successful *and* refused runs. */
    activity: () =>
      apiFetch<unknown>('/app/assistant/activity').then((r) => pickArray<AssistantRun>(r, 'runs')),

    /**
     * Website import. Reads a customer's site under the SSRF guard and returns
     * candidates to review. Nothing it returns has been applied.
     */
    imports: {
      /** Admin only. 409 when an import is already running for this tenant. */
      start: (body: { url: string }) =>
        apiFetch<ImportStartResponse>('/app/assistant/import', { method: 'POST', body }),
      list: () =>
        apiFetch<unknown>('/app/assistant/imports').then((r) => pickArray<ImportJob>(r, 'jobs')),
      get: (jobId: string) => apiFetch<ImportJobDetail>(`/app/assistant/imports/${jobId}`),
      /** Records a decision. Does not apply it — `applied` comes back false. */
      review: (
        candidateId: string,
        body: {
          decision: 'accepted' | 'rejected' | 'edited' | 'deferred'
          editedValue?: string
          note?: string
          /**
           * Required to accept or edit a high-risk value (a price, a guarantee,
           * a medical/legal/financial claim). Omitting it returns 422 with
           * `high_risk_requires_acknowledgement` — deliberately, so that
           * confirming a scraped price is a distinct thing the customer did and
           * not a side effect of clicking the same button as everything else.
           */
          acknowledgeRisk?: boolean
        }
      ) =>
        apiFetch<{ review: ImportReview; applied: false; note: string }>(
          `/app/assistant/imports/candidates/${candidateId}/review`,
          { method: 'POST', body }
        ),
    },

    /**
     * Level 1 configuration changes. Four separate calls because propose,
     * decide, apply and undo are four distinct authenticated acts — collapsing
     * any two would recreate a single call that both requests and performs a
     * change.
     */
    writes: {
      catalogue: () =>
        apiFetch<{ tools: string[]; requiresApproval: true; note: string }>('/app/assistant/writes'),
      /** Returns a diff and a pending approval. Writes nothing. */
      propose: (body: { tool: string; value: unknown; conversationId?: string }) =>
        apiFetch<{ approval: WriteApproval; diff: WriteDiff; applied: false; note: string }>(
          '/app/assistant/writes/propose',
          { method: 'POST', body }
        ),
      /** Approving is not applying — apply re-checks state before writing. */
      decide: (approvalId: string, body: { decision: 'approved' | 'rejected' }) =>
        apiFetch<{ approval: WriteApproval; applied: false; note: string }>(
          `/app/assistant/writes/${approvalId}/decide`,
          { method: 'POST', body }
        ),
      /** 409 `state_changed` when someone edited the setting in the meantime. */
      apply: (approvalId: string) =>
        apiFetch<{ applied: true; verified: boolean; field: string; warning?: string }>(
          `/app/assistant/writes/${approvalId}/apply`,
          { method: 'POST' }
        ),
      undo: (approvalId: string) =>
        apiFetch<{ undone: true; verified: boolean; field: string }>(
          `/app/assistant/writes/${approvalId}/undo`,
          { method: 'POST' }
        ),
      /**
       * Turn reviewed import candidates into pending approvals.
       *
       * Creates proposals only — `applied` comes back false. Without this the
       * approvals screen has no producer at all: the model is deliberately
       * barred from proposing, so a human pressing this button is the only way
       * a change ever reaches the approval queue.
       */
      applyReviewedImport: () =>
        apiFetch<{
          created: { approvalId: string; field: string }[]
          skipped: { field: string; reason: string }[]
          failed: { field: string; error: string }[]
          applied: false
          note: string
        }>('/app/assistant/onboarding/apply-import', { method: 'POST' }),

      history: () =>
        apiFetch<unknown>('/app/assistant/writes/history').then((r) =>
          pickArray<WriteApproval>(r, 'approvals')
        ),
    },
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
  return pickArray<T>(value, 'data', 'items', 'results', 'leads', 'tasks', 'rows', 'appointments')
}
