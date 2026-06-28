import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote:
      'Before Pivot AI, we were losing 3 to 4 customers every single day to missed calls. Now our AI answers every single one, books the appointment, and texts us immediately. Revenue is up 23% since we started.',
    name: 'James Mitchell',
    role: 'Owner',
    company: 'Desert Pro HVAC',
    location: 'Phoenix, AZ',
    initials: 'JM',
    color: 'bg-amber-500',
  },
  {
    quote:
      'The ROI was immediate. We went from a 40% missed call rate to zero. Our AI receptionist even answers after-hours calls and books jobs while we\'re sleeping. I genuinely don\'t know how we operated without it.',
    name: 'Sarah Chen',
    role: 'Operations Manager',
    company: 'Pacific Restoration Services',
    location: 'San Diego, CA',
    initials: 'SC',
    color: 'bg-blue-500',
  },
  {
    quote:
      'Setup took less than 24 hours and the AI already sounds more professional than any receptionist we\'ve ever hired. Our customers can\'t even tell it\'s an AI. This is an absolute game-changer for a small plumbing company.',
    name: 'Robert Torres',
    role: 'Owner',
    company: 'Riverside Plumbing & Mechanical',
    location: 'Fresno, CA',
    initials: 'RT',
    color: 'bg-green-500',
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            Customer Stories
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            Local businesses love Pivot AI
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Don&apos;t take our word for it. Here&apos;s what business owners say after
            their first month with Pivot AI.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-slate-200 flex flex-col">
              <CardContent className="p-7 flex flex-col flex-1">
                {/* Stars */}
                <div className="flex gap-1 mb-5" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-slate-700 leading-relaxed text-[0.95rem] flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div
                    className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-sm font-bold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.role} · {t.company} · {t.location}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: '200+', label: 'Businesses using Pivot AI' },
            { value: '4.9/5', label: 'Average customer rating' },
            { value: '14 days', label: 'Free trial on all plans' },
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
