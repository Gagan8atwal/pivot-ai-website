/**
 * lib/writes.ts — pure helpers for the approved-changes UI.
 *
 * As with the import screen, the job here is to stop the interface saying more
 * than the backend actually did. Three states get confused constantly and must
 * not be:
 *
 *   approved   a person said yes. Nothing has changed.
 *   applied    the write ran.
 *   verified   we re-read the value afterwards and it really is the new one.
 *
 * Applied-but-unverified is a real outcome — it is what a silent no-op looks
 * like, and this codebase has produced several. It must never render as
 * success.
 */

import type { WriteApproval, WriteDiff } from '@/lib/api'

/** What each write tool changes, in the customer's words. */
const TOOL_LABELS: Record<string, string> = {
  update_business_name: 'Business name',
  update_receptionist_name: 'Receptionist name',
  update_greeting: 'Greeting',
  update_tone: 'Tone',
  update_business_hours: 'Opening hours',
  update_pronunciation_hints: 'Pronunciation hints',
  update_routing: 'Call routing',
  update_lead_capture_fields: 'Details to collect',
  enable_or_disable_booking: 'Appointment booking',
  update_appointment_preferences: 'Appointment preferences',
  update_business_profile: 'Business profile',
}

export function writeToolLabel(tool: string): string {
  if (TOOL_LABELS[tool]) return TOOL_LABELS[tool]
  return String(tool ?? '')
    .replace(/^update_/, '')
    .replace(/[_.]+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

/**
 * One line describing where a change has actually got to.
 *
 * `applied_at` without `verified_at` is called out explicitly rather than
 * shown as done — that combination means the write reported success and the
 * value did not change, which is precisely the failure that is invisible
 * unless something says it out loud.
 */
export function approvalStatusLine(a: Pick<WriteApproval, 'status' | 'applied_at' | 'verified_at' | 'undone_at'>): string {
  if (a.undone_at) return 'Undone. Your previous setting is back.'
  if (a.applied_at && !a.verified_at) return 'Applied, but we could not confirm it took effect.'
  if (a.applied_at) return 'Applied and confirmed.'
  switch (a.status) {
    case 'pending':
      return 'Waiting for your decision. Nothing has changed.'
    case 'approved':
      return 'Approved, not yet applied.'
    case 'rejected':
      return 'Rejected. Nothing was changed.'
    case 'expired':
      return 'Expired before it was applied. Nothing was changed.'
    default:
      return 'Nothing has changed.'
  }
}

/** Whether the UI should offer an Apply button. */
export function canApply(a: Pick<WriteApproval, 'status' | 'expires_at'>, now = new Date()): boolean {
  if (a.status !== 'approved') return false
  if (!a.expires_at) return true
  return new Date(a.expires_at).getTime() > now.getTime()
}

/**
 * Whether undo is offered.
 *
 * Only for a change that was applied AND confirmed. Offering undo on an
 * unverified apply would promise to restore a value we are not sure was ever
 * replaced.
 */
export function canUndo(a: Pick<WriteApproval, 'status' | 'applied_at' | 'verified_at' | 'undone_at'>): boolean {
  return a.status === 'applied' && Boolean(a.applied_at) && Boolean(a.verified_at) && !a.undone_at
}

/** Minutes left before an approval expires; 0 once it has. */
export function minutesUntilExpiry(expiresAt?: string | null, now = new Date()): number {
  if (!expiresAt) return 0
  const ms = new Date(expiresAt).getTime() - now.getTime()
  return ms <= 0 ? 0 : Math.ceil(ms / 60_000)
}

/** Render a value for a diff. Never prints "null" or "undefined" at a customer. */
export function describeValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '(not set)'
  if (typeof v === 'boolean') return v ? 'on' : 'off'
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(describeValue).join(', ')
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k}: ${val === null ? 'closed' : describeValue(val)}`)
      .join('; ')
  }
  return String(v)
}

/**
 * Why an apply was refused, in plain language.
 *
 * `state_changed` is the one that matters: it means someone else edited the
 * setting after this change was approved, so applying would silently overwrite
 * an edit the approver never saw. Saying "conflict" would not tell them that.
 */
const APPLY_ERRORS: Record<string, string> = {
  state_changed:
    'This setting was changed by someone else after you approved this. Applying now would undo their change, so we stopped. Review it again against the current value.',
  args_changed: 'The details of this change no longer match what you approved. Propose it again.',
  expired: 'This approval expired. Propose the change again.',
  already_applied: 'This change was already applied.',
  not_approved_rejected: 'This change was rejected.',
  not_approved_pending: 'This has not been approved yet.',
  unbound_approval: 'This approval is too old to apply safely. Propose the change again.',
  no_change: 'That is already the current value.',
  applier_required: 'You need to be signed in to apply a change.',
  decider_required: 'A change must be approved by a person.',
  cannot_restore_unset_value:
    'This setting had no value before the change, so there is nothing to restore. Clearing it is a separate action.',
}

export function writeErrorMessage(error?: string | null): string {
  const key = String(error ?? '').trim()
  if (!key) return 'That did not work.'
  if (APPLY_ERRORS[key]) return APPLY_ERRORS[key]
  if (key.startsWith('invalid_')) {
    return `That value was rejected by validation (${key.replace(/^invalid_/, '')}).`
  }
  if (key.startsWith('write_failed')) return 'The change could not be saved. Nothing was altered.'
  return `That did not work (${key}).`
}

/** Pending first — they are the only ones needing action. */
export function sortApprovals(list: WriteApproval[]): WriteApproval[] {
  const rank = (a: WriteApproval) =>
    a.status === 'pending' ? 0 : a.status === 'approved' ? 1 : a.status === 'applied' ? 2 : 3
  return [...list].sort(
    (a, b) => rank(a) - rank(b) || String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
  )
}

/** Build a display diff from a stored approval, for the history view. */
export function diffFromApproval(a: WriteApproval): WriteDiff | null {
  const field = a.proposed_input?.field
  if (!field) return null
  const current = a.current_value?.[field] ?? null
  const proposed = a.proposed_value?.[field] ?? a.proposed_input?.value ?? null
  return {
    field,
    label: writeToolLabel(a.tool_name),
    current,
    proposed,
    unchanged: describeValue(current) === describeValue(proposed),
    summary: `${writeToolLabel(a.tool_name)}: ${describeValue(current)} → ${describeValue(proposed)}`,
  }
}
