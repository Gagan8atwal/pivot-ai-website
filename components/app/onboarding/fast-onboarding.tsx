'use client'

import * as React from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, PhoneCall, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/app/page-header'
import { api, errorMessage, isApiConfigured, type OnboardingResponse } from '@/lib/api'
import { unwrapSettings } from '@/lib/onboarding'
import { useAuth } from '@/components/app/auth-provider'

const E164 = /^\+\d{10,15}$/

function activationIsLive(status: OnboardingResponse | null) {
  const a = status?.activation
  const activationMarked = Boolean(
    a?.active ||
      a?.activated ||
      a?.status === 'active' ||
      a?.status === 'activated' ||
      status?.state?.activated_at
  )

  // Customer-facing "live" status is fail-closed: an activation marker alone is
  // not enough. The current backend snapshot must still say the tenant is ready
  // and must expose a verified E.164 phone integration.
  return (
    activationMarked &&
    status?.readiness?.ready === true &&
    verifiedPhone(status) !== null
  )
}

function verifiedPhone(status: OnboardingResponse | null) {
  const value = status?.integrations?.phone === true ? status.integrations.phoneNumber : null
  return typeof value === 'string' && E164.test(value) ? value : null
}

export function FastOnboarding() {
  const { me } = useAuth()
  const [businessName, setBusinessName] = React.useState('')
  const [timezone, setTimezone] = React.useState('')
  const [hours, setHours] = React.useState('')
  const [services, setServices] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [booking, setBooking] = React.useState(false)
  const [status, setStatus] = React.useState<OnboardingResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    const current = await api.onboarding.get()
    setStatus(current)
    return current
  }, [])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isApiConfigured) {
        setLoading(false)
        return
      }
      try {
        await api.auth.ensureTenant()
        const [current, settingsRaw] = await Promise.all([
          api.onboarding.get(),
          api.settings.get(),
        ])
        if (cancelled) return
        const settings = unwrapSettings(settingsRaw)
        setStatus(current)
        setBusinessName(
          String(settings.display_name || settings.business_name || me?.business?.name || '')
        )
        setTimezone(
          String(
            settings.timezone ||
              (typeof Intl !== 'undefined'
                ? Intl.DateTimeFormat().resolvedOptions().timeZone || ''
                : '')
          )
        )
        setHours(String(settings.hours || ''))
        setLocation(String(settings.location || ''))
        setServices(
          Array.isArray(settings.services)
            ? settings.services.join(', ')
            : String(settings.services || '')
        )
        setPhone(String(current.integrations?.phoneNumber || ''))
        setBooking(settings.booking_enabled === true)
      } catch (err) {
        if (!cancelled) setError(errorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [me?.business?.name])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!businessName.trim() || !timezone.trim() || !hours.trim() || !services.trim()) {
      setError('Business name, timezone, business hours and services are required.')
      return
    }
    if (phone.trim() && !E164.test(phone.trim())) {
      setError('Enter your existing number in international format, for example +15591234567.')
      return
    }

    setSaving(true)
    try {
      const result = await api.onboarding.quick({
        businessName: businessName.trim(),
        timezone: timezone.trim(),
        hours: hours.trim(),
        services: services.trim(),
        location: location.trim() || undefined,
        receptionistPhone: phone.trim() || undefined,
        bookingEnabled: booking,
        activate: true,
      })
      const current = await refresh()
      if (activationIsLive(current)) {
        setMessage('Your receptionist is active. Make one test call now.')
      } else {
        const blockers = current.readiness?.blockers || result.blockers || []
        setMessage(
          blockers.length
            ? 'Your setup is saved. Finish the remaining item shown below.'
            : 'Your setup is saved. Refresh readiness to continue.'
        )
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Set up your AI receptionist" description="The Pivot backend is not configured for this website yet." />
        <Card>
          <CardContent className="pt-6 text-sm text-slate-600">
            Set <code>NEXT_PUBLIC_API_BASE</code> to the owned Pivot backend origin. No hosted-provider fallback is used.
          </CardContent>
        </Card>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Set up your AI receptionist" description="Loading your business…" />
        <Card><CardContent className="pt-6"><Loader2 className="h-5 w-5 animate-spin" /></CardContent></Card>
      </>
    )
  }

  const live = activationIsLive(status)
  const dial = verifiedPhone(status)
  const received = status?.testCall?.received === true
  const blockers = status?.readiness?.blockers || []

  return (
    <>
      <PageHeader
        title="Set up your AI receptionist"
        description="Four required business facts. Use a number you already own and Pivot can activate in the same save."
      />

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}

      {live && (
        <Card className="mb-5 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              {received ? 'Test call received' : 'Receptionist active'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-green-900">
            {received ? (
              <p>Pivot recorded a call after activation. Review it in your dashboard.</p>
            ) : dial ? (
              <p>Call your receptionist once, ask a normal customer question, then refresh this page.</p>
            ) : (
              <p>Your receptionist is active. Refresh readiness if the verified phone number is not shown yet.</p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              {!received && dial && (
                <a href={`tel:${dial}`}>
                  <Button type="button" className="w-full sm:w-auto">
                    <PhoneCall className="mr-2 h-4 w-4" /> Call my receptionist
                  </Button>
                </a>
              )}
              <Button type="button" variant="outline" onClick={() => void refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Open dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {!live && (
        <form onSubmit={submit}>
          <Card>
            <CardHeader>
              <CardTitle>5-minute setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="business" className="mb-1 block text-sm font-medium">Business name *</label>
                <Input id="business" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="timezone" className="mb-1 block text-sm font-medium">Timezone *</label>
                  <Input id="timezone" required value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/Los_Angeles" />
                </div>
                <div>
                  <label htmlFor="hours" className="mb-1 block text-sm font-medium">Business hours *</label>
                  <Input id="hours" required value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Mon–Fri 8 AM–5 PM" />
                </div>
              </div>

              <div>
                <label htmlFor="services" className="mb-1 block text-sm font-medium">Services *</label>
                <Input id="services" required value={services} onChange={(e) => setServices(e.target.value)} placeholder="Cleaning, emergency visits, implants" />
              </div>

              <div>
                <label htmlFor="location" className="mb-1 block text-sm font-medium">Location</label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Fresno, CA" />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium">Existing receptionist number</label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15591234567" inputMode="tel" />
                <p className="mt-1 text-xs text-slate-500">
                  Fast path uses a number already owned by the configured phone provider. This form never purchases a number.
                </p>
              </div>

              <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <input type="checkbox" checked={booking} onChange={(e) => setBooking(e.target.checked)} className="mt-1" />
                <span>
                  Enable appointment booking now. If enabled, Calendar must also be connected before activation. Leave this off for the fastest initial setup.
                </span>
              </label>

              {blockers.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">Still needed</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {blockers.map((b, i) => <li key={`${b.field}-${i}`}>{b.message}</li>)}
                  </ul>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving…' : 'Save setup & activate if ready'}
              </Button>

              <p className="text-center text-xs text-slate-500">
                Need advanced routing, booking or receptionist controls? You can change them after activation from Settings.
              </p>
            </CardContent>
          </Card>
        </form>
      )}
    </>
  )
}
