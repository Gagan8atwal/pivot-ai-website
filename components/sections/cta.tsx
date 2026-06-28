import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="py-24 bg-navy-900 relative overflow-hidden">
      {/* Background effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 100%, rgba(245,158,11,0.3), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Icon */}
          <div className="h-16 w-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/30">
            <Phone className="h-8 w-8 text-navy-900" aria-hidden="true" />
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            Ready to answer every call?
          </h2>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-xl mx-auto">
            Founder-led Early Access. We are onboarding our first pilot customers and working directly with local service businesses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button
                variant="amber"
                size="xl"
                className="w-full sm:w-auto group text-base font-bold"
              >
                Get a Free Demo
                <ArrowRight
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            </Link>
            <Link href="/#pricing">
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-base"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Founder-led onboarding · Early access pilots · No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}
