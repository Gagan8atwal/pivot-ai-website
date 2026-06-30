'use client'

import * as React from 'react'
import {
  Building2,
  BookOpen,
  MessageSquare,
  Eye,
  Save,
  Rocket,
  Plus,
  Trash2,
} from 'lucide-react'
import { PageHeader } from '@/components/app/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label, Checkbox } from '@/components/ui/input'
import { NotConfiguredState, EmptyState } from '@/components/app/states'
import { FormError, FormSuccess } from '@/components/app/auth-card'
import { IvrSettingsEditor } from '@/components/app/ivr-settings'
import { useAuth } from '@/components/app/auth-provider'
import { api, can, errorMessage, isApiConfigured } from '@/lib/api'
import {
  VS_CARRIERS_IVR_DEFAULTS,
  buildIvrPayload,
  validateIvrSettings,
  type IvrSettings,
} from '@/lib/settings-ivr'

/* ───────────────── Extra template fields (beyond the IVR shape) ───────────────── */

interface FaqDraft {
  question: string
  answer: string
}

interface TemplateExtras {
  businessName: string
  contactPhone: string
  timezone: string
  faqs: FaqDraft[]
  calendarTemplate: string
  smsTemplate: string
  emailTemplate: string
  showDashboard: boolean
  showCallLog: boolean
  showCrm: boolean
}

const VS_EXTRAS_DEFAULT: TemplateExtras = {
  businessName: 'VS Carriers Inc.',
  contactPhone: '',
  timezone: 'America/Toronto',
  faqs: [
    { question: 'What areas do you cover?', answer: 'We run loads across Canada and the lower 48 US states.' },
    { question: 'Are you hiring drivers?', answer: 'Yes — we onboard owner-operators and company drivers. I can take your details for the manager.' },
    { question: 'How do I check on a load?', answer: 'I can connect you to dispatch, or take your load number and have them call you back.' },
  ],
  calendarTemplate:
    'Appointment for {{customer_name}} — {{service}} on {{date}} at {{time}}. Phone: {{phone}}.',
  smsTemplate:
    "Hi {{customer_name}}, this is VS Carriers. Thanks for calling! Reply here with any load details and we'll follow up. Reply STOP to opt out.",
  emailTemplate:
    "Hi {{customer_name}},\n\nThanks for reaching out to VS Carriers. We've logged your request and a team member will be in touch shortly.\n\n— VS Carriers Dispatch",
  showDashboard: true,
  showCallLog: true,
  showCrm: true,
}

