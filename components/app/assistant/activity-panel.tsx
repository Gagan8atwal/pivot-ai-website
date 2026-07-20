'use client'

import * as React from 'react'
import { CheckCircle2, Clock, RefreshCw, ScrollText, ShieldOff, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingState } from '@/components/app/states'
import { useApi } from '@/lib/use-api'
import { api } from '@/lib/api'
import { humanizeToolName, runDuration, runTone } from '@/lib/assistant'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const TONE_META = {
  ok: { label: 'Completed', icon: CheckCircle2, className: 'text-green-600' },
  refused: { label: 'Refused', icon: ShieldOff, className: 'text-amber-600' },
  failed: { label: 'Failed', icon: XCircle, className: 'text-red-600' },
  pending: { label: 'Running', icon: Clock, className: 'text-slate-500' },
} as const

/**
 * The tool audit trail. Refused runs are shown deliberately: they are the
 * evidence that the read-only boundary is being enforced.
 */
export function ActivityPanel() {
  const activity = useApi(() => api.assistant.activity(), [])
  const runs = activity.data ?? []

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">Activity</CardTitle>
          <CardDescription>
            Every lookup the assistant ran on your account, including the ones it refused.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={activity.refetch}
          disabled={activity.loading}
        >
          <RefreshCw
            className={cn('mr-1.5 h-4 w-4', activity.loading && 'animate-spin')}
            aria-hidden="true"
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {activity.loading && !activity.data ? (
          <LoadingState label="Loading activity…" />
        ) : activity.error ? (
          <ErrorState
            title="Could not load activity"
            message={activity.error}
            onRetry={activity.refetch}
          />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No activity yet"
            description="Once you ask the assistant something, every lookup it performs is recorded here."
          />
        ) : (
          <ul className="divide-y divide-slate-100" role="list">
            {runs.map((run) => {
              const tone = TONE_META[runTone(run)]
              const Icon = tone.icon
              const duration = runDuration(run)
              return (
                <li
                  key={run.id}
                  className="flex flex-wrap items-start justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy-900">
                      {humanizeToolName(run.tool_name ?? '') || 'Unnamed tool'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDateTime(run.started_at)}
                      {duration ? ` · ${duration}` : ''}
                      {run.risk_level ? ` · ${run.risk_level} risk` : ''}
                    </p>
                    {run.error_class && (
                      <p className="mt-0.5 text-xs text-slate-500">Reason: {run.error_class}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-sm font-medium',
                      tone.className
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tone.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
