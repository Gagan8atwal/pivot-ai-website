'use client'

import * as React from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Input, Textarea, Label, Select, Checkbox } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Phone, Mail, Clock, Users, AlertCircle } from 'lucide-react'

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

export default function DemoPage() {
  const [form, setForm] = React.useState<FormState>(initialState)
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSubmit =
    form.consent &&
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
            14-Day Free Trial
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 text-balance">
            Request a Free Demo
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            See Pivot AI answer a real call for your business. Founder-led setup
            and there&apos;s no credit card required to start.
          </p>
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
                    We&apos;ll be in touch soon!
                  </h2>
                  <p className="text-slate-500 leading-relaxed">
                    Thank you for your interest in Pivot AI. A member of our team will
                    reach out to schedule your personalized demo shortly.
                  </p>
                  <p className="text-sm text-slate-400 mt-4">
                    Check your inbox at <strong>{form.email}</strong> for confirmation.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
                  noValidate
                >
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Your Information</h2>
                  <p className="text-sm text-slate-500 pb-2">
                    We&apos;ll use this to configure your demo and get in touch.
                  </p>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Honeypot */}
                  <div className="hidden">
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
                      <Label htmlFor="businessName">Business Name *</Label>
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
                      <Label htmlFor="contactName">Your Name *</Label>
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
                      <Label htmlFor="email">Work Email *</Label>
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
                      <Label htmlFor="phone">Business Phone *</Label>
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
                    <Label htmlFor="message">Tell us about your business (optional)</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="What types of calls do you receive? What problems are you trying to solve?"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  {/* Consent */}
                  <div className="pt-2">
                    <Checkbox
                      id="consent"
                      name="consent"
                      checked={form.consent}
                      onChange={handleChange}
                      label={
                        <>
                          I agree to receive communications from Pivot AI about my demo
                          request, including text messages. Message and data rates may apply.
                          Reply STOP to opt out at any time. See our{' '}
                          <a href="/privacy" className="text-navy-900 underline hover:text-amber-600">
                            Privacy Policy
                          </a>{' '}
                          and{' '}
                          <a href="/terms" className="text-navy-900 underline hover:text-amber-600">
                            Terms of Service
                          </a>
                          . *
                        </>
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="amber"
                    size="lg"
                    className="w-full mt-2"
                    disabled={!canSubmit || loading}
                  >
                    {loading ? 'Submitting…' : 'Request Your Free Demo'}
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    * Required for SMS communications. You may opt out at any time.
                  </p>
                </form>
              )}
            </div>

            {/* Right: Benefits */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-bold text-navy-900 mb-5">
                  What to expect
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: Phone,
                      title: 'Personalized demo call',
                      desc: 'We walk you through Pivot AI live, tailored to your industry.',
                    },
                    {
                      icon: Clock,
                      title: 'Founder-led onboarding',
                      desc: 'If you move forward, your AI is configured by our founding team.',
                    },
                    {
                      icon: Users,
                      title: 'Dedicated onboarding',
                      desc: 'We set up your knowledge base, FAQs, and call flows for you.',
                    },
                    {
                      icon: Mail,
                      title: '14-day free trial',
                      desc: 'No credit card required. Cancel anytime with zero hassle.',
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-amber-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-navy-900">{title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-navy-900 rounded-2xl p-6 text-white">
                <p className="text-sm font-semibold text-amber-400 mb-2">Our promise</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  If Pivot AI doesn&apos;t improve your lead capture in 14 days,
                  we&apos;ll help you figure out why — no questions asked, no
                  billing activated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
