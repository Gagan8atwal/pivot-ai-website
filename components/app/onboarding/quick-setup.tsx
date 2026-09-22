'use client'

import * as React from 'react'
import { AlertTriangle, CheckCircle2, Clock3, Loader2, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/app/page-header'
import { NotConfiguredState } from '@/components/app/states'
import { useAuth } from '@/components/app/auth-provider'
import { api, apiFetch, can, errorMessage, isApiConfigured, type ReadinessIssue } from '@/lib/api'
import { unwrapSettings } from '@/lib/onboarding'
import { OnboardingWizard } from '@/components/app/onboarding/onboarding-wizard'

type QuickResponse = {
  ok: boolean
  quickSetup: boolean
  activated: boolean
  activatedAt?: string | null
  readiness: { ready: boolean; blockers: ReadinessIssue[]; warnings: ReadinessIssue[] }
  completedSteps: number[]
  receptionist?: {
    businessName?: string | null
    agentName?: string | null
    greeting?: string | null
    tone?: string | null
    pronunciationHints?: string[]
    services?: string[]
  }
  integrations?: { calendar?: boolean; phone?: boolean }
}

type Form = {
  businessName: string
  businessProfile: string
  services: string
  hours: string
  timezone: string
  ownerPhone: string
  ownerEmail: string
  agentName: string
  tone: string
  pronunciationHints: string
  bookingEnabled: boolean
}

type HydrationState = 'loading' | 'ready' | 'error'

function defaultTimezone() {
  if (typeof Intl === 'undefined') return 'America/Los_Angeles'
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles'
}

const FIELD = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50'
const LABEL = 'mb-1.5 block text-sm font-medium text-slate-800'
const HELP = 'mt-1 text-xs leading-5 text-slate-500'

function splitLines(value: string) {
  return [...new Set(value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean))]
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function textList(value: unknown) {
  if (Array.isArray(value)) return value.map((v) => text(v)).filter(Boolean)
  if (typeof value === 'string') return splitLines(value)
  return []
}

function hydrateQuickForm(raw: unknown, fallback: Form): Form {
  const settings = unwrapSettings(raw)
  return {
    businessName: text(settings.display_name) || text(settings.business_name),
    businessProfile: text(settings.business_profile),
    services: textList(settings.services).join('\n'),
    hours: text(settings.hours),
    timezone: text(settings.timezone) || fallback.timezone,
    ownerPhone: text(settings.owner_phone),
    ownerEmail: text(settings.owner_email),
    agentName: text(settings.agent_name) || fallback.agentName,
    tone: text(settings.tone) || fallback.tone,
    pronunciationHints: textList(settings.pronunciation_hints).join('\n'),
    bookingEnabled: settings.booking_enabled === true,
  }
}

export function QuickSetup() {
  const { me } = useAuth()
  const canEdit = can.admin(me?.role)
  const [advanced, setAdvanced] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<QuickResponse | null>(null)
  const [hydration, setHydration] = React.useState<HydrationState>(isApiConfigured ? 'loading' : 'ready')
  const [hydrationError, setHydrationError] = React.useState<string | null>(null)
  const dirtyRef = React.useRef(false)
  const [form, setForm] = React.useState<Form>(() => ({
    businessName: '',
    businessProfile: '',
    services: '',
    hours: '',
    timezone: defaultTimezone(),
    ownerPhone: '',
    ownerEmail: '',
    agentName: 'Alex',
    tone: 'Warm, natural, confident, concise, conversational',
    pronunciationHints: '',
    bookingEnabled: false,
  }))

  React.useEffect(() => {
    if (!isApiConfigured) return
    let cancelled = false

    api.settings.get().then((raw) => {
      if (cancelled) return
      setForm((current) => dirtyRef.current ? current : hydrateQuickForm(raw, current))
      setHydration('ready')
      setHydrationError(null)
    }).catch((err) => {
      if (cancelled) return
      setHydration('error')
      setHydrationError(errorMessage(err))
    })

    return () => { cancelled = true }
  }, [])

  if (advanced) {
    const preserved = [
      ['Business name', form.businessName],
      ['Business profile', form.businessProfile],
      ['Services', form.services],
      ['Business hours', form.hours],
      ['Timezone', form.timezone],
      ['Owner / forwarding phone', form.ownerPhone],
      ['Lead notification email', form.ownerEmail],
      ['Receptionist name', form.agentName],
      ['Conversation style', form.tone],
      ['Pronunciation hints', form.pronunciationHints],
      ['Booking', form.bookingEnabled ? 'Enabled' : 'Disabled'],
    ].filter(([, value]) => String(value).trim().length > 0)

    return (
      <>
        <Card className="mb-5 border-slate-200 bg-slate-50/70">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Quick Setup draft preserved</CardTitle>
                <CardDescription className="mt-1">
                  Your Quick Setup entries are kept while you use Advanced setup. Nothing below silently replaces or submits them.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setAdvanced(false)}>
                Return to Quick Setup
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 md:grid-cols-2">
              {preserved.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <OnboardingWizard />
      </>
    )
  }

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Set up your AI receptionist" description="A fast setup that turns your business facts into a working receptionist." />
        <NotConfiguredState feature="Onboarding" />
      </>
    )
  }

  const patch = (value: Partial<Form>) => {
    dirtyRef.current = true
    setForm((current) => ({ ...current, ...value }))
  }
  const hydrationReady = hydration === 'ready'
  const formLocked = busy || !hydrationReady
  const valid = hydrationReady && Boolean(form.businessName.trim() && form.services.trim() && form.hours.trim() && form.timezone.trim())

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!canEdit || busy || !hydrationReady || !valid) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const response = await apiFetch<QuickResponse>('/app/onboarding/quick', {
        method: 'POST',
        body: {
          businessName: form.businessName.trim(),
          businessProfile: form.businessProfile.trim() || undefined,
          services: splitLines(form.services),
          hours: form.hours.trim(),
          timezone: form.timezone.trim(),
          ownerPhone: form.ownerPhone.trim() || undefined,
          ownerEmail: form.ownerEmail.trim() || undefined,
          agentName: form.agentName.trim() || 'Alex',
          tone: form.tone.trim(),
          pronunciationHints: splitLines(form.pronunciationHints),
          bookingEnabled: form.bookingEnabled,
          activate: true,
        },
      })
      setResult(response)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const blockers = result?.readiness?.blockers || []
  const warnings = result?.readiness?.warnings || []
  const phoneReady = result?.integrations?.phone === true

  return (
    <>
      <PageHeader
        title="Set up your AI receptionist"
        description="Give us the essentials once. Pivot builds the receptionist and checks whether setup can activate."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => setAdvanced(true)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
            Advanced setup
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <Clock3 className="mt-0.5 h-5 w-5 text-slate-600" aria-hidden="true" />
            <div><p className="text-sm font-semibold">About five minutes</p><p className="mt-1 text-xs text-slate-500">One form instead of seven separate setup screens.</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 text-slate-600" aria-hidden="true" />
            <div><p className="text-sm font-semibold">Human conversation</p><p className="mt-1 text-xs text-slate-500">Choose the receptionist tone and important pronunciations.</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-slate-600" aria-hidden="true" />
            <div><p className="text-sm font-semibold">Truthful activation</p><p className="mt-1 text-xs text-slate-500">Setup activates only when backend readiness passes. Calling readiness is shown separately.</p></div>
          </CardContent>
        </Card>
      </div>

      {!canEdit && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You have read-only access. An admin or owner must complete setup.
        </div>
      )}

      {hydration === 'loading' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading your saved setup before edits are enabled…
        </div>
      )}

      {hydration === 'error' && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Pivot could not load your saved setup{hydrationError ? `: ${hydrationError}` : ''}. Quick Setup is locked so existing settings cannot be overwritten by blank or default values.</span>
          </div>
          <Button type="button" variant="link" className="mt-2 h-auto p-0 text-red-700" onClick={() => setAdvanced(true)}>Open advanced setup</Button>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>1. Your business</CardTitle>
            <CardDescription>Only facts the receptionist is allowed to use on calls.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="businessName">Business name *</label>
              <input id="businessName" className={FIELD} disabled={!canEdit || formLocked} value={form.businessName} onChange={(e) => patch({ businessName: e.target.value })} placeholder="Northside Dental" autoComplete="organization" />
            </div>
            <div>
              <label className={LABEL} htmlFor="timezone">Timezone *</label>
              <input id="timezone" className={FIELD} disabled={!canEdit || formLocked} value={form.timezone} onChange={(e) => patch({ timezone: e.target.value })} placeholder="America/Los_Angeles" />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL} htmlFor="profile">What does your business do?</label>
              <textarea id="profile" rows={2} className={FIELD} disabled={!canEdit || formLocked} value={form.businessProfile} onChange={(e) => patch({ businessProfile: e.target.value })} placeholder="Family dental practice serving Fresno and nearby communities." />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL} htmlFor="services">Services * <span className="font-normal text-slate-500">(one per line)</span></label>
              <textarea id="services" rows={4} className={FIELD} disabled={!canEdit || formLocked} value={form.services} onChange={(e) => patch({ services: e.target.value })} placeholder={'Cleanings\nEmergency dental visits\nNew patient exams'} />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL} htmlFor="hours">Business hours *</label>
              <input id="hours" className={FIELD} disabled={!canEdit || formLocked} value={form.hours} onChange={(e) => patch({ hours: e.target.value })} placeholder="Monday to Friday, 9 AM to 5 PM. Closed weekends." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Where should calls go?</CardTitle>
            <CardDescription>The receptionist can work without email. Add only what your business actually uses.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="ownerPhone">Owner / forwarding phone</label>
              <input id="ownerPhone" className={FIELD} disabled={!canEdit || formLocked} value={form.ownerPhone} onChange={(e) => patch({ ownerPhone: e.target.value })} placeholder="+1 559 555 0123" inputMode="tel" autoComplete="tel" />
            </div>
            <div>
              <label className={LABEL} htmlFor="ownerEmail">Lead notification email</label>
              <input id="ownerEmail" className={FIELD} disabled={!canEdit || formLocked} value={form.ownerEmail} onChange={(e) => patch({ ownerEmail: e.target.value })} placeholder="owner@example.com" type="email" autoComplete="email" />
            </div>
            <label className="md:col-span-2 flex items-start gap-3 rounded-lg border border-slate-200 p-3">
              <input type="checkbox" className="mt-1 h-4 w-4" disabled={!canEdit || formLocked} checked={form.bookingEnabled} onChange={(e) => patch({ bookingEnabled: e.target.checked })} />
              <span>
                <span className="block text-sm font-medium text-slate-800">Book appointments</span>
                <span className="mt-0.5 block text-xs text-slate-500">Enable only if you want calendar-backed booking. Quick Setup will tell you if a calendar connection is still required.</span>
              </span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Make the receptionist sound like your business</CardTitle>
            <CardDescription>These settings shape conversation; they do not override business facts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="agentName">Receptionist name</label>
              <input id="agentName" className={FIELD} disabled={!canEdit || formLocked} value={form.agentName} onChange={(e) => patch({ agentName: e.target.value })} placeholder="Alex" />
            </div>
            <div>
              <label className={LABEL} htmlFor="tone">Conversation style</label>
              <input id="tone" className={FIELD} disabled={!canEdit || formLocked} value={form.tone} onChange={(e) => patch({ tone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={LABEL} htmlFor="hints">Important names and pronunciations</label>
              <textarea id="hints" rows={3} className={FIELD} disabled={!canEdit || formLocked} value={form.pronunciationHints} onChange={(e) => patch({ pronunciationHints: e.target.value })} placeholder={'Dr. Kuldeep Kaur\nCrayox\nSan Joaquin'} />
              <p className={HELP}>Add staff names, brands, locations, or terms that speech recognition commonly gets wrong.</p>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{error}</span></div>
            <Button type="button" variant="link" className="mt-2 h-auto p-0 text-red-700" onClick={() => setAdvanced(true)}>Open advanced setup instead</Button>
          </div>
        )}

        {result && (
          <Card className={result.activated && phoneReady ? 'border-emerald-200' : 'border-amber-200'}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{result.activated ? 'Setup activated' : 'Setup saved'}</CardTitle>
                <Badge variant="secondary">{result.completedSteps.length}/7 readiness checks</Badge>
                {result.activated && <Badge variant="secondary">{phoneReady ? 'Phone ready' : 'Phone not ready'}</Badge>}
              </div>
              <CardDescription>
                {result.activated
                  ? phoneReady
                    ? 'Setup activation passed and the phone integration reports ready. Messaging and carrier approval remain separate statuses.'
                    : 'Setup activation passed. Phone service is not considered live until the phone integration reports ready.'
                  : 'Your receptionist is configured. Only the items below still prevent activation.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.receptionist?.greeting && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">“{result.receptionist.greeting}”</p>}
              {blockers.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-900">Still required</p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-800">{blockers.map((item) => <li key={`${item.field}-${item.message}`}>• {item.message}</li>)}</ul>
                </div>
              )}
              {warnings.length > 0 && (
                <div className="text-sm text-slate-600">{warnings.map((item) => <p key={`${item.field}-${item.message}`}>• {item.message}</p>)}</div>
              )}
              {(!result.activated || !phoneReady) && <Button type="button" variant="outline" onClick={() => setAdvanced(true)}>Review remaining setup</Button>}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
          <p className="text-xs text-slate-500">Required fields are marked *. You can change everything later.</p>
          <Button type="submit" disabled={!canEdit || busy || !hydrationReady || !valid}>
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Building receptionist…</> : <><Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />Build my receptionist</>}
          </Button>
        </div>
      </form>
    </>
  )
}
