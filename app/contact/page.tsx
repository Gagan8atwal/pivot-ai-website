'use client'

import * as React from 'react'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, MapPin, Clock } from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const initialForm: ContactForm = { name: '', email: '', subject: '', message: '' }

export default function ContactPage() {
  const [form, setForm] = React.useState<ContactForm>(initialForm)
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const canSubmit = form.name.trim() && form.email.trim() && form.message.trim()

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSubmitted(true)
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
            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-3">Message sent!</h2>
                  <p className="text-slate-500">
                    Thanks for reaching out. We&apos;ll get back to you within one business day.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5"
                  noValidate
                >
                  <h2 className="text-xl font-bold text-navy-900 mb-1">Send a message</h2>

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
                      rows={5}
                    />
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

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <h3 className="font-bold text-navy-900">Get in touch</h3>
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'hello@pivotai.app',
                    href: 'mailto:hello@pivotai.app',
                  },
                  {
                    icon: MapPin,
                    label: 'Location',
                    value: 'Fresno, California',
                    href: null,
                  },
                  {
                    icon: Clock,
                    label: 'Response time',
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
                  If you&apos;re interested in trying Pivot AI, our{' '}
                  <a href="/demo" className="underline font-semibold hover:text-amber-900 transition-colors">
                    demo request form
                  </a>{' '}
                  gets you a personalized call and a 14-day free trial.
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
