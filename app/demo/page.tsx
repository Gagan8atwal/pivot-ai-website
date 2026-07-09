'use client'

import * as React from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Input, Textarea, Label, Select, Checkbox } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Users,
  AlertCircle,
  Shield,
  Calendar,
  ArrowRight,
} from 'lucide-react'

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
  company_website: string // Honeypot
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
    title: 'Submit this form',
    desc: 'Takes under 2 minutes. No credit card or commitment needed.',
  },
  {
    step: '2',
    title: 'A founder calls you',
    desc: 'We personally review every request and follow up within 1 business day.',
  },
  {
    step: '3',
    title: 'Live demo for your industry',
    desc: 'Watch Pivot AI answer a real call tailored to your business. About 30 minutes.',
  },
  {
    step: '4',
    title: '14-day free trial with full setup',
    desc: 'We configure your AI receptionist. No billing until you decide to continue.',
  },
]

export default function DemoPage() {
  const [form, setForm] = React.useState<FormState>(initialState)
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // SMS consent is OPTIONAL (A2P: consent must be voluntary, not a condition of
  // submitting). The checkbox no longer gates submission; the API records whether
  // it was checked. Business/contact/email/phone remain required.
  const canSubmit =
    form.businessName.trim() &&
    form.contactName.trim() &&
    form.email.trim() &&
    form.phone.trim()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
    if (error) setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.')
      }

      setSubmitted(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        {/* Hero bar */}
        <div className="bg-navy-900 py-14 text-center">
          <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
            Founder-led Early Access
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-balance">
            See Pivot AI Answer a Real Call<br className="hidden sm:block" /> for Your Business
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto mb-7">
            Fill out this 2-minute form. A founder personally reviews every request and
            follows up within 1 business day — no sales team, no runaround.
          </p>
          {/* Quick trust bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            {[
              { icon: Clock, text: 'Response within 1 business day' },
              { icon: Shield, text: 'No credit card required' },
              { icon: CheckCircle2, text: '14-day free trial included' },
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
            {/* Left: Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-3">
                    You&apos;re on the list!
                  </h2>
                  <p className="text-slate-500 leading-relaxed mb-6">
                    A founder will personally review your request and reach out to{' '}
                    <strong>{form.email}</strong> within 1 business day to schedule your demo.
                  </p>
                  {/* What happens next */}
                  <div className="text-left bg-slate-50 rounded-xl p-5 space-y-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      What happens next
                    </p>
                    {[
                      { icon: Mail, text: 'Confirmation email on its way to your inbox' },
                      { icon: Phone, text: 'A founder calls within 1 business day' },
                      { icon: Calendar, text: 'Live 30-min demo tailored to your industry' },
                      { icon: CheckCircle2, text: '14-day free trial — no credit card needed' },
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
                    Questions? Email us at{' '}
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
                    <h2 className="text-xl font-bold text-navy-900 mb-1">Your Information</h2>
                    <p className="text-sm text-slate-500">
                      We&apos;ll use this to configure your demo and get in touch.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Honeypot */}
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
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="industry">Industry</Label>
                      <div className="relative">
                        <Select
                          id="industry"
                          name="industry"
                          value={form.industry}
                          onChange={handleChange}
                        >
                          <option value="">Select your industry</option>
                          {industries.map((ind) => (
                            <option key={ind} value={ind}>{ind}</option>
                          ))}
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="employees">Team Size</Label>
                      <Select
                        id="employees"
                        name="employees"
                        value={form.employees}
                        onChange={handleChange}
                      >
                        <option value="">Select team size</option>
                        {employeeRanges.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Tell us about your business <span className="text-slate-400 font-normal">(optional)</span></Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="What types of calls do you receive? What problems are you trying to solve?"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  {/* SMS Consent — optional per A2P compliance */}
                  <div className="pt-1">
                    <Checkbox
                      id="consent"
                      name="consent"
                      checked={form.consent}
                      onChange={handleChange}
                      label={
                        <>
                          I agree to receive SMS updates from Pivot AI about my demo request.
                          Message and data rates may apply. Reply STOP to opt out at any time.
                          See our{' '}
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
                      SMS consent is optional and not required to submit this form.
                    </p>
                  </div>

                  {/* Privacy reassurance */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5">
                    <Shield className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                    <span>Your information is never shared. No spam, no sales pressure — just a real conversation with our founding team.</span>
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
                        Get My Free Demo
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    No credit card required · Cancel anytime · 14-day free trial
                  </p>
                </form>
              )}
            </div>

            {/* Right: What happens next + trust */}
            <div className="lg:col-span-2 space-y-6">
              {/* Numbered steps */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-navy-900 mb-5">
                  What happens next
                </h3>
                <ol className="space-y-5">
                  {nextSteps.map(({ step, title, desc }) => (
                    <li key={step} className="flex items-start gap-4">
                      <div
                        className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center flex-shrink-0"
                        aria-hidden="true"
                      >
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

              {/* Our promise */}
              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-amber-400 mb-2">Our promise</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  If Pivot AI doesn&apos;t improve your lead capture in 14 days,
                  we&apos;ll help you figure out why — no questions asked, no
                  billing activated.
                </p>
              </div>

              {/* What's included */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-navy-900 mb-4">Included in every trial</h3>
                <ul className="space-y-3">
                  {[
                    { icon: Phone, text: 'AI receptionist, configured for your business' },
                    { icon: Users, text: 'Founder-led onboarding and knowledge base setup' },
                    { icon: CheckCircle2, text: 'Lead capture, SMS follow-up, call transcripts' },
                    { icon: Calendar, text: 'Appointment booking with Google Calendar sync' },
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

              {/* Direct contact */}
              <div className="flex items-center gap-3 px-1">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500">Prefer email?</p>
                  <a
                    href="mailto:hello@pivotcalls.co"
                    className="text-sm font-semibold text-navy-900 hover:text-amber-600 transition-colors"
                  >
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