export default function VsCarriersSetupPage() {
  const { me } = useAuth()
  const canConfigure = can.admin(me?.role)

  const [ivr, setIvr] = React.useState<IvrSettings>(() => structuredCloneSafe(VS_CARRIERS_IVR_DEFAULTS))
  const [extras, setExtras] = React.useState<TemplateExtras>(VS_EXTRAS_DEFAULT)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  if (!isApiConfigured) {
    return (
      <>
        <PageHeader title="Tenant Setup" description="Provision a new customer workspace." />
        <NotConfiguredState feature="Tenant provisioning" />
      </>
    )
  }

  if (!canConfigure) {
    return (
      <>
        <PageHeader title="Tenant Setup" description="Provision a new customer workspace." />
        <Card>
          <CardContent className="p-8">
            <EmptyState
              icon={Building2}
              title="Admin access required"
              description="Only admins and owners can run tenant setup."
            />
          </CardContent>
        </Card>
      </>
    )
  }

  const setExtra = (patch: Partial<TemplateExtras>) => setExtras((prev) => ({ ...prev, ...patch }))
  const setFaq = (i: number, patch: Partial<FaqDraft>) =>
    setExtras((prev) => ({ ...prev, faqs: prev.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }))
  const addFaq = () => setExtras((prev) => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }))
  const removeFaq = (i: number) =>
    setExtras((prev) => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }))

  const provision = async () => {
    setError(null)
    setSuccess(null)
    const problems = validateIvrSettings(ivr)
    if (problems.length > 0) {
      setError(problems[0])
      return
    }
    setSaving(true)
    try {
      // 1) Push the IVR/greetings shape + template extras to /app/settings.
      await api.settings.update({
        business_name: extras.businessName,
        phone: extras.contactPhone,
        timezone: extras.timezone,
        ...buildIvrPayload(ivr),
        templates: {
          calendar: extras.calendarTemplate,
          sms: extras.smsTemplate,
          email: extras.emailTemplate,
        },
        visibility: {
          dashboard: extras.showDashboard,
          call_log: extras.showCallLog,
          crm: extras.showCrm,
        },
      })
      // 2) Seed the knowledge base with the FAQ templates (best-effort).
      const faqs = extras.faqs.filter((f) => f.question.trim() && f.answer.trim())
      await Promise.allSettled(
        faqs.map((f) =>
          api.knowledge.create({
            type: 'faq',
            question: f.question,
            answer: f.answer,
            title: f.question,
            body: f.answer,
          })
        )
      )
      setSuccess(
        `Configuration saved for ${extras.businessName}. Settings updated and ${faqs.length} FAQ${faqs.length === 1 ? '' : 's'} seeded.`
      )
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Tenant Setup"
        description="Reusable provisioning template — pre-filled for VS Carriers Inc. Edit and apply for any tenant."
        actions={<Badge variant="amber">Template</Badge>}
      />

      {error && <div className="mb-4"><FormError message={error} /></div>}
      {success && <div className="mb-4"><FormSuccess message={success} /></div>}

      <div className="space-y-6">
        {/* Business identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-navy-700" /> Business
            </CardTitle>
            <CardDescription>Identity for this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="biz">Business name</Label>
              <Input id="biz" value={extras.businessName} onChange={(e) => setExtra({ businessName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" value={extras.timezone} onChange={(e) => setExtra({ timezone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cphone">Main contact phone</Label>
              <Input
                id="cphone"
                value={extras.contactPhone}
                onChange={(e) => setExtra({ contactPhone: e.target.value })}
                placeholder="+15555550123"
              />
            </div>
          </CardContent>
        </Card>

        {/* Greetings / IVR / departments / hours / holidays — shared editor */}
        <IvrSettingsEditor value={ivr} onChange={setIvr} />

        {/* Knowledge / FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-navy-700" /> Knowledge base (FAQs)
            </CardTitle>
            <CardDescription>
              Seed answers for common caller questions. Saved to the knowledge base on apply.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extras.faqs.map((f, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Input
                      value={f.question}
                      onChange={(e) => setFaq(i, { question: e.target.value })}
                      placeholder="Question"
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeFaq(i)}
                      className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea value={f.answer} onChange={(e) => setFaq(i, { answer: e.target.value })} placeholder="Answer" rows={2} />
                </div>
              ))}
              <Button variant="outline-navy" size="sm" onClick={addFaq}>
                <Plus className="mr-1 h-4 w-4" /> Add FAQ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-navy-700" /> Calendar, SMS & email templates
            </CardTitle>
            <CardDescription>Message templates. {`{{placeholders}}`} are filled by the backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cal">Calendar / appointment template</Label>
              <Textarea id="cal" value={extras.calendarTemplate} onChange={(e) => setExtra({ calendarTemplate: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms">SMS follow-up template</Label>
              <Textarea id="sms" value={extras.smsTemplate} onChange={(e) => setExtra({ smsTemplate: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email follow-up template</Label>
              <Textarea id="email" value={extras.emailTemplate} onChange={(e) => setExtra({ emailTemplate: e.target.value })} rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-navy-700" /> Workspace visibility
            </CardTitle>
            <CardDescription>What this tenant sees in their app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Checkbox id="vis-dash" checked={extras.showDashboard} onChange={(e) => setExtra({ showDashboard: e.target.checked })} label="Dashboard" />
            <Checkbox id="vis-calls" checked={extras.showCallLog} onChange={(e) => setExtra({ showCallLog: e.target.checked })} label="Call log" />
            <Checkbox id="vis-crm" checked={extras.showCrm} onChange={(e) => setExtra({ showCrm: e.target.checked })} label="CRM" />
          </CardContent>
        </Card>

        <div className="flex flex-col items-end gap-2">
          <Button onClick={provision} disabled={saving} size="lg" variant="amber">
            {saving ? (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Applying…
              </>
            ) : (
              <>
                <Rocket className="mr-1.5 h-4 w-4" /> Apply configuration
              </>
            )}
          </Button>
          <p className="text-xs text-slate-400">
            Posts greetings/IVR/departments/hours to{' '}
            <code className="rounded bg-slate-100 px-1">/app/settings</code> and seeds FAQs into{' '}
            <code className="rounded bg-slate-100 px-1">/app/knowledge</code> for the current tenant.
          </p>
        </div>
      </div>
    </>
  )
}

/** Deep-clone the defaults so edits never mutate the shared template object. */
function structuredCloneSafe(value: IvrSettings): IvrSettings {
  return {
    ...value,
    greetings: { ...value.greetings },
    after_hours_greeting: { ...value.after_hours_greeting },
    holiday_greeting: { ...value.holiday_greeting },
    holidays: [...value.holidays],
    departments: value.departments.map((d) => ({ ...d })),
    operating_hours: { ...value.operating_hours },
  }
}
