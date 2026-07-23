'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Lock,
  MailWarning,
  PhoneCall,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { PageHeader } from '@/components/app/page-header'
import { EmptyState, ErrorState, LoadingState, NotConfiguredState } from '@/components/app/states'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/app/auth-provider'
import { ApiError, apiFetch, can, errorMessage, isApiConfigured } from '@/lib/api'
import {
  FINDING_META,
  STATUS_META,
  countAction,
  countFinding,
  formatGeneratedAt,
  type FindingType,
  type ReconciliationResponse,
} from '@/lib/operations'
import { cn } from '@/lib/utils'

const FINDING_ICONS = {
  stale_call: PhoneCall,
  failed_notification: MailWarning,
  aged_lead: Users,
  aged_appointment: CalendarClock,
} satisfies Record<FindingType, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>>

const FINDING_ORDER: FindingType[] = [
  'stale_call',
  'failed_notification',
  'aged_lead',
  'aged_appointment',
]

export default function OperationsPage() {
  const { me } = useAuth()
  const isOwner = can.owner(me?.role)
  const [data, setData] = React.useState<ReconciliationResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [notEnabled, setNotEnabled] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!isApiConfigured || !isOwner) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setNotEnabled(false)
    try {
      const result = await apiFetch<ReconciliationResponse>('/app/ops/reconciliation')
      setData(result)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotEnabled(true)
        setData(null)
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }, [isOwner])

  React.useEffect(() => {
    void load()
  }, [load])

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Operations Health" description="Operational queues and reliability signals." />
        <NotConfiguredState feature="Operations Health" />
      </>
    )
  }

  if (!isOwner) {
    return (
      <>
        <PageHeader title="Operations Health" description="Operational queues and reliability signals." />
        <EmptyState
          icon={Lock}
          title="Owner access required"
          description="Only the business owner can view operational reconciliation health for this account."
        />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Operations Health" description="Operational queues and reliability signals." />
        <LoadingState label="Checking operational health…" />
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader title="Operations Health" description="Operational queues and reliability signals." />
        <ErrorState title="Could not load operations health" message={error} onRetry={load} />
      </>
    )
  }

  if (notEnabled) {
    return (
      <>
        <PageHeader title="Operations Health" description="Operational queues and reliability signals." />
        <EmptyState
          icon={ShieldCheck}
          title="Operations Health is not enabled for this account yet"
          description="Nothing is broken. This protected reliability view is being enabled gradually for approved pilot accounts."
        />
      </>
    )
  }

  const status = STATUS_META[data?.status ?? 'healthy']
  const critical = Math.max(0, Number(data?.summary.by_severity.critical ?? 0))
  const warning = Math.max(0, Number(data?.summary.by_severity.warning ?? 0))

  return (
    <>
      <PageHeader
        title="Operations Health"
        description="See unresolved reliability signals and owner follow-up queues without changing call or delivery evidence."
        action={
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <div className="space-y-6">
        <div className={cn('rounded-xl border p-5', status.className)} role="status">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {data?.status === 'healthy' ? (
                <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="mt-0.5 h-6 w-6 flex-shrink-0" aria-hidden="true" />
              )}
              <div>
                <p className="font-semibold">{status.label}</p>
                <p className="mt-1 text-sm opacity-90">{status.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">{critical} critical</Badge>
              <Badge variant="secondary">{warning} warning</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FINDING_ORDER.map((type) => {
            const meta = FINDING_META[type]
            const Icon = FINDING_ICONS[type]
            const count = countFinding(data, type)
            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Icon className="h-5 w-5 text-navy-700" aria-hidden="true" />
                    </div>
                    <span className="text-3xl font-bold text-navy-900">{count}</span>
                  </div>
                  <CardTitle className="pt-2 text-base">{meta.label}</CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs leading-relaxed text-slate-500">
                    {data?.guidance[type] ?? meta.description}
                  </p>
                  <Link
                    href={meta.href}
                    className="inline-flex text-sm font-semibold text-navy-800 hover:text-amber-600"
                  >
                    {meta.actionLabel} →
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-navy-700" aria-hidden="true" />
                Queue summary
              </CardTitle>
              <CardDescription>How the current findings should be handled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <SummaryRow label="Owner follow-up" value={countAction(data, 'owner_queue')} />
              <SummaryRow
                label="Provider verification"
                value={countAction(data, 'provider_verification_required')}
              />
              <SummaryRow label="Manual review" value={countAction(data, 'manual_review')} />
              <SummaryRow label="Dead-letter review" value={countAction(data, 'dead_letter_review')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock3 className="h-5 w-5 text-navy-700" aria-hidden="true" />
                Current thresholds
              </CardTitle>
              <CardDescription>When items begin appearing in this view.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <ThresholdRow
                label="Stale call"
                warning={data?.thresholds_hours.stale_call_warning}
                critical={data?.thresholds_hours.stale_call_critical}
              />
              <ThresholdRow
                label="New lead"
                warning={data?.thresholds_hours.new_lead_warning}
                critical={data?.thresholds_hours.new_lead_critical}
              />
              <ThresholdRow
                label="Appointment request"
                warning={data?.thresholds_hours.appointment_warning}
                critical={data?.thresholds_hours.appointment_critical}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-navy-700" aria-hidden="true" />
                Evidence stays protected
              </CardTitle>
              <CardDescription>This page is a read-only owner summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                It shows counts and safe guidance only. Caller details, message content, provider IDs,
                transcripts, and raw errors are not returned here.
              </p>
              <p>
                Aging alone never completes a call, resends an email, closes a lead, or confirms an
                appointment.
              </p>
              <p className="text-xs text-slate-400">
                Last checked {data ? formatGeneratedAt(data.generated_at) : 'Unknown'} · Policy{' '}
                {data?.policy_version ?? 'Unknown'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-navy-900">{value}</span>
    </div>
  )
}

function ThresholdRow({
  label,
  warning,
  critical,
}: {
  label: string
  warning?: number
  critical?: number
}) {
  return (
    <div className="border-b border-slate-100 py-2 last:border-0">
      <p className="font-medium text-navy-900">{label}</p>
      <p className="mt-1 text-xs text-slate-500">
        Warning after {warning ?? '—'}h · Critical after {critical ?? '—'}h
      </p>
    </div>
  )
}
