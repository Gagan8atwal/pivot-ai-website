'use client'

import * as React from 'react'
import {
  CheckCircle2,
  Loader2,
  Phone,
  RefreshCw,
  Rocket,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IssueList, StatusRow, SmsPendingNote } from '@/components/app/onboarding/shared'
import {
  AFTER_HOURS_ROUTING,
  LEAD_FIELDS,
  ONBOARDING_STEPS,
  TONES,
  greetingPreview,
  summarizeHours,
  type OnboardingForm,
} from '@/lib/onboarding'
import { TRANSFER_MODES } from '@/lib/settings-ivr'
import type { OnboardingIntegrations, OnboardingReadiness, ReadinessIssue } from '@/lib/api'

export interface ReviewStepProps {
  form: OnboardingForm
  readiness: OnboardingReadiness
  integrations: OnboardingIntegrations
  /** The number the backend answers on, when one is provisioned. */
  assignedPhone: string
  activatedAt: string | null
  activating: boolean
  refreshing: boolean
  /** Blockers returned by a 422 from POST /app/onboarding/activate. */
  activationBlockers: ReadinessIssue[]
  activationWarnings: ReadinessIssue[]
  activationError: string | null
  activatedMessage: string | null
  onFix: (step: number) => void
  onActivate: () => void
  onRefresh: () => void
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-full break-words text-right text-sm font-medium text-navy-900">
        {value || <span className="font-normal text-slate-400">Not set</span>}
      </span>
    </div>
  )
}

