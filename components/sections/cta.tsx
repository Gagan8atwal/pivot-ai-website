import Link from 'next/link'
import { ArrowRight, Phone, CheckCircle2, Shield, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const reassurances = [
  { icon: Shield, text: 'Founder-reviewed pilot request' },
  { icon: Clock, text: 'No automatic account activation' },
  { icon: CheckCircle2, text: 'Terms confirmed before paid service' },
]

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

          <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
            Founder-led early access — limited pilot spots
          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            Ready to review your missed-call workflow?
          </h2>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-4 max-w-xl mx-auto">
            We are onboarding an early cohort of service businesses. Pilot customers receive
            direct access to the founding team, hands-on configuration and pre-launch testing.
          </p>

          {/* Pilot boundaries */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-3 mb-10">
            {reassurances.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button
                variant="amber"
                size="xl"
                className="w-full sm:w-auto group text-base font-bold"
              >
                Request a Pilot Demo
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
                View Pilot Pricing
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-slate-500">
            Requesting a demo does not create an account, start billing or activate phone service.
            Questions? Email us at{' '}
            <a
              href="mailto:hello@pivotcalls.co"
              className="text-slate-400 hover:text-amber-400 transition-colors underline underline-offset-2"
            >
              hello@pivotcalls.co
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
