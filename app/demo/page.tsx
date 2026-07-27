'use client'

import * as React from 'react'
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Shield,
  Users,
} from 'lucide-react'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Checkbox, Input, Label, Select, Textarea } from '@/components/ui/input'
import { SMS_CONSENT_PREFIX, createSubmissionId } from '@/lib/intake'

const industries = [
  'HVAC & Mechanical',
  'Plumbing & Electrical',
  'Water Damage & Restoration',
  'Roofing & Construction',
  'Legal & Professional',
  'Healthcare & Dental',
  'Landscaping & Lawn Care',
  'Auto Repair & Service',
  'Other',
]

const employeeRanges = [
  '1 (just me)',
  '2–5 employees',
  '6–15 employees',
  '16–50 employees',
  '50+ employees',
]

interface FormState {
  businessName: string
  contactName: string
  email: string
  phone: string
  industry: string
  employees: string
  message: string
  consent: boolean
  company_website: string
}

const initialState: FormState = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  industry: '',
  employees: '',
  message: '',
  consent: false,
  company_website: '',
}

const nextSteps = [
  {
    step: '1',
    title: 'Submit your request',
    desc: 'Tell us about the business and the calls you want Pivot AI to handle.',
  },
  {
    step: '2',
    title: 'Founder review',
    desc: 'We review fit, requirements, integrations, and any operational constraints.',
  },
  {
    step: '3',
    title: 'Tailored demonstration',
    desc: 'We demonstrate the receptionist flow for your business and answer questions.',
  },
  {
    step: '4',
    title: 'Pilot scope confirmation',
    desc: 'Setup, testing, pricing, and pilot terms are confirmed before activation.',
  },
]

export default function DemoPage() {
  const [form, setForm] = React.useState<FormState>(initialState)
  const [submissionMeta] = React.useState(() => ({
    submissionId: createSubmissionId(),
    formStartedAt: Date.now(),
  }))
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSubmit =
    form.businessName.trim() &&
    form.contactName.trim() &&
    form.email.trim() &&
    form.phone.trim()

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }))
    if (error) setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...submissionMeta }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.')
      }
      setSubmitted(true)
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <div className="bg-navy-900 py-14 text-center">
          <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
            Founder-led pilot evaluation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-balance">
            See Pivot AI Answer a Real Call<br className="hidden sm:block" /> for Your Business
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-7">
            Submit a short request. We&apos;ll review your requirements and follow up to arrange a
            tailored demonstration when the use case is a practical fit.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            {[
              { icon: Clock, text: 'Founder review after submission' },
              { icon: Shield, text: 'No payment to request a demo' },
              { icon: CheckCircle2, text: 'Scope confirmed before activation' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-14">
          <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-3">Demo request received</h2>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    Your request has been saved. We&apos;ll review the business details and contact you
                    using the information provided.
                  </p>
                  <div className="text-left bg-slate-50 rounded-xl p-5 space-y-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      What happens next
                    </p>
                    {[
                      { icon: CheckCircle2, text: 'Your request is recorded with a unique reference' },
                      { icon: Phone, text: 'A founder reviews the use case and contact details' },
                      { icon: Calendar, text: 'A demonstration time is arranged after review' },
                      { icon: Shield, text: 'Nothing is activated or billed by this form submission' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                        </div>
                        <p className="text-sm text-slate-600">{text}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-5">
                    Questions? Email{' '}
                    <a href="mailto:hello@pivotcalls.co" className="text-navy-900 underline hover:text-amber-600">
                      hello@pivotcalls.co
                    </a>
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
                  noValidate
                >
                  <div>
                    <h2 className="text-xl font-bold text-navy-900 mb-1">Your information</h2>
                    <p className="text-sm text-slate-500">
                      We&apos;ll use this to evaluate the request and arrange the demonstration.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="company_website">Company Website</label>
                    <input
                      id="company_website"
                      name="company_website"
                      type="text"
                      value={form.company_website}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="businessName">Business Name <span className="text-red-500" aria-label="required">*</span></Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        placeholder="Desert Pro HVAC"
                        value={form.businessName}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contactName">Your Name <span className="text-red-500" aria-label="required">*</span></Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        placeholder="James Mitchell"
                        value={form.contactName}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Work Email <span className="text-red-500" aria-label="required">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="james@desertprohvac.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        maxLength={254}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Business Phone <span className="text-red-500" aria-label="required">*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 234-5678"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        maxLength={40}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="industry">Industry</Label>
                      <Select id="industry" name="industry" value={form.industry} onChange={handleChange}>
                        <option value="">Select your industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="employees">Team Size</Label>
                      <Select id="employees" name="employees" value={form.employees} onChange={handleChange}>
                        <option value="">Select team size</option>
                        {employeeRanges.map((range) => (
                          <option key={range} value={range}>{range}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">
                      Tell us about your business <span className="text-slate-400 font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="What calls do you receive and what problem are you trying to solve?"
                      value={form.message}
                      onChange={handleChange}
                      maxLength={2000}
                      rows={3}
                    />
                  </div>

                  <div className="pt-1">
                    <Checkbox
                      id="consent"
                      name="consent"
                      checked={form.consent}
                      onChange={handleChange}
                      label={
                        <>
                          {SMS_CONSENT_PREFIX} See our{' '}
                          <a href="/privacy" className="text-navy-900 underline hover:text-amber-600">
                            Privacy Policy
                          </a>{' '}
                          and{' '}
                          <a href="/terms" className="text-navy-900 underline hover:text-amber-600">
                            Terms of Service
                          </a>
                          .
                        </>
                      }
                    />
                    <p className="text-xs text-slate-400 mt-1.5 ml-7">
                      SMS consent is optional and is not required to request a demo.
                    </p>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5">
                    <Shield className="mt-0.5 h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                    <span>
                      We use these details to evaluate and respond to the request and to operate the
                      acquisition workflow described in our Privacy Policy.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="amber"
                    size="lg"
                    className="w-full mt-1 group"
                    disabled={!canSubmit || loading}
                  >
                    {loading ? 'Submitting…' : (
                      <>
                        Request My Demo
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    Submitting this form does not create an account, activate service, or start billing.
                  </p>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-navy-900 mb-5">What happens next</h3>
                <ol className="space-y-5">
                  {nextSteps.map(({ step, title, desc }) => (
                    <li key={step} className="flex items-start gap-4">
                      <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        {step}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-amber-400 mb-2">Controlled pilot process</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  A demo request is only an evaluation request. Activation, integrations, testing,
                  pricing, and any pilot period are agreed separately after review.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-navy-900 mb-4">What we evaluate</h3>
                <ul className="space-y-3">
                  {[
                    { icon: Phone, text: 'Call types, greeting, routing, and escalation needs' },
                    { icon: Users, text: 'Business owners, staff roles, and onboarding effort' },
                    { icon: CheckCircle2, text: 'Lead capture and follow-up requirements' },
                    { icon: Calendar, text: 'Appointment-booking and calendar integration needs' },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 px-1">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500">Prefer email?</p>
                  <a href="mailto:hello@pivotcalls.co" className="text-sm font-semibold text-navy-900 hover:text-amber-600 transition-colors">
                    hello@pivotcalls.co
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
