import { Card, CardContent } from '@/components/ui/card'

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            Early Access
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            Founder-led Early Access
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            We are onboarding our first pilot customers and working directly with local service businesses.
          </p>
        </div>

        {/* Pilot Program Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-slate-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-navy-900 mb-4">Pilot Program</h3>
              <p className="text-slate-700 leading-relaxed mb-6">
                We are currently in a limited pilot phase, working closely with a small group of service business owners to ensure Pivot AI delivers maximum value to your daily operations.
              </p>
              <ul className="space-y-3">
                {[
                  'Direct access to the founding team',
                  'Custom workflow configuration',
                  'Early access to new features',
                  'Priority support and feedback',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-navy-900 text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-amber-400 mb-4">Our Focus</h3>
              <p className="text-slate-300 leading-relaxed mb-6">
                Pivot AI is built specifically for local service businesses. We focus on the core features that matter most: answering calls, capturing leads, and booking appointments.
              </p>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-sm italic text-slate-300">
                  &ldquo;Our goal is to ensure you never miss another customer call while you focus on the work you do best.&rdquo;
                </p>
                <p className="text-xs font-semibold mt-3 text-white">— The Pivot AI Team</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: 'Pilot Phase', label: 'Limited early access' },
            { value: 'Founder-led', label: 'Direct onboarding' },
            { value: 'Local Service', label: 'Built for your business' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-navy-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
