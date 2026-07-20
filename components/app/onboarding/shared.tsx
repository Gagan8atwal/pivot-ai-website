'use client'

import * as React from 'react'
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ONBOARDING_STEPS,
  TOTAL_STEPS,
  formatSavedAt,
  stepForField,
  type OnboardingForm,
  type StepErrors,
} from '@/lib/onboarding'
import type { OnboardingIntegrations, ReadinessIssue } from '@/lib/api'

/* ───────────────────────────── Step contract ───────────────────────────── */

export interface StepProps {
  form: OnboardingForm
  patch: (p: Partial<OnboardingForm>) => void
  errors: StepErrors
  integrations: OnboardingIntegrations
  /** Disabled while a blocking save is in flight. */
  busy: boolean
}

/* ───────────────────────────── Field wrapper ───────────────────────────── */

/**
 * Label + control + inline error, wired for screen readers: the control gets
 * `aria-invalid` and `aria-describedby` pointing at the message.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string
  label: string
  hint?: React.ReactNode
  error?: string
  required?: boolean
  className?: string
  children: (a: { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined }) => React.ReactNode
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium leading-none text-navy-900">
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1.5 text-xs text-red-600">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export const errorRing = 'border-red-300 focus:border-red-400 focus:ring-red-100'

/* ───────────────────────────── Progress rail ───────────────────────────── */

export function StepRail({
  current,
  completed,
  onSelect,
}: {
  current: number
  /** Server-confirmed completed steps — never the step you happen to be on. */
  completed: number[]
  onSelect: (step: number) => void
}) {
  const done = new Set(completed)
  const furthest = Math.max(current, ...(completed.length ? completed.map((s) => s + 1) : [1]))

  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex flex-wrap gap-1.5 sm:gap-2">
        {ONBOARDING_STEPS.map((s) => {
          const isDone = done.has(s.id)
          const isCurrent = s.id === current
          const reachable = isDone || s.id <= furthest
          return (
            <li key={s.id} className="flex-1 basis-[calc(50%-0.375rem)] sm:basis-0 sm:min-w-[92px]">
              <button
                type="button"
                onClick={() => reachable && onSelect(s.id)}
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'group flex w-full flex-col gap-1.5 rounded-lg border p-2 text-left transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30',
                  isCurrent
                    ? 'border-navy-900 bg-navy-900/5'
                    : isDone
                      ? 'border-green-200 bg-green-50/60 hover:bg-green-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  !reachable && 'cursor-not-allowed opacity-60 hover:bg-white'
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                      isDone
                        ? 'bg-green-600 text-white'
                        : isCurrent
                          ? 'bg-navy-900 text-white'
                          : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : s.id}
                  </span>
                  <span
                    className={cn(
                      'truncate text-xs font-semibold',
                      isCurrent ? 'text-navy-900' : isDone ? 'text-green-700' : 'text-slate-500'
                    )}
                  >
                    {s.short}
                  </span>
                </span>
                <span className="sr-only">
                  Step {s.id} of {TOTAL_STEPS}: {s.title}
                  {isDone ? ' — completed' : ''}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ───────────────────────────── Save indicator ───────────────────────────── */

export type SaveStatus =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'saving' }
  | { status: 'saved'; at: string }
  | { status: 'error'; message: string }

export function SaveIndicator({ state, onRetry }: { state: SaveStatus; onRetry: () => void }) {
  if (state.status === 'idle') {
    return (
      <span className="text-xs text-slate-400" role="status">
        All changes saved
      </span>
    )
  }
  if (state.status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400" role="status">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Unsaved changes
      </span>
    )
  }
  if (state.status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500" role="status">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Saving…
      </span>
    )
  }
  if (state.status === 'saved') {
    const at = formatSavedAt(state.at)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-600" role="status">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        {at ? `Saved ${at}` : 'Saved'}
      </span>
    )
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-red-600" role="alert">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Save failed — {state.message}
      <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-700" onClick={onRetry}>
        Retry
      </Button>
    </span>
  )
}

/* ───────────────────────────── Issue lists ───────────────────────────── */

export function IssueList({
  issues,
  tone,
  onFix,
  emptyLabel,
}: {
  issues: ReadinessIssue[]
  tone: 'blocker' | 'warning'
  onFix?: (step: number) => void
  emptyLabel?: string
}) {
  if (issues.length === 0) {
    return emptyLabel ? <p className="text-sm text-slate-500">{emptyLabel}</p> : null
  }
  const blocking = tone === 'blocker'
  return (
    <ul className="space-y-2" role="list">
      {issues.map((issue, i) => {
        const step = stepForField(issue.field)
        return (
          <li
            key={`${issue.field}-${i}`}
            className={cn(
              'flex flex-wrap items-start gap-2 rounded-lg border p-3 text-sm',
              blocking ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'
            )}
          >
            {blocking ? (
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
            )}
            <span className="min-w-0 flex-1">{issue.message}</span>
            {step && onFix && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onFix(step)}
              >
                Fix in step {step}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/* ───────────────────────────── Status rows ───────────────────────────── */

export function StatusRow({
  name,
  state,
  detail,
}: {
  name: string
  state: 'connected' | 'not-connected' | 'pending'
  detail?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-navy-900">{name}</p>
        {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
      </div>
      {state === 'connected' && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Connected
        </span>
      )}
      {state === 'not-connected' && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400">
          <XCircle className="h-4 w-4" aria-hidden="true" /> Not connected
        </span>
      )}
      {state === 'pending' && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
          <Clock className="h-4 w-4" aria-hidden="true" /> Pending
        </span>
      )}
    </div>
  )
}

/** SMS is deliberately never shown as "working" or as "broken". */
export function SmsPendingNote({ integrations }: { integrations: OnboardingIntegrations }) {
  const reason = integrations.sms?.reason ?? ''
  const a2p = !integrations.sms?.deliverable
  if (!a2p) return null
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" aria-hidden="true" />
      <span>
        <strong className="font-semibold">Text messaging is not available yet.</strong> Your number is
        waiting on carrier A2P 10DLC registration
        {reason === 'a2p_registration_pending' ? '' : reason ? ` (${reason})` : ''}, so outbound texts
        will not be delivered until the carriers approve it. Nothing is broken — everything else works,
        and texting switches on automatically once registration clears.
      </span>
    </div>
  )
}
