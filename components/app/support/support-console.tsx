'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  CreditCard,
  Headphones,
  LifeBuoy,
  MessageSquareText,
  RefreshCw,
  Rocket,
  Send,
  ShieldCheck,
  Smartphone,
  UserRoundCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { useAuth } from '@/components/app/auth-provider'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox, Input, Label, Select, Textarea } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiError, apiFetch, can } from '@/lib/api'
import { cn } from '@/lib/utils'

interface SupportOverview {
  enabled: boolean
  categories: string[]
  priorities: string[]
  openCases: number
  humanReviewAvailable: boolean
  refundReviewAvailable: boolean
  canExecuteRefunds: boolean
  note?: string | null
}

interface SupportCase {
  id: string
  category: string
  priority: string
  status: string
  subject: string
  summary: string
  requires_human: boolean
  escalation_status?: string | null
  escalation_channel?: string | null
  escalated_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface RefundRequest {
  id: string
  support_case_id: string
  invoice_id?: string | null
  amount_minor?: number | null
  currency?: string | null
  reason: string
  status: string
  created_at?: string | null
}

interface CasesResponse {
  cases: SupportCase[]
}

interface RefundsResponse {
  refundRequests: RefundRequest[]
}

const FALLBACK_CATEGORIES = [
  'onboarding',
  'call_flow',
  'integration',
  'billing',
  'refund',
  'account',
  'data',
  'other',
]
const FALLBACK_PRIORITIES = ['low', 'normal', 'high', 'urgent']

function labelize(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function supportError(error: unknown): string {
  const code = error instanceof ApiError ? error.message : error instanceof Error ? error.message : ''
  const messages: Record<string, string> = {
    assistant_not_enabled: 'Customer Help is not enabled for this account yet.',
    invalid_subject: 'Add a clearer subject with at least three characters.',
    invalid_summary: 'Describe the issue in at least three characters.',
    invalid_message: 'Add a follow-up message before sending.',
    invalid_reason: 'Explain why the payment should be reviewed.',
    invalid_amount: 'Enter a valid positive refund amount.',
    amount_exceeds_payment: 'The requested amount is higher than the verified payment.',
    invoice_not_found: 'That invoice was not found in this account.',
    invoice_not_paid: 'That invoice does not show a completed payment.',
    refund_already_pending: 'A refund review is already open for that invoice.',
    billing_unavailable: 'Billing history is temporarily unavailable. Open a billing case for human review.',
    notification_failed: 'The case is recorded, but the text or email notification could not be delivered.',
    case_closed: 'This case is closed. Open a new case for a new issue.',
    not_configured: 'Customer Help is not configured on the backend yet.',
  }
  return messages[code] || code || 'Something went wrong. No action was reported as successful.'
}

function when(value?: string | null): string {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function money(amount?: number | null, currency = 'usd'): string {
  if (amount === null || amount === undefined) return 'Amount to be reviewed'
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function caseBadge(status: string): 'success' | 'amber' | 'secondary' | 'outline' {
  if (status === 'resolved' || status === 'closed') return 'success'
  if (status === 'waiting_on_pivot') return 'amber'
  if (status === 'waiting_on_customer') return 'outline'
  return 'secondary'
}

function priorityBadge(priority: string): 'amber' | 'secondary' | 'outline' {
  if (priority === 'urgent' || priority === 'high') return 'amber'
  if (priority === 'low') return 'outline'
  return 'secondary'
}

function InlineNotice({
  kind,
  children,
}: {
  kind: 'success' | 'error' | 'info'
  children: React.ReactNode
}) {
  const classes = kind === 'success'
    ? 'border-green-200 bg-green-50 text-green-800'
    : kind === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-blue-200 bg-blue-50 text-blue-800'
  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertTriangle : LifeBuoy
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4 text-sm', classes)} role="status">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

function ActionLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-navy-900">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy-900">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-navy-900" />
      </div>
    </Link>
  )
}

export function SupportConsole() {
  const { me } = useAuth()
  const isOwner = can.owner(me?.role)

  const [overview, setOverview] = React.useState<SupportOverview | null>(null)
  const [cases, setCases] = React.useState<SupportCase[]>([])
  const [refunds, setRefunds] = React.useState<RefundRequest[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [tab, setTab] = React.useState('help')

  const [category, setCategory] = React.useState('onboarding')
  const [priority, setPriority] = React.useState('normal')
  const [subject, setSubject] = React.useState('')
  const [summary, setSummary] = React.useState('')
  const [requestHuman, setRequestHuman] = React.useState(false)
  const [creating, setCreating] = React.useState(false)

  const [selectedCaseId, setSelectedCaseId] = React.useState('')
  const [followUp, setFollowUp] = React.useState('')
  const [caseAction, setCaseAction] = React.useState<string | null>(null)

  const [invoiceId, setInvoiceId] = React.useState('')
  const [refundAmount, setRefundAmount] = React.useState('')
  const [refundReason, setRefundReason] = React.useState('')
  const [requestingRefund, setRequestingRefund] = React.useState(false)

  const load = React.useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [support, caseList] = await Promise.all([
        apiFetch<SupportOverview>('/app/assistant/support'),
        apiFetch<CasesResponse>('/app/assistant/support/cases'),
      ])
      setOverview(support)
      setCases(Array.isArray(caseList.cases) ? caseList.cases : [])
      if (isOwner) {
        try {
          const refundList = await apiFetch<RefundsResponse>('/app/assistant/support/refund-requests')
          setRefunds(Array.isArray(refundList.refundRequests) ? refundList.refundRequests : [])
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 403)) throw error
          setRefunds([])
        }
      } else {
        setRefunds([])
      }
    } catch (error) {
      setLoadError(supportError(error))
    } finally {
      setLoading(false)
    }
  }, [isOwner])

  React.useEffect(() => {
    void load()
  }, [load])

  const createCase = async (event: React.FormEvent) => {
    event.preventDefault()
    if (creating) return
    setCreating(true)
    setNotice(null)
    try {
      const result = await apiFetch<{ case: SupportCase; note?: string }>('/app/assistant/support/cases', {
        method: 'POST',
        body: {
          category,
          priority,
          subject,
          summary,
          requestHuman,
          customerContext: {
            page: '/support',
            lastAction: 'create_support_case',
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'web',
          },
        },
      })
      setCases((current) => [result.case, ...current.filter((item) => item.id !== result.case.id)])
      setSubject('')
      setSummary('')
      setRequestHuman(false)
      setSelectedCaseId(result.case.id)
      setNotice({ kind: 'success', text: result.note || 'Support case opened.' })
      setTab('cases')
    } catch (error) {
      setNotice({ kind: 'error', text: supportError(error) })
    } finally {
      setCreating(false)
    }
  }

  const runCaseAction = async (
    id: string,
    action: 'message' | 'escalate' | 'resolve',
  ) => {
    if (caseAction) return
    setCaseAction(`${action}:${id}`)
    setNotice(null)
    try {
      let result: { case: SupportCase; degraded?: boolean; notification?: { status?: string } }
      if (action === 'message') {
        result = await apiFetch(`/app/assistant/support/cases/${id}/messages`, {
          method: 'POST',
          body: { message: followUp, requestHuman: false },
        })
      } else if (action === 'escalate') {
        result = await apiFetch(`/app/assistant/support/cases/${id}/escalate`, {
          method: 'POST',
          body: { reason: 'Customer requested human intervention from the support center.' },
        })
      } else {
        result = await apiFetch(`/app/assistant/support/cases/${id}/resolve`, {
          method: 'POST',
          body: { resolution: 'Customer marked this issue resolved.' },
        })
      }
      setCases((current) => current.map((item) => (item.id === id ? result.case : item)))
      if (action === 'message') setFollowUp('')
      const text = action === 'escalate'
        ? result.degraded
          ? 'Human intervention is recorded, but the notification provider is degraded.'
          : `Human intervention requested. Notification status: ${result.notification?.status || 'recorded'}.`
        : action === 'resolve'
          ? 'The case is marked resolved.'
          : 'Your follow-up was added to the case.'
      setNotice({ kind: result.degraded ? 'info' : 'success', text })
    } catch (error) {
      setNotice({ kind: 'error', text: supportError(error) })
    } finally {
      setCaseAction(null)
    }
  }

  const createRefundReview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (requestingRefund) return
    setRequestingRefund(true)
    setNotice(null)
    try {
      const numeric = refundAmount.trim() ? Number(refundAmount) : null
      if (numeric !== null && (!Number.isFinite(numeric) || numeric <= 0)) {
        throw new Error('invalid_amount')
      }
      const result = await apiFetch<{
        refundRequest: RefundRequest
        case: SupportCase
        moneyMoved: boolean
        note?: string
      }>('/app/assistant/support/refund-requests', {
        method: 'POST',
        body: {
          supportCaseId: selectedCaseId || null,
          invoiceId: invoiceId.trim() || null,
          amountMinor: numeric === null ? null : Math.round(numeric * 100),
          reason: refundReason,
        },
      })
      if (result.moneyMoved !== false) {
        throw new Error('The backend did not preserve the refund review boundary.')
      }
      setRefunds((current) => [
        result.refundRequest,
        ...current.filter((item) => item.id !== result.refundRequest.id),
      ])
      setCases((current) => [result.case, ...current.filter((item) => item.id !== result.case.id)])
      setSelectedCaseId(result.case.id)
      setInvoiceId('')
      setRefundAmount('')
      setRefundReason('')
      setNotice({ kind: 'success', text: result.note || 'Refund review submitted. No money has moved.' })
    } catch (error) {
      setNotice({ kind: 'error', text: supportError(error) })
    } finally {
      setRequestingRefund(false)
    }
  }

  const categories = overview?.categories?.length ? overview.categories : FALLBACK_CATEGORIES
  const priorities = overview?.priorities?.length ? overview.priorities : FALLBACK_PRIORITIES
  const activeCases = cases.filter((item) => !['resolved', 'closed'].includes(item.status))

  return (
    <>
      <PageHeader
        title="Customer Help"
        description="Get guided setup help, diagnose issues, keep a durable support record, and request human intervention without losing context."
        actions={
          <Button variant="ghost" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-navy-200 bg-navy-900 text-white md:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  <Bot className="h-4 w-4" /> AI guidance + accountable human handoff
                </div>
                <h2 className="text-2xl font-bold">Start with Pivot Assistant. Escalate when evidence says a person is needed.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                  The assistant can inspect account state and guide the next step. Support cases, billing reviews and human intervention stay recorded and tenant-scoped.
                </p>
              </div>
              <Link href="/assistant" className={cn(buttonVariants({ variant: 'amber' }), 'flex-shrink-0')}>
                Talk to Assistant
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open support cases</CardDescription>
            <CardTitle className="text-4xl">{overview?.openCases ?? activeCases.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Smartphone className="h-4 w-4" /> Human notification state is visible
            </div>
          </CardContent>
        </Card>
      </div>

      {notice && <div className="mb-5"><InlineNotice kind={notice.kind}>{notice.text}</InlineNotice></div>}
      {loadError && <div className="mb-5"><InlineNotice kind="error">{loadError}</InlineNotice></div>}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="help">Get help</TabsTrigger>
          <TabsTrigger value="cases">Cases ({cases.length})</TabsTrigger>
          {isOwner && <TabsTrigger value="refunds">Refund review ({refunds.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="help" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <ActionLink href="/onboarding" icon={Rocket} title="Finish setup" description="Resume onboarding from the real saved step and see blockers." />
            <ActionLink href="/assistant" icon={MessageSquareText} title="Ask Pivot" description="Get a grounded answer about this account before opening a case." />
            <ActionLink href="/billing" icon={CreditCard} title="Billing and receipts" description="Manage the plan, payment method, cancellation and invoices." />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Headphones className="h-5 w-5" /> Open a support case</CardTitle>
              <CardDescription>
                Give the smallest useful description. Pivot keeps the issue, escalation state and future follow-ups together.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createCase} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="support-category">Issue type</Label>
                    <Select id="support-category" value={category} onChange={(event) => setCategory(event.target.value)} disabled={creating}>
                      {categories.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-priority">Priority</Label>
                    <Select id="support-priority" value={priority} onChange={(event) => setPriority(event.target.value)} disabled={creating}>
                      {priorities.map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input id="support-subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Example: Calls stop after the greeting" maxLength={160} disabled={creating} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-summary">What happened?</Label>
                  <Textarea id="support-summary" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="What you expected, what happened, and the last action you tried." maxLength={4000} disabled={creating} required />
                </div>
                <Checkbox
                  id="request-human"
                  checked={requestHuman}
                  onChange={(event) => setRequestHuman(event.target.checked)}
                  disabled={creating}
                  label="I need human intervention. Record the escalation and notify the owner by configured text/email channels."
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">Secrets and credential-shaped text are redacted by the backend before storage.</p>
                  <Button type="submit" disabled={creating || subject.trim().length < 3 || summary.trim().length < 3}>
                    <Send className="mr-2 h-4 w-4" /> {creating ? 'Opening case…' : 'Open case'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          {loading && cases.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-slate-500">Loading support history…</CardContent></Card>
          ) : cases.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><LifeBuoy className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-navy-900">No support cases yet</p><p className="mt-1 text-sm text-slate-500">Open a case when the assistant cannot solve an issue or a human decision is required.</p></CardContent></Card>
          ) : (
            cases.map((item) => {
              const busy = caseAction?.endsWith(`:${item.id}`) === true
              const closed = ['resolved', 'closed'].includes(item.status)
              return (
                <Card key={item.id} className={selectedCaseId === item.id ? 'border-navy-400 ring-2 ring-navy-900/10' : undefined}>
                  <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <Badge variant={caseBadge(item.status)}>{labelize(item.status)}</Badge>
                          <Badge variant={priorityBadge(item.priority)}>{labelize(item.priority)}</Badge>
                          <Badge variant="outline">{labelize(item.category)}</Badge>
                          {item.requires_human && <Badge variant="amber"><UserRoundCheck className="mr-1 h-3 w-3" /> Human requested</Badge>}
                        </div>
                        <CardTitle className="text-lg">{item.subject}</CardTitle>
                        <CardDescription className="mt-2 whitespace-pre-wrap">{item.summary}</CardDescription>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>Updated {when(item.updated_at)}</p>
                        <p className="mt-1 font-mono">#{item.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-3">
                      <div><p className="text-xs uppercase tracking-wide text-slate-400">Escalation</p><p className="mt-1 font-medium text-navy-900">{labelize(item.escalation_status || 'not_requested')}</p></div>
                      <div><p className="text-xs uppercase tracking-wide text-slate-400">Channel</p><p className="mt-1 font-medium text-navy-900">{labelize(item.escalation_channel || 'not_configured')}</p></div>
                      <div><p className="text-xs uppercase tracking-wide text-slate-400">Escalated</p><p className="mt-1 font-medium text-navy-900">{when(item.escalated_at)}</p></div>
                    </div>

                    {selectedCaseId === item.id && !closed && (
                      <div className="space-y-2 rounded-lg border border-slate-200 p-4">
                        <Label htmlFor={`follow-up-${item.id}`}>Add a follow-up</Label>
                        <Textarea id={`follow-up-${item.id}`} value={followUp} onChange={(event) => setFollowUp(event.target.value)} placeholder="Add what happened after the last step." disabled={busy} />
                        <Button size="sm" onClick={() => void runCaseAction(item.id, 'message')} disabled={busy || followUp.trim().length < 2}>
                          <Send className="mr-2 h-3.5 w-3.5" /> Add follow-up
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCaseId((current) => current === item.id ? '' : item.id)} disabled={busy}>
                        <MessageSquareText className="mr-2 h-4 w-4" /> {selectedCaseId === item.id ? 'Hide follow-up' : 'Add follow-up'}
                      </Button>
                      {!closed && !item.requires_human && (
                        <Button variant="outline-navy" size="sm" onClick={() => void runCaseAction(item.id, 'escalate')} disabled={busy}>
                          <Smartphone className="mr-2 h-4 w-4" /> Request human
                        </Button>
                      )}
                      {!closed && (
                        <Button variant="ghost" size="sm" onClick={() => void runCaseAction(item.id, 'resolve')} disabled={busy}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Mark resolved
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        {isOwner && (
          <TabsContent value="refunds" className="space-y-5">
            <InlineNotice kind="info">
              <strong>No automatic money movement.</strong> This form validates the invoice against this tenant, creates a review record and requests human intervention. It cannot issue a refund.
            </InlineNotice>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Request refund review</CardTitle>
                  <CardDescription>Owner-only. Leave the amount blank to request review of the verified paid amount.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createRefundReview} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="refund-invoice">Invoice ID</Label>
                      <Input id="refund-invoice" value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} placeholder="in_..." disabled={requestingRefund} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refund-amount">Amount in dollars (optional)</Label>
                      <Input id="refund-amount" type="number" min="0.01" step="0.01" value={refundAmount} onChange={(event) => setRefundAmount(event.target.value)} placeholder="49.00" disabled={requestingRefund} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refund-case">Attach to case (optional)</Label>
                      <Select id="refund-case" value={selectedCaseId} onChange={(event) => setSelectedCaseId(event.target.value)} disabled={requestingRefund}>
                        <option value="">Create a dedicated refund case</option>
                        {activeCases.map((item) => <option key={item.id} value={item.id}>{item.subject}</option>)}
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="refund-reason">Reason for review</Label>
                      <Textarea id="refund-reason" value={refundReason} onChange={(event) => setRefundReason(event.target.value)} placeholder="Explain the charge and the requested outcome." minLength={5} maxLength={2000} disabled={requestingRefund} required />
                    </div>
                    <Button type="submit" disabled={requestingRefund || refundReason.trim().length < 5}>
                      <UserRoundCheck className="mr-2 h-4 w-4" /> {requestingRefund ? 'Submitting review…' : 'Submit for human review'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Refund review history</CardTitle>
                  <CardDescription>These are requests and decisions, not proof that money moved.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {refunds.length === 0 ? (
                    <div className="rounded-lg bg-slate-50 p-5 text-center text-sm text-slate-500">No refund reviews have been submitted.</div>
                  ) : refunds.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-navy-900">{money(item.amount_minor, item.currency || 'usd')}</p>
                          <p className="mt-1 text-xs text-slate-500">Invoice {item.invoice_id || 'not specified'} · {when(item.created_at)}</p>
                        </div>
                        <Badge variant={item.status === 'refunded' ? 'success' : item.status === 'pending_review' ? 'amber' : 'secondary'}>{labelize(item.status)}</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}
