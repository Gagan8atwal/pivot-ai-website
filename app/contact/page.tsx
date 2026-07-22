'use client'

import * as React from 'react'
import { AlertCircle, CheckCircle2, Clock, Mail, MapPin, Shield } from 'lucide-react'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { createSubmissionId } from '@/lib/intake'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
  company_website: string
}

const initialForm: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  company_website: '',
}

export default function ContactPage() {
  const [form, setForm] = React.useState<ContactForm>(initialForm)
  const [submissionMeta] = React.useState(() => ({
    submissionId: createSubmissionId(),
    formStartedAt: Date.now(),
  }))
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim()

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
    if (error) setError(null)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/contact', {
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-slate-300 text-lg max-w-lg mx-auto">
            Questions, feedback, or need help? We&apos;re here for you.
          </p>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-14">
          <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-3">Message received</h2>
                  <p className="text-slate-500">
                    Your message has been saved. Our team will review it and respond as soon as possible.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
                  noValidate
                >
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Send a message</h2>

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
                      <Label htmlFor="name">Your Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="James Mitchell"
                        value={form.name}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="james@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        maxLength={254}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Question about pricing"
                      value={form.subject}
                      onChange={handleChange}
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you…"
                      value={form.message}
                      onChange={handleChange}
                      required
                      maxLength={5000}
                      rows={5}
                    />
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                    <Shield className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
                    <span>
                      We use these details to respond to your request and operate our acquisition workflow.
                      Review our{' '}
                      <a href="/privacy" className="underline hover:text-navy-900">Privacy Policy</a>.
                    </span>
                  </div>

                  <Button
                    type="submit"
                    variant="amber"
                    size="lg"
                    className="w-full"
                    disabled={!canSubmit || loading}
                  >
                    {loading ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>

            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="font-bold text-navy-900">Get in touch</h3>
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'hello@pivotcalls.co',
                    href: 'mailto:hello@pivotcalls.co',
                  },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: 'Fresno, California',
                    href: null,
                  },
                  {
                    icon: Clock,
                    label: 'Response target',
                    value: 'Within 1 business day',
                    href: null,
                  },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-medium text-navy-900 hover:text-amber-600 transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-navy-900">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-amber-800 mb-1">Prefer a demo?</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Request a founder-led pilot demo tailored to your business. We&apos;ll confirm fit,
                  setup scope, and any pilot terms before anything begins.{' '}
                  <a href="/demo" className="underline font-semibold hover:text-amber-900 transition-colors">
                    Request a demo
                  </a>
                  .
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
