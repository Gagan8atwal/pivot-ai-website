/**
 * lib/assistant.ts — pure helpers for the Pivot Assistant UI.
 *
 * No fetching and no React here: shaping, labelling and error classification
 * only, so the console component stays about rendering.
 */

import { ApiError, type AssistantMessage, type AssistantRun } from '@/lib/api'

/**
 * Starter prompts. Each one maps to something the read-only assistant can
 * genuinely look up — activation readiness, integrations, calls, SMS status.
 */
export const STARTER_PROMPTS = [
  'Am I ready to activate?',
  'What still needs attention?',
  'Check my integrations',
  'Review my recent calls',
  'Why is SMS unavailable?',
] as const

/** Verb prefixes the backend uses on tool names; noise in a UI chip. */
const TOOL_PREFIXES = [
  'get_',
  'list_',
  'fetch_',
  'read_',
  'check_',
  'lookup_',
  'query_',
  'describe_',
  'summarize_',
]

/**
 * Turn a raw tool name into something a business owner can read:
 * `get_setup_status` → `setup status`, `integrations.list` → `integrations`.
 * Never invents meaning — it only strips prefixes and separators.
 */
export function humanizeToolName(name: string): string {
  const raw = String(name ?? '').trim()
  if (!raw) return ''
  let value = raw.toLowerCase().replace(/[.:/]+/g, '_')
  for (const prefix of TOOL_PREFIXES) {
    if (value.startsWith(prefix)) {
      value = value.slice(prefix.length)
      break
    }
  }
  value = value
    // camelCase → spaced words before the separator pass.
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return value || raw
}

/** "checked: setup status, integrations" — the evidence line under a reply. */
export function toolsUsedLabel(tools: string[]): string {
  const names = tools.map(humanizeToolName).filter(Boolean)
  if (names.length === 0) return ''
  return `checked: ${names.join(', ')}`
}

/**
 * Stored messages carry `sources` rather than `toolsUsed`. Accept the shapes
 * the backend can plausibly return (string, array of strings, array of objects
 * with a name/tool key) and ignore anything else rather than guessing.
 */
export function toolsFromSources(sources: unknown): string[] {
  const out: string[] = []
  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) out.push(value.trim())
  }
  if (typeof sources === 'string') push(sources)
  else if (Array.isArray(sources)) {
    for (const item of sources) {
      if (typeof item === 'string') push(item)
      else if (item && typeof item === 'object') {
        const r = item as Record<string, unknown>
        push(r.tool_name ?? r.tool ?? r.name)
      }
    }
  }
  return Array.from(new Set(out))
}

/* ───────────────────────────── Failure codes ───────────────────────────── */

export type AssistantErrorCode =
  | 'assistant_not_enabled'
  | 'empty_message'
  | 'model_unavailable'
  | 'model_error'
  | 'tool_depth_exceeded'
  | 'unknown'

/** Read the backend's machine-readable error code off a thrown value. */
export function assistantErrorCode(err: unknown): AssistantErrorCode {
  const body = err instanceof ApiError ? err.body : undefined
  const raw =
    body && typeof body === 'object' && 'error' in body
      ? String((body as { error: unknown }).error)
      : err instanceof ApiError
        ? err.message
        : ''
  switch (raw) {
    case 'assistant_not_enabled':
    case 'empty_message':
    case 'model_unavailable':
    case 'model_error':
    case 'tool_depth_exceeded':
      return raw
    default:
      return 'unknown'
  }
}

/**
 * Plain-language failure text. Deliberately never a fabricated answer — the
 * user must be able to tell a failure from a reply.
 */
export function assistantErrorText(err: unknown): string {
  switch (assistantErrorCode(err)) {
    case 'assistant_not_enabled':
      return 'The assistant is not enabled for this account.'
    case 'empty_message':
      return 'Type a question before sending.'
    case 'model_unavailable':
      return 'The assistant is temporarily unavailable. Nothing was sent to your account — try again in a moment.'
    case 'tool_depth_exceeded':
      return "Couldn't complete that lookup — it needed more steps than allowed. Try asking about one thing at a time."
    case 'model_error':
      return 'The assistant hit an error answering that. Your question was not lost — try sending it again.'
    default:
      return err instanceof Error && err.message
        ? err.message
        : 'Something went wrong sending that message.'
  }
}

/** True when the tenant is outside the assistant feature flag. */
export function isNotEnabledError(err: unknown): boolean {
  return (
    assistantErrorCode(err) === 'assistant_not_enabled' ||
    (err instanceof ApiError && err.status === 403)
  )
}

/* ───────────────────────────── Display helpers ───────────────────────────── */

export function conversationTitle(title?: string | null): string {
  const t = (title ?? '').trim()
  return t || 'Untitled conversation'
}

/** First line of a message, trimmed, for use as a new conversation's title. */
export function titleFromMessage(message: string): string {
  const line = message.trim().split('\n')[0]?.trim() ?? ''
  if (!line) return 'New conversation'
  return line.length > 60 ? `${line.slice(0, 57)}…` : line
}

export type RunTone = 'ok' | 'refused' | 'failed' | 'pending'

/** Classify an audit-trail run for display. `refused` is a feature, not an error. */
export function runTone(run: Pick<AssistantRun, 'status'>): RunTone {
  const status = (run.status ?? '').toLowerCase()
  if (status === 'refused' || status === 'denied' || status === 'blocked') return 'refused'
  if (status === 'ok' || status === 'success' || status === 'succeeded' || status === 'completed') {
    return 'ok'
  }
  if (status === 'running' || status === 'pending' || status === 'started') return 'pending'
  return 'failed'
}

/** Human duration between a run's start and completion, or '' when unknown. */
export function runDuration(run: Pick<AssistantRun, 'started_at' | 'completed_at'>): string {
  if (!run.started_at || !run.completed_at) return ''
  const start = new Date(run.started_at).getTime()
  const end = new Date(run.completed_at).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return ''
  const ms = end - start
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/** Normalize a stored message so the renderer never sees a missing role/content. */
export function normalizeMessage(value: AssistantMessage, index: number) {
  const role = value.role === 'assistant' ? 'assistant' : 'user'
  return {
    id: String(value.id ?? `stored-${index}`),
    role: role as 'assistant' | 'user',
    content: typeof value.content === 'string' ? value.content : '',
    toolsUsed: toolsFromSources(value.sources),
    createdAt: typeof value.created_at === 'string' ? value.created_at : null,
  }
}
