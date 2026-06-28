import { Settings2, Phone, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Settings2,
    title: 'We configure your AI Receptionist',
    description:
      'Tell us about your business — your services, hours, pricing, and common questions. Our team configures your AI receptionist and has it live within 24 hours. No technical knowledge required.',
    highlight: 'Ready in 24 hours',
  },
  {
    number: '02',
    icon: Phone,
    title: 'Every call is answered instantly',
    description:
      'Your existing phone number routes to Pivot AI. Every call is answered in under 2 seconds, 24/7 — nights, weekends, and holidays included. Callers hear a professional, natural-sounding AI voice.',
    highlight: '< 2 second response',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'You capture every lead automatically',
    description:
      'The AI books appointments, captures contact details, answers questions, and notifies you immediately by email and SMS. Every conversation is logged, every lead is saved. Nothing falls through the cracks.',
    highlight: '100% lead capture',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            Set up in 24 hours. Never miss a call again.
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Getting started with Pivot AI is simple. We handle the heavy lifting
            so you can focus on running your business.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop only) */}
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 hidden lg:block"
            aria-hidden="true"
          >
            <div className="flex items-center gap-0">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-48 xl:w-64 h-0.5 bg-gradient-to-r from-amber-300 to-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  {/* Step number + icon */}
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-navy-900 flex items-center justify-center shadow-lg shadow-navy-900/20 relative z-10">
                      <Icon className="h-7 w-7 text-amber-400" aria-hidden="true" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center z-20 shadow-sm">
                      <span className="text-xs font-bold text-navy-900">{index + 1}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-4">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                      <span className="text-xs font-semibold text-amber-700">{step.highlight}</span>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-3">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-base">
            Questions about setup?{' '}
            <a
              href="/contact"
              className="text-navy-900 font-semibold hover:text-amber-600 transition-colors underline underline-offset-4"
            >
              Talk to our team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