function SummaryCard({
  step,
  children,
  onFix,
}: {
  step: number
  children: React.ReactNode
  onFix: (step: number) => void
}) {
  const meta = ONBOARDING_STEPS[step - 1]
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby={`summary-${step}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 id={`summary-${step}`} className="text-sm font-semibold text-navy-900">
          {step}. {meta.title}
        </h3>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onFix(step)}>
          Edit
        </Button>
      </div>
      {children}
    </section>
  )
}

export function StepReview({
  form,
  readiness,
  integrations,
  assignedPhone,
  activatedAt,
  activating,
  refreshing,
  activationBlockers,
  activationWarnings,
  activationError,
  activatedMessage,
  onFix,
  onActivate,
  onRefresh,
}: ReviewStepProps) {
  const blockers = activationBlockers.length > 0 ? activationBlockers : readiness.blockers
  const warnings = activationWarnings.length > 0 ? activationWarnings : readiness.warnings
  const canActivate = readiness.ready && !activating && !refreshing

  return (
    <div className="space-y-6">
      {activatedAt && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
          <span>
            <strong className="font-semibold">Your AI receptionist is live.</strong> Activated{' '}
            {new Date(activatedAt).toLocaleString()}. Calls to your number are being answered now.
          </span>
        </div>
      )}

      {/* Blockers / warnings */}
      <section aria-labelledby="readiness-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 id="readiness-heading" className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            <ShieldAlert className="h-4 w-4 text-navy-700" aria-hidden="true" /> Readiness
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw
              className={`mr-1 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {refreshing ? 'Re-checking…' : 'Re-check'}
          </Button>
        </div>

        {blockers.length > 0 ? (
          <>
            <p className="text-sm text-slate-600">
              {blockers.length === 1
                ? '1 thing must be fixed before you can go live:'
                : `${blockers.length} things must be fixed before you can go live:`}
            </p>
            <IssueList issues={blockers} tone="blocker" onFix={onFix} />
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
            <span>Everything required is in place. You are ready to activate.</span>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              Not blocking, but worth knowing before you go live:
            </p>
            <IssueList issues={warnings} tone="warning" onFix={onFix} />
          </div>
        )}
      </section>

      {/* Phone number + integrations */}
      <section aria-labelledby="integrations-heading" className="space-y-3">
        <h3 id="integrations-heading" className="flex items-center gap-2 text-sm font-semibold text-navy-900">
          <Phone className="h-4 w-4 text-navy-700" aria-hidden="true" /> Number & integrations
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-navy-900">Your AI receptionist number</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {assignedPhone
                ? 'Callers reach your AI on this number.'
                : integrations.phone
                  ? 'A number is provisioned for this business; the exact number is not exposed here yet.'
                  : 'No number has been provisioned for this business yet.'}
            </p>
          </div>
          {assignedPhone ? (
            <Badge variant="secondary" className="text-sm">
              {assignedPhone}
            </Badge>
          ) : (
            <Badge variant={integrations.phone ? 'secondary' : 'outline'}>
              {integrations.phone ? 'Provisioned' : 'Not provisioned'}
            </Badge>
          )}
        </div>

        <StatusRow name="Voice / phone" state={integrations.phone ? 'connected' : 'not-connected'} />
        <StatusRow
          name="Calendar (booking)"
          state={integrations.calendar ? 'connected' : 'not-connected'}
          detail={
            form.booking_enabled
              ? 'Booking is switched on, so a connected calendar is required.'
              : 'Booking is off, so no calendar is required.'
          }
        />
        <StatusRow name="Email notifications" state={integrations.email ? 'connected' : 'not-connected'} />
        <StatusRow
          name="Text messaging (SMS)"
          state={integrations.sms?.deliverable ? 'connected' : 'pending'}
          detail={
            integrations.sms?.deliverable
              ? undefined
              : 'Awaiting carrier A2P 10DLC registration — texts are not delivered until it clears.'
          }
        />
        <SmsPendingNote integrations={integrations} />
      </section>

      {/* Summaries */}
      <section aria-labelledby="summary-heading" className="space-y-3">
        <h3 id="summary-heading" className="text-sm font-semibold text-navy-900">
          What you configured
        </h3>

        <div className="grid gap-3 lg:grid-cols-2">
          <SummaryCard step={1} onFix={onFix}>
            <Row label="Business name" value={form.display_name} />
            <Row label="Legal name" value={form.legal_name} />
            <Row label="Industry" value={form.industry} />
            <Row label="Website" value={form.website} />
            <Row label="Location" value={form.location} />
            <Row label="Timezone" value={form.timezone} />
            <Row label="Owner phone" value={form.owner_phone} />
            <Row label="Owner email" value={form.owner_email} />
          </SummaryCard>

          <SummaryCard step={2} onFix={onFix}>
            <ul className="space-y-1">
              {summarizeHours(form.operating_hours).map((line) => (
                <li key={line} className="flex justify-between border-b border-slate-100 py-1.5 text-sm last:border-0">
                  <span className="text-slate-500">{line.split(':')[0]}</span>
                  <span className="font-medium text-navy-900">
                    {line.slice(line.indexOf(':') + 1).trim()}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <Row
                label="After-hours greeting"
                value={form.after_hours_greeting[form.language]?.trim()}
              />
            </div>
          </SummaryCard>

          <SummaryCard step={3} onFix={onFix}>
            <Row label="Receptionist" value={form.receptionist_name} />
            <Row label="Tone" value={TONES.find((t) => t.value === form.tone)?.label ?? form.tone} />
            <Row label="Voice" value={`${form.tts_provider}${form.voice_id ? ` · ${form.voice_id}` : ''}`} />
            <Row label="Pronunciation hints" value={String(form.pronunciations.length)} />
            <Row label="Spelling-sensitive terms" value={String(form.spelling_terms.length)} />
            <div className="mt-3 rounded-lg border border-navy-900/15 bg-navy-900/[0.03] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Greeting</p>
              <p className="mt-1 text-sm text-navy-900">
                {greetingPreview(form) ? `“${greetingPreview(form)}”` : 'Not set'}
              </p>
            </div>
          </SummaryCard>

          <SummaryCard step={4} onFix={onFix}>
            <Row label="Forwarding number" value={form.owner_phone} />
            <Row
              label="Transfer style"
              value={TRANSFER_MODES.find((m) => m.value === form.transfer_mode)?.label ?? form.transfer_mode}
            />
            <Row label="Fallback line" value={form.fallback_line} />
            <Row
              label="After hours"
              value={AFTER_HOURS_ROUTING.find((r) => r.value === form.after_hours_routing)?.label}
            />
            <Row
              label="Departments"
              value={
                form.departments
                  .filter((d) => (d.label ?? d.name).trim())
                  .map((d) => `${d.label ?? d.name}${d.phone ? ` (${d.phone})` : ''}`)
                  .join(', ') || ''
              }
            />
          </SummaryCard>

          <SummaryCard step={5} onFix={onFix}>
            <Row
              label="Required of every caller"
              value={
                LEAD_FIELDS.filter((f) => form.required_lead_fields.includes(f.key))
                  .map((f) => f.label)
                  .join(', ') || ''
              }
            />
          </SummaryCard>

          <SummaryCard step={6} onFix={onFix}>
            <Row label="AI books appointments" value={form.booking_enabled ? 'Yes' : 'No'} />
            <Row label="Calendar connected" value={integrations.calendar ? 'Yes' : 'No'} />
          </SummaryCard>
        </div>
      </section>

      {/* Activate */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        {activationError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {activationError}
          </p>
        )}
        {activatedMessage && (
          <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {activatedMessage}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {readiness.ready
              ? 'Activating puts your AI receptionist on live calls immediately.'
              : 'Clear the blockers above to enable activation.'}
          </p>
          <Button
            type="button"
            size="lg"
            onClick={onActivate}
            disabled={!canActivate}
            aria-describedby={readiness.ready ? undefined : 'readiness-heading'}
            className="flex-shrink-0"
          >
            {activating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Rocket className="mr-1.5 h-4 w-4" aria-hidden="true" />
            )}
            {activating ? 'Activating…' : activatedAt ? 'Re-activate' : 'Activate my AI receptionist'}
          </Button>
        </div>
      </section>
    </div>
  )
}
