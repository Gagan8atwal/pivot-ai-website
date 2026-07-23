'use client'

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Gauge,
  ServerCog,
  ShieldCheck,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  SLO_ORDER,
  SLO_STATE_META,
  metric24h,
  metricAvailability,
  percent,
  stateCount,
  type SloMetricName,
  type SloResponse,
  type SloState,
} from '@/lib/slo'
import { cn } from '@/lib/utils'

const STATE_ICONS = {
  healthy: CheckCircle2,
  degraded: AlertTriangle,
  critical: AlertTriangle,
  unknown: CircleHelp,
} satisfies Record<SloState, typeof CheckCircle2>

function readableReason(reason: string | null | undefined): string {
  if (!reason) return 'No additional evidence detail is available.'
  const labels: Record<string, string> = {
    missing: 'Evidence has not been produced for this window.',
    no_traffic: 'No eligible events occurred in this window.',
    insufficient_samples: 'There are not enough eligible events to support a reliability conclusion.',
    incomplete_window: 'The source window is incomplete, so no reliability conclusion is made.',
    stale: 'The evidence is too old to support a current conclusion.',
    invalid_counts: 'The aggregate counters failed validation.',
    invalid_timestamp: 'The evidence timestamp is invalid.',
    timestamp_in_future: 'The evidence timestamp is unexpectedly in the future.',
  }
  return labels[reason] ?? reason.replaceAll('_', ' ')
}

function stateBadgeClass(state: SloState): string | undefined {
  if (state === 'critical') return 'border-red-200 bg-red-100 text-red-800'
  if (state === 'healthy') return 'border-green-200 bg-green-100 text-green-800'
  return undefined
}

function MetricCard({ data, name }: { data: SloResponse; name: SloMetricName }) {
  const metric = data.metrics[name]
  const state = SLO_STATE_META[metric.state]
  const Icon = STATE_ICONS[metric.state]
  const window = metric24h(data, name)
  const availability = metricAvailability(data, name)
  const hasCounts = Number.isFinite(Number(window?.good)) && Number.isFinite(Number(window?.total))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-navy-700" aria-hidden="true" />
            <div className="min-w-0">
              <CardTitle className="text-base">{metric.label}</CardTitle>
              <CardDescription className="mt-1">Internal objective {percent(metric.objective)}</CardDescription>
            </div>
          </div>
          <Badge
            variant={state.badge}
            className={cn('flex-shrink-0', stateBadgeClass(metric.state))}
          >
            {metric.state}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {availability ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-600">
            {availability}
          </p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">24-hour result</p>
                <p className="mt-1 text-2xl font-bold text-navy-900">{percent(window?.success_rate)}</p>
              </div>
              {hasCounts ? (
                <p className="text-right text-xs text-slate-500">
                  {window?.good ?? 0} of {window?.total ?? 0} eligible events
                </p>
              ) : null}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              {window?.state === 'unknown'
                ? readableReason(window.reason)
                : window?.state === 'burning_budget'
                  ? `The 24-hour window is below the internal objective. Observed burn: ${window.burn_rate ?? 'unknown'}×.`
                  : 'The 24-hour aggregate is within the internal objective.'}
            </p>
          </>
        )}
        {metric.breaches.length > 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            {metric.breaches.map((breach) => breach.detail).join(' ')}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function GuardrailRow({
  label,
  state,
  reason,
}: {
  label: string
  state: SloState
  reason?: string | null
}) {
  const meta = SLO_STATE_META[state]
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div>
        <p className="font-medium text-navy-900">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{readableReason(reason)}</p>
      </div>
      <Badge variant={meta.badge} className={cn('flex-shrink-0', stateBadgeClass(state))}>
        {state}
      </Badge>
    </div>
  )
}

export function ReliabilityEvidence({
  data,
  loading,
  error,
  notEnabled,
}: {
  data: SloResponse | null
  loading: boolean
  error: string | null
  notEnabled: boolean
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-slate-600">
          <Activity className="h-5 w-5 animate-pulse text-navy-700" aria-hidden="true" />
          Loading reliability evidence…
        </CardContent>
      </Card>
    )
  }

  if (notEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5 text-navy-700" aria-hidden="true" />
            Reliability evidence
          </CardTitle>
          <CardDescription>The backend reliability evidence contract is not enabled in this environment.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          The operational queue above remains available. No reliability status is inferred while this protected endpoint is unavailable.
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-700" aria-hidden="true" />
            Reliability evidence could not be loaded
          </CardTitle>
          <CardDescription>This does not change or hide the operational queue above.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {error ?? 'No aggregate reliability response was returned.'}
        </CardContent>
      </Card>
    )
  }

  const overall = SLO_STATE_META[data.state]
  const OverallIcon = STATE_ICONS[data.state]

  return (
    <section aria-labelledby="reliability-evidence-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="reliability-evidence-heading" className="flex items-center gap-2 text-xl font-semibold text-navy-900">
            <Gauge className="h-5 w-5 text-navy-700" aria-hidden="true" />
            Reliability evidence
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Aggregate internal pilot objectives. This is not a contractual SLA and does not trigger remediation, provider actions, or customer-data changes.
          </p>
        </div>
        <Badge variant="outline">Policy {data.policy_version}</Badge>
      </div>

      <div className={cn('rounded-xl border p-5', overall.className)} role="status">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <OverallIcon className="mt-0.5 h-6 w-6 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">{overall.label}</p>
              <p className="mt-1 text-sm opacity-90">{overall.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{stateCount(data, 'healthy')} healthy</Badge>
            <Badge variant="secondary">{stateCount(data, 'degraded')} degraded</Badge>
            <Badge variant="secondary">{stateCount(data, 'critical')} critical</Badge>
            <Badge variant="secondary">{stateCount(data, 'unknown')} unknown</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SLO_ORDER.map((name) => (
          <MetricCard key={name} data={data} name={name} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ServerCog className="h-5 w-5 text-navy-700" aria-hidden="true" />
              Processing guardrails
            </CardTitle>
            <CardDescription>Worker and queue evidence remains unknown until durable telemetry is deployed.</CardDescription>
          </CardHeader>
          <CardContent>
            <GuardrailRow
              label="Worker heartbeat"
              state={data.guardrails.workers.state}
              reason={data.availability.workers ?? data.guardrails.workers.reason}
            />
            <GuardrailRow
              label="Durable queue"
              state={data.guardrails.queue.state}
              reason={data.availability.queue ?? data.guardrails.queue.reason}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-navy-700" aria-hidden="true" />
              Evidence boundary
            </CardTitle>
            <CardDescription>The endpoint returns aggregate reliability evidence only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Source rows, customer contact details, call content, provider identifiers, raw database errors, and remediation controls are excluded.</p>
            <p>Missing, stale, incomplete, unavailable, or low-volume evidence is shown as unknown—never as healthy.</p>
            <p className="text-xs text-slate-400">
              Evidence generated {data.evidence_generated_at ?? 'Unknown'} · Route label {data.route}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
