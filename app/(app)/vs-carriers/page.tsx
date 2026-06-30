'use client'

import * as React from 'react'
import {
  Building2,
  Languages,
  PhoneForwarded,
  Clock,
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
import { useAuth } from '@/components/app/auth-provider'
import { api, can, errorMessage, isApiConfigured } from '@/lib/api'

/* ───────────────── Template model (reusable for any tenant) ───────────────── */

interface LanguageConfig {
  code: string
  label: string
  enabled: boolean
  greeting: string
}

interface DepartmentConfig {
  key: string
  label: string
  phone: string
  warmTransfer: boolean
}

interface FaqDraft {
  question: string
  answer: string
}

interface TenantTemplate {
  businessName: string
  contactPhone: string
  timezone: string
  aiAnswersFirst: boolean
  languages: LanguageConfig[]
  departments: DepartmentConfig[]
  businessHours: string
  afterHoursGreeting: string
  faqs: FaqDraft[]
  calendarTemplate: string
  smsTemplate: string
  emailTemplate: string
  showDashboard: boolean
  showCallLog: boolean
  showCrm: boolean
}

// Default = VS Carriers Inc. first-customer template.
const VS_CARRIERS_DEFAULT: TenantTemplate = {
  businessName: 'VS Carriers Inc.',
  contactPhone: '',
  timezone: 'America/Toronto',
  aiAnswersFirst: true,
  languages: [
    {
      code: 'en',
      label: 'English',
      enabled: true,
      greeting: 'Thank you for calling VS Carriers. This is our AI assistant — how can I help you today?',
    },
    {
      code: 'pa',
      label: 'Punjabi',
      enabled: true,
      greeting: 'VS Carriers nu phone karan layi dhanvaad. Main tuhadi kiven madad kar sakda haan?',
    },
    {
      code: 'hi',
      label: 'Hindi',
      enabled: true,
      greeting: 'VS Carriers ko call karne ke liye dhanyavaad. Main aapki kaise madad kar sakta hoon?',
    },
  ],
  departments: [
    { key: 'dispatch', label: 'Dispatch', phone: '', warmTransfer: true },
    { key: 'mechanic', label: 'Mechanic', phone: '', warmTransfer: true },
    { key: 'manager', label: 'Manager', phone: '', warmTransfer: true },
  ],
  businessHours: 'Mon–Fri 8:00am–6:00pm\nSat 9:00am–2:00pm\nSun Closed',
  afterHoursGreeting:
    "Thanks for calling VS Carriers. We're currently closed. Leave your name, number, and load details and our team will call you back first thing.",
  faqs: [
    { question: 'What areas do you cover?', answer: 'We run loads across Canada and the lower 48 US states.' },
    { question: 'Are you hiring drivers?', answer: 'Yes — we onboard owner-operators and company drivers. I can take your details for the manager.' },
    { question: 'How do I check on a load?', answer: 'I can connect you to dispatch, or take your load number and have them call you back.' },
  ],
  calendarTemplate:
    'Appointment for {{customer_name}} — {{service}} on {{date}} at {{time}}. Phone: {{phone}}.',
  smsTemplate:
    'Hi {{customer_name}}, this is VS Carriers. Thanks for calling! Reply here with any load details and we\'ll follow up. Reply STOP to opt out.',
  emailTemplate:
    'Hi {{customer_name}},\n\nThanks for reaching out to VS Carriers. We\'ve logged your request and a team member will be in touch shortly.\n\n— VS Carriers Dispatch',
  showDashboard: true,
  showCallLog: true,
  showCrm: true,
}

export default function VsCarriersSetupPage() {
  const { me } = useAuth()
  const canConfigure = can.admin(me?.role)
  const [t, setT] = React.useState<TenantTemplate>(VS_CARRIERS_DEFAULT)
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

  const set = (patch: Partial<TenantTemplate>) => setT((prev) => ({ ...prev, ...patch }))
  const setLang = (i: number, patch: Partial<LanguageConfig>) =>
    setT((prev) => ({
      ...prev,
      languages: prev.languages.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }))
  const setDept = (i: number, patch: Partial<DepartmentConfig>) =>
    setT((prev) => ({
      ...prev,
      departments: prev.departments.map((d, idx) => (idx === i ? { ...d, ...patch } : d)),
    }))
  const setFaq = (i: number, patch: Partial<FaqDraft>) =>
    setT((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }))
  const addFaq = () => setT((prev) => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }))
  const removeFaq = (i: number) =>
    setT((prev) => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }))

  const buildSettingsPayload = () => {
    const enabledLangs = t.languages.filter((l) => l.enabled)
    const primary = enabledLangs[0]
    return {
      business_name: t.businessName,
      phone: t.contactPhone,
      timezone: t.timezone,
      ai_answers_first: t.aiAnswersFirst,
      greeting: primary?.greeting ?? '',
      languages: enabledLangs.map((l) => ({ code: l.code, label: l.label, greeting: l.greeting })),
      menu: t.departments.map((d) => ({
        key: d.key,
        label: d.label,
        phone: d.phone,
        warm_transfer: d.warmTransfer,
      })),
      hours: t.businessHours,
      after_hours_greeting: t.afterHoursGreeting,
      templates: {
        calendar: t.calendarTemplate,
        sms: t.smsTemplate,
        email: t.emailTemplate,
      },
      visibility: {
        dashboard: t.showDashboard,
        call_log: t.showCallLog,
        crm: t.showCrm,
      },
    }
  }

  const provision = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // 1) Push the full configuration to /app/settings.
      await api.settings.update(buildSettingsPayload())
      // 2) Seed the knowledge base with the FAQ templates (best-effort).
      const faqs = t.faqs.filter((f) => f.question.trim() && f.answer.trim())
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
        `Configuration saved for ${t.businessName}. Settings updated and ${faqs.length} FAQ${faqs.length === 1 ? '' : 's'} seeded.`
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
        {/* Business */}
        <Section icon={Building2} title="Business" description="Identity for this tenant.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="biz">Business name</Label>
              <Input id="biz" value={t.businessName} onChange={(e) => set({ businessName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" value={t.timezone} onChange={(e) => set({ timezone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cphone">Main contact phone</Label>
              <Input
                id="cphone"
                value={t.contactPhone}
                onChange={(e) => set({ contactPhone: e.target.value })}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="flex items-end pb-1">
              <Checkbox
                id="answers-first"
                checked={t.aiAnswersFirst}
                onChange={(e) => set({ aiAnswersFirst: e.target.checked })}
                label="AI answers first, then warm-transfers when needed"
              />
            </div>
          </div>
        </Section>

        {/* Languages */}
        <Section
          icon={Languages}
          title="Languages & greetings"
          description="Per-language greeting the caller hears. English, Punjabi, and Hindi are pre-configured."
        >
          <div className="space-y-4">
            {t.languages.map((lang, i) => (
              <div key={lang.code} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{lang.label}</Badge>
                    <span className="text-xs uppercase text-slate-400">{lang.code}</span>
                  </div>
                  <Checkbox
                    id={`lang-${lang.code}`}
                    checked={lang.enabled}
                    onChange={(e) => setLang(i, { enabled: e.target.checked })}
                    label="Enabled"
                  />
                </div>
                <Textarea
                  value={lang.greeting}
                  disabled={!lang.enabled}
                  onChange={(e) => setLang(i, { greeting: e.target.value })}
                  rows={2}
                  placeholder={`${lang.label} greeting`}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Main menu / departments */}
        <Section
          icon={PhoneForwarded}
          title="Main menu & warm transfer"
          description="Departments the caller can reach. Phone numbers are placeholders until provisioned."
        >
          <div className="space-y-3">
            {t.departments.map((d, i) => (
              <div key={d.key} className="grid items-center gap-3 sm:grid-cols-[120px_1fr_auto]">
                <Badge variant="default" className="w-fit capitalize">{d.label}</Badge>
                <Input
                  value={d.phone}
                  onChange={(e) => setDept(i, { phone: e.target.value })}
                  placeholder={`${d.label} phone (placeholder)`}
                />
                <Checkbox
                  id={`wt-${d.key}`}
                  checked={d.warmTransfer}
                  onChange={(e) => setDept(i, { warmTransfer: e.target.checked })}
                  label="Warm transfer"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Hours */}
        <Section icon={Clock} title="Business hours & after-hours" description="Used to decide live transfer vs. after-hours handling.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hours">Business hours</Label>
              <Textarea id="hours" value={t.businessHours} onChange={(e) => set({ businessHours: e.target.value })} rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="afterhours">After-hours greeting</Label>
              <Textarea id="afterhours" value={t.afterHoursGreeting} onChange={(e) => set({ afterHoursGreeting: e.target.value })} rows={4} />
            </div>
          </div>
        </Section>

        {/* Knowledge / FAQs */}
        <Section icon={BookOpen} title="Knowledge base (FAQs)" description="Seed answers for common caller questions. Saved to the knowledge base on apply.">
          <div className="space-y-3">
            {t.faqs.map((f, i) => (
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
        </Section>

        {/* Templates */}
        <Section icon={MessageSquare} title="Calendar, SMS & email templates" description="Message templates. {{placeholders}} are filled by the backend.">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cal">Calendar / appointment template</Label>
              <Textarea id="cal" value={t.calendarTemplate} onChange={(e) => set({ calendarTemplate: e.target.value })} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sms">SMS follow-up template</Label>
              <Textarea id="sms" value={t.smsTemplate} onChange={(e) => set({ smsTemplate: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email follow-up template</Label>
              <Textarea id="email" value={t.emailTemplate} onChange={(e) => set({ emailTemplate: e.target.value })} rows={4} />
            </div>
          </div>
        </Section>

        {/* Visibility */}
        <Section icon={Eye} title="Workspace visibility" description="What this tenant sees in their app.">
          <div className="space-y-3">
            <Checkbox id="vis-dash" checked={t.showDashboard} onChange={(e) => set({ showDashboard: e.target.checked })} label="Dashboard" />
            <Checkbox id="vis-calls" checked={t.showCallLog} onChange={(e) => set({ showCallLog: e.target.checked })} label="Call log" />
            <Checkbox id="vis-crm" checked={t.showCrm} onChange={(e) => set({ showCrm: e.target.checked })} label="CRM" />
          </div>
        </Section>

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
            Posts this template to <code className="rounded bg-slate-100 px-1">/app/settings</code> and
            seeds FAQs into <code className="rounded bg-slate-100 px-1">/app/knowledge</code> for the
            current tenant.
          </p>
        </div>
      </div>
    </>
  )
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-amber-500" /> {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
