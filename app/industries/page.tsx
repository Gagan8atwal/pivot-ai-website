import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { industries } from '@/lib/industries'
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Industries We Serve — AI Receptionist for Local Service Businesses | Pivot AI',
  description:
    'Pivot AI answers calls 24/7 for 15+ local service industries — HVAC, dental, legal, roofing, landscaping, auto repair, and more. See how we help your business capture every lead.',
  alternates: { canonical: 'https://pivotcalls.co/industries' },
  openGraph: {
    title: 'Industries We Serve | Pivot AI',
    description:
      'AI-powered phone receptionist built for local service businesses across 15+ industries. See which vertical fits your business.',
    url: 'https://pivotcalls.co/industries',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industries We Serve | Pivot AI',
    description:
      'AI-powered phone receptionist built for local service businesses across 15+ industries.',
  },
}

const groups = [
  {
    heading: 'Trade Services',
    slugs: ['hvac', 'plumbing', 'electrical', 'roofing', 'landscaping'],
  },
  {
    heading: 'Healthcare',
    slugs: ['dental', 'medical', 'chiropractic'],
  },
  {
    heading: 'Local Services',
    slugs: ['automotive', 'restaurants', 'home-services'],
  },
  {
    heading: 'Professional Services',
    slugs: ['law-firm', 'insurance', 'real-estate', 'trucking'],
  },
]

const industryMap = Object.fromEntries(industries.map((i) => [i.slug, i]))

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Industries Served by Pivot AI',
  description:
    'Pivot AI provides AI-powered phone receptionist services for 15+ local service industries.',
  url: 'https://pivotcalls.co/industries',
  hasPart: industries.map((ind) => ({
    '@type': 'WebPage',
    name: `Pivot AI for ${ind.name}`,
    url: `https://pivotcalls.co/industries/${ind.slug}`,
    description: ind.metaDescription,
  })),
}

export default function IndustriesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative bg-navy-900 pt-32 pb-20 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.18), transparent)',
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
            <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Built for your industry
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight text-balance mb-6 max-w-3xl mx-auto">
              AI Call Answering Built for Local Service Businesses
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
              Pivot AI is configured for your specific industry — your services, your call flows, your
              customers. Browse 15 verticals below or request a demo tailored to your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
          </div>
        </section>

        {/* Industries grouped grid */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="space-y-14 max-w-5xl mx-auto">
              {groups.map(({ heading, slugs }) => (
                <div key={heading}>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
                    {heading}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slugs.map((slug) => {
                      const ind = industryMap[slug]
                      if (!ind) return null
                      return (
                        <Link
                          key={slug}
                          href={`/industries/${slug}`}
                          className="group bg-white rounded-xl border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md p-6 transition-all duration-200 flex flex-col"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-8 w-8 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center flex-shrink-0 transition-colors">
                              <Phone className="h-4 w-4 text-amber-600" aria-hidden="true" />
                            </div>
                            <h3 className="text-base font-semibold text-navy-900 leading-snug pt-0.5">
                              {ind.name}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-500 leading-relaxed flex-1">
                            {ind.heroSubheading.length > 110
                              ? ind.heroSubheading.slice(0, 107) + '…'
                              : ind.heroSubheading}
                          </p>
                          <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-amber-600 group-hover:text-amber-500 transition-colors">
                            Learn more
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What every industry gets */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                Universal features
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 text-balance">
                Every industry gets the same powerful foundation
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { title: 'AI receptionist (24/7)', desc: 'Answers every call immediately — nights, weekends, holidays.' },
                { title: 'Founder-led onboarding', desc: 'We configure your knowledge base and call flows for you.' },
                { title: 'Lead capture & storage', desc: 'Every caller\'s details captured and stored securely.' },
                { title: 'SMS notifications', desc: 'Real-time alerts for new leads, bookings, and urgent calls.' },
                { title: 'Appointment booking', desc: 'Callers schedule directly into your Google Calendar.' },
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

        {/* Bottom CTA */}
        <section className="py-16 bg-navy-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-balance max-w-2xl mx-auto">
              Don&apos;t see your industry?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Pivot AI works with most local service businesses. If yours isn&apos;t listed,
              reach out — we&apos;ll tell you if we&apos;re a fit and get you set up in one business day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button variant="amber" size="lg" className="w-full sm:w-auto group">
                  Request a Free Demo
                  <ArrowRight
                    className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
