'use client'

import * as React from 'react'
import {
  Building2,
  Phone,
  Plug,
  Bell,
  ShieldCheck,
  Save,
  Lock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Label, Checkbox } from '@/components/ui/input'
import {
  ErrorState,
  LoadingState,
  NotConfiguredState,
} from '@/components/app/states'
import { FormError, FormSuccess } from '@/components/app/auth-card'
import { useAuth } from '@/components/app/auth-provider'
import { useApi } from '@/lib/use-api'
import { api, can, errorMessage, isApiConfigured, type Settings } from '@/lib/api'

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

function connected(settings: Settings, keys: string[]): boolean {
  return keys.some((k) => {
    const v = settings[k]
    return v === true || (typeof v === 'string' && v.length > 0)
  })
}

export default function SettingsPage() {
  const { me } = useAuth()
  const canEdit = can.admin(me?.role)
  const isOwner = can.owner(me?.role)
  const settings = useApi(() => api.settings.get(), [])

  const [form, setForm] = React.useState<Settings>({})
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (settings.data) setForm(settings.data)
  }, [settings.data])

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Settings" description="Configure your business and integrations." />
        <NotConfiguredState feature="Settings" />
      </>
    )
  }

  if (settings.loading) {
    return (
      <>
        <PageHeader title="Settings" description="Configure your business and integrations." />
        <LoadingState label="Loading settings…" />
      </>
    )
  }
  if (settings.error) {
    return (
      <>
        <PageHeader title="Settings" description="Configure your business and integrations." />
        <ErrorState message={settings.error} onRetry={settings.refetch} />
      </>
    )
  }

  const data = settings.data ?? {}

  const update = (patch: Partial<Settings>) => setForm((f) => ({ ...f, ...patch }))

  const saveProfile = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await api.settings.update({
        business_name: form.business_name,
        phone: form.phone,
        address: form.address,
        timezone: form.timezone,
        website: form.website,
        notify_sms: form.notify_sms,
        notify_email: form.notify_email,
      })
      setSuccess('Settings saved.')
      settings.refetch()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your business profile, phone numbers, integrations, and compliance."
      />

      {error && <div className="mb-4"><FormError message={error} /></div>}
      {success && <div className="mb-4"><FormSuccess message={success} /></div>}

      <div className="space-y-6">
        {/* Business profile (editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-navy-700" /> Business profile
            </CardTitle>
            <CardDescription>Basic details Pivot AI uses when speaking with callers.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                value={str(form.business_name) || str(me?.business?.name)}
                disabled={!canEdit}
                onChange={(e) => update({ business_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={str(form.website)}
                disabled={!canEdit}
                onChange={(e) => update({ website: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact phone</Label>
              <Input
                id="phone"
                value={str(form.phone)}
                disabled={!canEdit}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={str(form.timezone)}
                disabled={!canEdit}
                onChange={(e) => update({ timezone: e.target.value })}
                placeholder="America/Toronto"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={str(form.address)}
                disabled={!canEdit}
                onChange={(e) => update({ address: e.target.value })}
                placeholder="123 Main St, City, Province"
              />
            </div>
          </CardContent>
        </Card>

        {/* Phone numbers (read-only — provisioned by backend) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5 text-navy-700" /> Phone numbers
              <Badge variant="secondary" className="ml-1">Backend-managed</Badge>
            </CardTitle>
            <CardDescription>
              Numbers are provisioned and routed by the backend. Contact your owner to change them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReadOnlyRow label="AI receptionist number" value={str(data.twilio_number || data.phone_number)} />
            <ReadOnlyRow label="Forwarding / fallback" value={str(data.forwarding_number)} />
          </CardContent>
        </Card>

        {/* Integrations (read-only / owner-config) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plug className="h-5 w-5 text-navy-700" /> Integrations
              <Badge variant="secondary" className="ml-1">Owner-configured</Badge>
            </CardTitle>
            <CardDescription>
              API keys and connections are configured securely on the backend and never exposed to the
              browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <IntegrationRow name="Twilio (voice & SMS)" ok={connected(data, ['twilio_number', 'twilio_connected', 'phone_number'])} />
            <IntegrationRow name="OpenAI (AI brain)" ok={connected(data, ['openai_connected', 'ai_connected'])} />
            <IntegrationRow name="Calendar (booking)" ok={connected(data, ['calendar_connected', 'calendar_id'])} />
            <IntegrationRow name="Email (notifications)" ok={connected(data, ['email_connected', 'from_email'])} />
          </CardContent>
        </Card>

        {/* Notifications (editable) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-navy-700" /> Notifications
            </CardTitle>
            <CardDescription>How you want to hear about new leads and bookings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Checkbox
              id="notify_sms"
              checked={Boolean(form.notify_sms)}
              disabled={!canEdit}
              onChange={(e) => update({ notify_sms: e.target.checked })}
              label="Text me when Pivot AI captures a new lead"
            />
            <Checkbox
              id="notify_email"
              checked={Boolean(form.notify_email)}
              disabled={!canEdit}
              onChange={(e) => update({ notify_email: e.target.checked })}
              label="Email me a daily summary"
            />
          </CardContent>
        </Card>

        {/* Compliance (read-only info) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-navy-700" /> Compliance
              <Badge variant="secondary" className="ml-1">Read-only</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <ReadOnlyRow label="SMS consent capture" value="Enabled (web form + call)" />
            <ReadOnlyRow label="Call recording disclosure" value={str(data.recording_disclosure) || 'Per backend policy'} />
            <p className="flex items-start gap-2 text-xs text-slate-400">
              <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              Compliance settings and audit logs are managed on the backend for legal integrity.
            </p>
          </CardContent>
        </Card>

        {canEdit ? (
          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={saving} size="lg">
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            You have read-only access. Ask an admin{!isOwner && ' or owner'} to change these settings.
          </p>
        )}
      </div>
    </>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-navy-900">{value || '—'}</span>
    </div>
  )
}

function IntegrationRow({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
      <span className="text-sm font-medium text-navy-900">{name}</span>
      {ok ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
          <CheckCircle2 className="h-4 w-4" /> Connected
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400">
          <XCircle className="h-4 w-4" /> Not connected
        </span>
      )}
    </div>
  )
}
