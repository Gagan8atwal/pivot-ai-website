'use client'

import * as React from 'react'
import {
  AlertTriangle, CheckCircle2, ExternalLink, FileSearch, Globe, Loader2,
  MinusCircle, Pencil, ShieldAlert, XCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/app/states'
import { useApi } from '@/lib/use-api'
import { api, errorMessage, type ImportCandidate, type ImportJobDetail } from '@/lib/api'
import {
  derivationLabel, fieldLabel, importErrorMessage, jobStatusLabel,
  outstandingCount, reviewStatusLine, riskExplanations, sortForReview, summaryLine,
} from '@/lib/import'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

type Decision = 'accepted' | 'rejected' | 'edited' | 'deferred'

/**
 * Website import.
 *
 * The interface is deliberately not a progress bar with a green tick at the
 * end. An import produces proposals, and the screen's job is to keep that
 * obvious: every reviewed row says "not yet applied" until a separate approved
 * change applies it, and nothing high-risk is ever pre-selected. If a customer
 * leaves this page believing their receptionist now quotes a scraped price,
 * the screen has failed regardless of what the backend did.
 */
export function ImportConsole() {
  const [url, setUrl] = React.useState('')
  const [starting, setStarting] = React.useState(false)
  const [startError, setStartError] = React.useState<string | null>(null)
  const [jobId, setJobId] = React.useState<string | null>(null)

  const jobs = useApi(() => api.assistant.imports.list(), [])

  // Show the most recent import on arrival, so a reviewer who navigated away
  // mid-review comes back to their work rather than an empty form.
  React.useEffect(() => {
    if (!jobId && jobs.data && jobs.data.length > 0) setJobId(jobs.data[0].id)
  }, [jobs.data, jobId])

  async function start(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || starting) return
    setStarting(true)
    setStartError(null)
    try {
      const res = await api.assistant.imports.start({ url: url.trim() })
      setJobId(res.jobId)
      setUrl('')
      jobs.refetch()
    } catch (err) {
      setStartError(errorMessage(err))
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import from your website</CardTitle>
          <CardDescription>
            We read a few public pages of your site and suggest details for your receptionist.
            Nothing is changed — you review every value before it is used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={start} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="yourbusiness.com"
              aria-label="Your website address"
              disabled={starting}
            />
            <Button type="submit" disabled={starting || !url.trim()}>
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Reading your site…
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" aria-hidden />
                  Read my site
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            We read up to 8 pages of the address you give us and follow links on that site only.
            We never sign in, and we do not store a copy of your pages.
          </p>
          {startError ? (
            <p role="alert" className="text-sm text-red-600">
              {startError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {jobId ? <JobReview jobId={jobId} /> : null}

      {jobs.data && jobs.data.length > 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Earlier imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {jobs.data.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setJobId(job.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                  job.id === jobId && 'bg-muted'
                )}
              >
                <span className="truncate">{job.requested_url}</span>
                <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                  {jobStatusLabel(job)} · {formatDateTime(job.created_at)}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function JobReview({ jobId }: { jobId: string }) {
  const detail = useApi<ImportJobDetail>(() => api.assistant.imports.get(jobId), [jobId])

  if (detail.loading) return <LoadingState label="Loading your import" />
  if (detail.error) return <ErrorState message={detail.error} onRetry={detail.refetch} />
  if (!detail.data) return null

  const { job, pages, candidates } = detail.data
  const blocked = job.status === 'blocked' || job.status === 'failed'

  if (blocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-red-600">{jobStatusLabel(job)}</CardTitle>
          <CardDescription>{job.requested_url}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">{importErrorMessage(job.error_class)}</p>
          <p className="text-xs text-muted-foreground">
            Nothing was changed on your account.
          </p>
        </CardContent>
      </Card>
    )
  }

  const sorted = sortForReview(candidates)
  const left = outstandingCount(candidates)
  const summary = {
    pagesFetched: pages.filter((p) => p.status === 'fetched').length,
    pagesBlocked: pages.filter((p) => p.status !== 'fetched').length,
    candidates: candidates.length,
    verified: candidates.filter((c) => c.derivation === 'verified').length,
    inferred: candidates.filter((c) => c.derivation === 'inferred').length,
    highRisk: candidates.filter((c) => c.high_risk).length,
    // Previously hardcoded to 0, because the backend computed conflicts and
    // then discarded them before writing. Now persisted, so the "N disagree
    // between pages" line is reachable in the product for the first time.
    conflicts: candidates.filter((c) => c.conflict).length,
    injectionPages: pages.filter((p) => (p.skip_reason ?? '').includes('injection_language_detected')).length,
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{jobStatusLabel(job)}</CardTitle>
          <CardDescription>
            {job.resolved_url || job.requested_url} · {formatDateTime(job.completed_at || job.created_at)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{summaryLine(summary)}</p>
          <p className="text-sm font-medium">
            {left > 0
              ? `${left} value${left === 1 ? '' : 's'} still need${left === 1 ? 's' : ''} your review.`
              : 'You have reviewed everything from this import.'}
          </p>
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Reviewing does not change your receptionist. Accepted values are applied later as a
            separate change you approve.
          </p>
          {/* Without this button nothing in the product could create an
              approval at all: the model is deliberately barred from proposing,
              so the approvals screen had no producer and would have sat
              permanently empty. It still creates only proposals. */}
          <SendToApprovals candidates={candidates} />
          {summary.injectionPages > 0 ? (
            <p className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                {summary.injectionPages} page{summary.injectionPages === 1 ? '' : 's'} on this site
                contained text written to give an AI instructions. We stored it as plain text and
                acted on none of it. If you did not put it there, it is worth a look.
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Nothing to review"
          description="We read your site but could not find details we recognise."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((candidate) => (
            <CandidateRow key={candidate.id} candidate={candidate} onReviewed={detail.refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

function CandidateRow({
  candidate,
  onReviewed,
}: {
  candidate: ImportCandidate
  onReviewed: () => void
}) {
  const [busy, setBusy] = React.useState<Decision | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState(candidate.value_text ?? '')
  const [confirmed, setConfirmed] = React.useState(false)

  const derivation = derivationLabel(candidate.derivation)
  const risks = riskExplanations(candidate.risk_reason)
  const decided = candidate.review?.decision
  const value = candidate.value_text ?? JSON.stringify(candidate.value_json ?? '')

  async function decide(decision: Decision, editedValue?: string) {
    // Accepting or editing a high-risk value needs the customer to confirm it
    // explicitly. The backend enforces this with a 422 — the checkbox is how
    // they say yes, not a client-side nicety, and the button stays disabled
    // until they do rather than letting them hit an error.
    // Send the acknowledgement only when the customer actually gave it.
    //
    // The first version computed `needsAck` and then sent `acknowledgeRisk:
    // true` unconditionally, without consulting `confirmed`. The checkbox was
    // rendered only in the non-editing branch, so the "Correct it" path
    // asserted a consent the customer was never shown — and the backend
    // recorded a review noting the risk was "acknowledged by reviewer". That is
    // the same defect as the original missing-field bug, inverted: the client
    // asserting a human decision on a path where no human made one.
    const needsAck = candidate.high_risk && (decision === 'accepted' || decision === 'edited')
    if (needsAck && !confirmed) {
      setError('Tick the confirmation box first — this value needs you to confirm it is correct.')
      return
    }
    setBusy(decision)
    setError(null)
    try {
      await api.assistant.imports.review(candidate.id, {
        decision,
        ...(editedValue ? { editedValue } : {}),
        ...(needsAck ? { acknowledgeRisk: true } : {}),
      })
      setEditing(false)
      onReviewed()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className={cn(candidate.high_risk && !decided && 'border-amber-400')}>
      <CardContent className="space-y-3 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{fieldLabel(candidate.field_key)}</p>
            <p className="break-words text-base font-medium">{value}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1">
            <Badge variant={candidate.derivation === 'verified' ? 'default' : 'secondary'}>
              {derivation.label}
            </Badge>
            {candidate.high_risk ? (
              <Badge variant="amber">Needs your sign-off</Badge>
            ) : null}
            {candidate.conflict ? (
              <Badge variant="secondary">Pages disagree</Badge>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{derivation.detail}</p>

        {candidate.conflict ? (
          <p className="text-xs text-amber-900">
            Another page on your site gives a different value for this. Usually that means one of
            them is out of date — worth checking which.
          </p>
        ) : null}

        {risks.length > 0 ? (
          <ul className="space-y-1">
            {risks.map((r) => (
              <li key={r} className="flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {candidate.evidence ? (
          <details className="text-xs">
            {/* Evidence is rendered as text, never as markup — it is content we
                fetched from a site we do not control. */}
            <summary className="cursor-pointer text-muted-foreground">Where this came from</summary>
            <p className="mt-1 whitespace-pre-wrap rounded bg-muted px-2 py-1 font-mono text-[11px]">
              {candidate.evidence}
            </p>
            {candidate.source_url ? (
              <a
                href={candidate.source_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-1 inline-flex items-center gap-1 text-muted-foreground underline"
              >
                {candidate.source_url}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : null}
          </details>
        ) : null}

        {editing ? (
          <div className="space-y-2">
            {candidate.high_risk ? (
              <label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900" data-testid="confirmEditBox">
                <input type="checkbox" className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
                <span>I have checked this against my business and confirm the corrected value is right.</span>
              </label>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label={`Corrected ${fieldLabel(candidate.field_key)}`}
            />
            <Button size="sm" onClick={() => decide('edited', draft)} disabled={!draft.trim() || busy !== null || (candidate.high_risk && !confirmed)}>
              Save correction
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={busy !== null}>
              Cancel
            </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Shown whenever the value is high-risk, not only while
                undecided. Gating it on `!decided` meant that after "Later" or
                "Not right" the checkbox vanished while the accept button
                stayed disabled on `!confirmed` — so every high-risk value was
                one misclick from being permanently unacceptable, with no
                explanation and no way back. */}
            {candidate.high_risk ? (
              <label className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                <span>
                  I have checked this against my business and confirm it is correct and current.
                </span>
              </label>
            ) : null}
            <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => decide('accepted')}
              disabled={busy !== null || (candidate.high_risk && !confirmed)}
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden />
              {candidate.high_risk ? 'I confirm this is correct' : 'Looks right'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={busy !== null}>
              <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
              Correct it
            </Button>
            <Button size="sm" variant="outline" onClick={() => decide('rejected')} disabled={busy !== null}>
              <XCircle className="mr-1.5 h-4 w-4" aria-hidden />
              Not right
            </Button>
            <Button size="sm" variant="ghost" onClick={() => decide('deferred')} disabled={busy !== null}>
              <MinusCircle className="mr-1.5 h-4 w-4" aria-hidden />
              Later
            </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {reviewStatusLine(candidate)}
        </p>

        {error ? (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * Send accepted values to the approvals queue.
 *
 * Creates proposals, not changes — the response says `applied: false` and the
 * button copy says so too. Values that cannot be applied (a scraped price has
 * no write path at all) are reported as skipped with a reason rather than
 * silently dropped, because "we ignored 3 of the 5 things you accepted" is
 * exactly the kind of quiet omission that makes a customer distrust the whole
 * feature.
 */
function SendToApprovals({ candidates }: { candidates: ImportCandidate[] }) {
  const [busy, setBusy] = React.useState(false)
  const [result, setResult] = React.useState<{ created: number; skipped: { field: string; reason: string }[]; failed: { field: string; error: string }[] } | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const acceptedCount = candidates.filter(
    (c) => c.review && (c.review.decision === 'accepted' || c.review.decision === 'edited')
  ).length

  if (acceptedCount === 0) return null

  async function send() {
    setBusy(true)
    setError(null)
    try {
      const r = await api.assistant.writes.applyReviewedImport()
      setResult({ created: r.created.length, skipped: r.skipped, failed: r.failed })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" size="sm" onClick={send} disabled={busy}>
        {busy ? 'Preparing…' : `Send ${acceptedCount} accepted value${acceptedCount === 1 ? '' : 's'} for approval`}
      </Button>
      {result ? (
        <div className="space-y-1 text-xs">
          <p>
            {result.created > 0
              ? `${result.created} change${result.created === 1 ? '' : 's'} are waiting on the Changes page. Nothing has been applied yet.`
              : 'No new changes were created — these values are already set, or cannot be applied automatically.'}
          </p>
          {result.skipped.length > 0 ? (
            <ul className="text-muted-foreground">
              {result.skipped.map((s) => (
                <li key={`${s.field}-${s.reason}`}>
                  {fieldLabel(s.field)}: {s.reason === 'no_approved_write_path'
                    ? 'there is no setting this can safely change'
                    : s.reason === 'already_set'
                      ? 'already matches your current setting'
                      : s.reason.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          ) : null}
          {result.failed.length > 0 ? (
            <ul className="text-red-700">
              {result.failed.map((f) => (
                <li key={f.field}>{fieldLabel(f.field)}: {f.error.replace(/_/g, ' ')}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {error ? <p role="alert" className="text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
