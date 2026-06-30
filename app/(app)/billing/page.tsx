'use client'

import * as React from 'react'
import { CreditCard, ExternalLink, Check, ShieldAlert, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/drawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NotConfiguredState,
} from '@/components/app/states'
import { FormError, FormSuccess } from '@/components/app/auth-card'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import { api, asArray, can, errorMessage, isApiConfigured, type Billing, type Invoice } from '@/lib/api'
import { formatDate, formatMoney, titleCase } from '@/lib/format'

const PLANS = [
  { id: 'starter', name: 'Starter', price: '$99/mo', features: ['1 phone number', '24/7 AI answering', 'Lead capture'] },
  { id: 'pro', name: 'Pro', price: '$249/mo', features: ['Everything in Starter', 'CRM + pipeline', 'SMS & email follow-up', 'Team seats'] },
  { id: 'scale', name: 'Scale', price: '$599/mo', features: ['Everything in Pro', 'Multi-language', 'Priority support', 'Advanced routing'] },
]

export default function BillingPage() {
  const { me } = useAuth()
  const isOwner = can.owner(me?.role)
  const billing = useApi(() => api.billing.get(), [])

  const [busy, setBusy] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = React.useState(false)

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Billing" description="Manage your plan and payments." />
        <NotConfiguredState feature="Billing" />
      </>
    )
  }

  if (!isOwner) {
    return (
      <>
        <PageHeader title="Billing" description="Manage your plan and payments." />
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={ShieldAlert}
              title="Owner access required"
              description="Only the account owner can view and change billing. Ask your owner for access."
            />
          </CardContent>
        </Card>
      </>
    )
  }

  const data: Billing | null = billing.data
  const currentPlan = (data?.plan ?? me?.business?.plan ?? '').toLowerCase()
  const invoices = asArray<Invoice>(data?.invoices)

  const openPortal = async () => {
    setBusy('portal')
    setActionError(null)
    try {
      const { url } = await api.billing.portal()
      if (url) window.location.href = url
      else setActionError('No billing portal URL was returned by the backend.')
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const changePlan = async (plan: string) => {
    setBusy(plan)
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.billing.changePlan({ plan })
      setActionSuccess(`Plan change to ${titleCase(plan)} submitted.`)
      billing.refetch()
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  const startCheckout = (plan: string) => {
    // Public checkout endpoint on the backend handles Stripe redirect.
    window.location.href = api.billing.checkoutUrl(plan)
  }

  const cancel = async () => {
    setBusy('cancel')
    setActionError(null)
    setActionSuccess(null)
    try {
      await api.billing.cancel()
      setActionSuccess('Your subscription has been set to cancel.')
      setConfirmCancel(false)
      billing.refetch()
    } catch (err) {
      setActionError(errorMessage(err))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Billing"
        description="Manage your subscription, payment method, and invoices."
        actions={
          <Button variant="outline-navy" onClick={openPortal} disabled={busy === 'portal'}>
            <ExternalLink className="mr-1.5 h-4 w-4" />
            {busy === 'portal' ? 'Opening…' : 'Billing portal'}
          </Button>
        }
      />

      {actionError && <div className="mb-4"><FormError message={actionError} /></div>}
      {actionSuccess && <div className="mb-4"><FormSuccess message={actionSuccess} /></div>}

      {/* Current subscription */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Current subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {billing.loading ? (
            <LoadingState label="Loading billing…" />
          ) : billing.error ? (
            <ErrorState message={billing.error} onRetry={billing.refetch} />
          ) : (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Plan</p>
                <p className="mt-1 text-lg font-semibold capitalize text-navy-900">
                  {currentPlan || 'Trial'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                <p className="mt-1">
                  <Badge variant={data?.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                    {titleCase(data?.status) || 'Unknown'}
                  </Badge>
                </p>
              </div>
              {data?.amount != null && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Amount</p>
                  <p className="mt-1 text-lg font-semibold text-navy-900">
                    {formatMoney(data.amount, data.currency ?? 'usd')}
                  </p>
                </div>
              )}
              {data?.current_period_end && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Renews</p>
                  <p className="mt-1 text-lg font-semibold text-navy-900">
                    {formatDate(data.current_period_end)}
                  </p>
                </div>
              )}
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmCancel(true)}
                >
                  Cancel subscription
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <h2 className="mb-3 text-lg font-semibold text-navy-900">Plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          return (
            <Card key={plan.id} className={isCurrent ? 'border-navy-900 ring-1 ring-navy-900' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {isCurrent && <Badge variant="amber">Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-navy-900">{plan.price}</p>
              </CardHeader>
              <CardContent>
                <ul className="mb-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline-navy" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : currentPlan ? (
                  <Button
                    className="w-full"
                    onClick={() => changePlan(plan.id)}
                    disabled={busy === plan.id}
                  >
                    {busy === plan.id ? 'Updating…' : 'Switch to this plan'}
                  </Button>
                ) : (
                  <Button
                    variant="amber"
                    className="w-full"
                    onClick={() => startCheckout(plan.id)}
                  >
                    Choose {plan.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Invoices */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {billing.loading ? (
            <LoadingState />
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Paid invoices will appear here once your subscription is active."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{formatDate(inv.created_at)}</TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(inv.amount, inv.currency ?? 'usd')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={inv.status === 'paid' ? 'success' : 'secondary'} className="capitalize">
                        {titleCase(inv.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.url ? (
                        <a
                          href={inv.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-navy-700 hover:underline"
                        >
                          View <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title="Cancel subscription?"
        description="Your AI receptionist will stop answering calls at the end of the current period."
      >
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmCancel(false)}>
            Keep subscription
          </Button>
          <Button variant="destructive" onClick={cancel} disabled={busy === 'cancel'}>
            {busy === 'cancel' ? 'Cancelling…' : 'Yes, cancel'}
          </Button>
        </div>
      </Modal>

      <div className="mt-6 flex items-start gap-2 text-xs text-slate-400">
        <CreditCard className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        <span>
          Payments are processed by the backend via Stripe. Plan changes and cancellations are
          applied through the billing APIs and may take a moment to reflect.
        </span>
      </div>
    </>
  )
}
