'use client'

import * as React from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/app/states'
import { useApi } from '@/lib/use-api'
import { api, errorMessage, ApiError, type WriteApproval } from '@/lib/api'
import {
  approvalStatusLine, canApply, canUndo, describeValue, diffFromApproval,
  minutesUntilExpiry, sortApprovals, writeErrorMessage, writeToolLabel,
} from '@/lib/writes'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Approved configuration changes.
 *
 * Deliberately shows the change as three separate steps rather than one
 * button, because they are three separate things: a proposal changes nothing,
 * approving changes nothing, and applying is the only step that touches the
 * receptionist. Compressing them into "Save" would put the customer one click
 * from a live change with no diff in front of them.
 *
 * Applying can fail *after* approval — most importantly when someone else
 * edited the same setting in between. That is surfaced as its own message,
 * because the consequence ("applying now would undo their change") is the part
 * the customer needs, not the word "conflict".
 */
export function ChangesConsole() {
  const history = useApi(() => api.assistant.writes.history(), [])
  const approvals = sortApprovals(history.data ?? [])

  if (history.loading) return <LoadingState label="Loading your changes" />
  if (history.error) return <ErrorState message={history.error} onRetry={history.refetch} />

  const pending = approvals.filter((a) => a.status === 'pending' || a.status === 'approved')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Changes to your receptionist</CardTitle>
          <CardDescription>
            Every change is shown as a before and after, and nothing takes effect until you approve
            and apply it. You can undo a change afterwards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {pending.length > 0
              ? `${pending.length} change${pending.length === 1 ? '' : 's'} waiting for you.`
              : 'Nothing is waiting for your approval.'}
          </p>
        </CardContent>
      </Card>

      {approvals.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No changes yet"
          description="When the assistant suggests a change to your setup, it will appear here for you to review."
        />
      ) : (
        <div className="space-y-3">
          {approvals.map((a) => (
            <ApprovalRow key={a.id} approval={a} onChanged={history.refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApprovalRow({ approval, onChanged }: { approval: WriteApproval; onChanged: () => void }) {
  const [busy, setBusy] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [currentValue, setCurrentValue] = React.useState<unknown>(undefined)

  const diff = diffFromApproval(approval)
  const minutesLeft = minutesUntilExpiry(approval.expires_at)
  const applyable = canApply(approval)
  const undoable = canUndo(approval)
  const appliedUnverified = Boolean(approval.applied_at) && !approval.verified_at

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label)
    setError(null)
    setCurrentValue(undefined)
    try {
      await fn()
      onChanged()
    } catch (err) {
      // The backend returns the value it actually found on a stale-state
      // refusal, so the customer can see what moved rather than just be told no.
      if (err instanceof ApiError) {
        const body = err.body as { error?: string; current?: unknown } | undefined
        setError(writeErrorMessage(body?.error))
        if (body?.current !== undefined) setCurrentValue(body.current)
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className={cn(approval.status === 'pending' && 'border-navy-200', appliedUnverified && 'border-amber-400')}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-sm font-medium">{writeToolLabel(approval.tool_name)}</p>
          <div className="flex shrink-0 gap-1">
            {approval.status === 'pending' ? <Badge variant="amber">Needs your decision</Badge> : null}
            {approval.status === 'approved' ? <Badge variant="outline">Approved</Badge> : null}
            {approval.verified_at ? <Badge variant="success">Applied</Badge> : null}
            {appliedUnverified ? <Badge variant="amber">Unconfirmed</Badge> : null}
            {approval.undone_at ? <Badge variant="secondary">Undone</Badge> : null}
          </div>
        </div>

        {diff ? (
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground line-through">{describeValue(diff.current)}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-medium">{describeValue(diff.proposed)}</span>
            </div>
          </div>
        ) : null}

        {appliedUnverified ? (
          <p className="flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              We saved this but could not confirm it took effect, so we are not claiming it did.
              Check the setting directly before relying on it.
            </span>
          </p>
        ) : null}

        {approval.status === 'pending' && minutesLeft > 0 ? (
          <p className="text-xs text-muted-foreground">
            Expires in {minutesLeft} minute{minutesLeft === 1 ? '' : 's'} if not approved.
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {approval.status === 'pending' ? (
            <>
              <Button
                size="sm"
                disabled={busy !== null}
                onClick={() => run('approve', () => api.assistant.writes.decide(approval.id, { decision: 'approved' }))}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy !== null}
                onClick={() => run('reject', () => api.assistant.writes.decide(approval.id, { decision: 'rejected' }))}
              >
                <XCircle className="mr-1.5 h-4 w-4" aria-hidden />
                Reject
              </Button>
            </>
          ) : null}

          {applyable ? (
            <Button
              size="sm"
              disabled={busy !== null}
              onClick={() => run('apply', () => api.assistant.writes.apply(approval.id))}
            >
              Apply this change
            </Button>
          ) : null}

          {undoable ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy !== null}
              onClick={() => run('undo', () => api.assistant.writes.undo(approval.id))}
            >
              <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden />
              Undo
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          {approvalStatusLine(approval)}
          {approval.created_at ? ` · ${formatDateTime(approval.applied_at || approval.decided_at || approval.created_at)}` : ''}
        </p>

        {error ? (
          <div role="alert" className="space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2">
            <p className="text-xs text-red-700">{error}</p>
            {currentValue !== undefined ? (
              <p className="text-xs text-red-700">
                The setting is currently: <strong>{describeValue(currentValue)}</strong>
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
