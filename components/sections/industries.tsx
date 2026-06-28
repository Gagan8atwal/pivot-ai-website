import {
  Thermometer,
  Droplets,
  AlertTriangle,
  Layers,
  Scale,
  Heart,
  Sprout,
  Wrench,
} from 'lucide-react'

const industries = [
  {
    icon: Thermometer,
    name: 'HVAC & Mechanical',
    description: 'Handle service requests, maintenance calls, and emergency HVAC repairs around the clock.',
  },
  {
    icon: Droplets,
    name: 'Plumbing & Electrical',
    description: 'Capture emergency calls, schedule service visits, and never lose a plumbing lead again.',
  },
  {
    icon: AlertTriangle,
    name: 'Water Damage & Restoration',
    description: 'Emergency calls answered in seconds. Every restoration lead captured and followed up.',
  },
  {
    icon: Layers,
    name: 'Roofing & Construction',
    description: 'Book inspections, capture project inquiries, and manage scheduling without missing a call.',
  },
  {
    icon: Scale,
    name: 'Legal & Professional',
    description: 'Screen new client calls, schedule consultations, and capture case details professionally.',
  },
  {
    icon: Heart,
    name: 'Healthcare & Dental',
    description: 'Appointment scheduling, patient intake, and after-hours coverage for clinics and practices.',
  },
  {
    icon: Sprout,
    name: 'Landscaping & Lawn Care',
    description: 'Quote requests, seasonal service bookings, and follow-ups handled automatically.',
  },
  {
    icon: Wrench,
    name: 'Auto Repair & Service',
    description: 'Answer service questions, book drop-offs, and capture every repair inquiry efficiently.',
  },
]

export function Industries() {
  return (
    <section id="industries" className="py-24 bg-navy-900">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">
            Industries We Serve
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 text-balance">
            Built for local service businesses
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Whether you run a one-person operation or a multi-location service
            company, Pivot AI is configured for your specific industry and workflows.
          </p>
        </div>

        {/* Industry grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((industry) => {
            const Icon = industry.icon
            return (
              <div
                key={industry.name}
                className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 rounded-xl p-6 transition-all duration-200 cursor-default"
              >
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                  <Icon className="h-5 w-5 text-amber-400" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{industry.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{industry.description}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-slate-500 text-sm mt-10">
          Don&apos;t see your industry?{' '}
          <a
            href="/contact"
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors underline underline-offset-4"
          >
            We work with most local service businesses — contact us.
          </a>
        </p>
      </div>
    </section>
  )
}
