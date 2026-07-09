import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { industries, getIndustry } from '@/lib/industries'
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  AlertCircle,
  Clock,
  Shield,
  ChevronDown,
} from 'lucide-react'

export function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const industry = getIndustry(slug)
  if (!industry) return {}

  const url = `https://pivotcalls.co/industries/${industry.slug}`

  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: industry.metaTitle,
      description: industry.metaDescription,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: industry.metaTitle,
      description: industry.metaDescription,
    },
  }
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const industry = getIndustry(slug)
  if (!industry) notFound()

  const pageUrl = `https://pivotcalls.co/industries/${industry.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `Pivot AI — AI Receptionist for ${industry.name}`,
        description: industry.metaDescription,
        url: pageUrl,
        provider: {
          '@type': 'Organization',
          name: 'Pivot AI',
          url: 'https://pivotcalls.co',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@pivotcalls.co',
            contactType: 'sales',
          },
        },
        areaServed: { '@type': 'Country', name: 'United States' },
        keywords: industry.jsonLdKeywords.join(', '),
        offers: {
          '@type': 'Offer',
          description: '14-day free trial, no credit card required',
          price: '49',
          priceCurrency: 'USD',
          url: 'https://pivotcalls.co/demo',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: industry.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-center bg-navy-900 overflow-hidden pt-16">
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(245,158,11,0.15), transparent)',
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20 text-center">
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Pivot AI for {industry.name}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight text-balance mb-6 max-w-4xl mx-auto">
              {industry.heroHeading}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
              {industry.heroSubheading}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link href="/demo">
                <Button variant="amber" size="xl" className="w-full sm:w-auto group">
                  Get a Free Demo
                  <ArrowRight
                    className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 justify-center text-sm text-slate-400">
              {[
                { icon: Clock, text: 'Response within 1 business day' },
                { icon: Shield, text: 'No credit card required' },
                { icon: CheckCircle2, text: '14-day free trial' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                The Problem
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-balance">
                Why {industry.name} lose revenue to the phone
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {industry.painPoints.map((point) => (
                <div
                  key={point.title}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-navy-900 leading-snug">
                      {point.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed pl-11">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits / How Pivot AI Helps */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                The Solution
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-balance">
                How Pivot AI works for {industry.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {industry.benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-semibold text-navy-900 leading-snug">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed pl-11">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 bg-navy-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
              Ready to see it in action?
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance max-w-2xl mx-auto">
              {industry.ctaHeading}
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              {industry.ctaSubheading}
            </p>
            <Link href="/demo">
              <Button variant="amber" size="xl" className="group">
                Request a Free Demo
                <ArrowRight
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            </Link>
          </div>
        </section>

        {/* What's included */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                What You Get
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-balance">
                Everything included in every trial
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { title: 'AI receptionist (24/7)', desc: 'Answers every call professionally, day or night.' },
                { title: 'Founder-led onboarding', desc: 'We configure your knowledge base and call flows for you.' },
                { title: 'Lead capture & storage', desc: 'Every caller\'s details captured and stored securely.' },
                { title: 'SMS notifications', desc: 'Get alerted to new leads and urgent calls in real time.' },
                { title: 'Appointment booking', desc: 'Callers can schedule directly into your calendar.' },
                { title: 'Call transcripts', desc: 'Full transcripts of every call delivered to your inbox.' },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  FAQ
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-balance">
                  Common questions from {industry.name}
                </h2>
              </div>
              <div className="space-y-4">
                {industry.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none select-none">
                      <span className="text-base font-semibold text-navy-900 leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className="h-4 w-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
              <p className="text-center text-sm text-slate-500 mt-8">
                Have more questions?{' '}
                <Link
                  href="/contact"
                  className="text-navy-900 font-semibold hover:text-amber-600 transition-colors underline underline-offset-4"
                >
                  Contact our team
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* How it works — internal link to homepage */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                Simple setup
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-4">
                Up and running in one business day
              </h2>
              <ol className="text-left space-y-4 max-w-lg mx-auto mb-8">
                {[
                  { n: '1', text: 'Request a demo — takes 2 minutes.' },
                  { n: '2', text: 'A founder calls you within 1 business day and configures your AI.' },
                  { n: '3', text: 'Your AI receptionist is live — answering calls for your ' + industry.shortName + ' business.' },
                ].map(({ n, text }) => (
                  <li key={n} className="flex items-start gap-4">
                    <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {n}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  <Button variant="amber" size="lg" className="w-full sm:w-auto group">
                    Get a Free Demo
                    <ArrowRight
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button variant="outline-navy" size="lg" className="w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Other industries — internal linking */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-base font-semibold text-navy-900 mb-6 text-center">
                Pivot AI also serves
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {industries
                  .filter((ind) => ind.slug !== industry.slug)
                  .map((ind) => (
                    <Link
                      key={ind.slug}
                      href={`/industries/${ind.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-600 hover:border-amber-400 hover:text-navy-900 transition-colors"
                    >
                      <Phone className="h-3 w-3 text-amber-500" aria-hidden="true" />
                      {ind.shortName}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
