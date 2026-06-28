import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'Perfect for solo operators and small businesses just getting started.',
    callVolume: 'Up to 100 calls/month',
    features: [
      'AI receptionist (24/7)',
      'Lead capture & storage',
      'SMS notifications',
      'Email confirmations',
      'Basic knowledge base',
      'Call transcripts',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 149,
    period: 'month',
    description: 'The most popular plan for growing businesses that handle high call volume.',
    callVolume: 'Up to 500 calls/month',
    features: [
      'Everything in Starter',
      'Appointment booking',
      'Google Calendar sync',
      'Advanced knowledge base',
      'Multi-tenant support',
      'Call analytics dashboard',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 299,
    period: 'month',
    description: 'For multi-location businesses that need unlimited capacity and dedicated support.',
    callVolume: 'Unlimited calls',
    features: [
      'Everything in Pro',
      'Unlimited calls',
      'Custom AI voice',
      'Multi-language support',
      'White-label option',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            Simple Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            Transparent plans for every business
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            No hidden fees. No long-term contracts. Start your 14-day free trial
            today — no credit card required.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative rounded-2xl flex flex-col',
                plan.highlight
                  ? 'bg-navy-900 text-white ring-2 ring-amber-500 shadow-2xl shadow-navy-900/30 scale-[1.02]'
                  : 'bg-white border border-slate-200 shadow-sm'
              )}
            >
              {/* Popular badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="amber-solid" className="px-4 py-1.5 text-xs font-bold shadow-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Plan name & price */}
                <div className="mb-6">
                  <h3
                    className={cn(
                      'text-lg font-bold mb-1',
                      plan.highlight ? 'text-amber-400' : 'text-slate-500'
                    )}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span
                      className={cn(
                        'text-5xl font-bold tracking-tight',
                        plan.highlight ? 'text-white' : 'text-navy-900'
                      )}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={cn(
                        'text-sm mb-2',
                        plan.highlight ? 'text-slate-400' : 'text-slate-400'
                      )}
                    >
                      /{plan.period}
                    </span>
                  </div>
                  <p
                    className={cn(
                      'text-sm leading-relaxed',
                      plan.highlight ? 'text-slate-300' : 'text-slate-500'
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Call volume */}
                <div
                  className={cn(
                    'rounded-lg px-4 py-2.5 text-sm font-semibold mb-6 text-center',
                    plan.highlight
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-amber-50 text-amber-700'
                  )}
                >
                  {plan.callVolume}
                </div>

                {/* Feature list */}
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2
                        className={cn(
                          'h-5 w-5 flex-shrink-0 mt-0.5',
                          plan.highlight ? 'text-amber-400' : 'text-green-500'
                        )}
                        aria-hidden="true"
                      />
                      <span
                        className={cn(
                          'text-sm',
                          plan.highlight ? 'text-slate-300' : 'text-slate-600'
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={plan.name === 'Premium' ? '/contact' : '/demo'}>
                  <Button
                    variant={plan.highlight ? 'amber' : 'outline-navy'}
                    size="lg"
                    className="w-full group"
                  >
                    {plan.cta}
                    <ArrowRight
                      className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-400 mt-10">
          All plans include a 14-day free trial. Cancel anytime. Need something custom?{' '}
          <Link
            href="/contact"
            className="text-navy-900 font-medium hover:text-amber-600 transition-colors underline underline-offset-4"
          >
            Contact us for enterprise pricing.
          </Link>
        </p>
      </div>
    </section>
  )
}
