import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Pricing } from '@/components/sections/pricing'
import { FAQ } from '@/components/sections/faq'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent Pivot AI pricing. Starter $49/mo, Pro $149/mo, Premium $299/mo — no hidden fees and no long-term contracts.',
  alternates: { canonical: 'https://pivotcalls.co/pricing' },
  openGraph: {
    title: 'Pricing | Pivot AI',
    description:
      'Simple, transparent Pivot AI pricing. Starter $49/mo, Pro $149/mo, Premium $299/mo — no hidden fees and no long-term contracts.',
  },
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        <div className="bg-navy-900 py-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Pricing</h1>
          <p className="text-slate-300 text-lg max-w-lg mx-auto">
            Pick the plan that matches your call volume. Change or cancel it whenever you like.
          </p>
        </div>

        {/* Same pricing section the homepage renders — one component, one price table. */}
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  )
}
