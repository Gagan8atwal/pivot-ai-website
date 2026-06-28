import Link from 'next/link'
import {
  Phone,
  CheckCircle2,
  ArrowRight,
  Star,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-navy-900 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(245,158,11,0.15), transparent)',
        }}
        aria-hidden="true"
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            <Badge variant="white" className="mb-6 inline-flex">
              <Star className="h-3 w-3 mr-1.5 text-amber-400" aria-hidden="true" />
              Now serving 200+ local businesses
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight text-balance mb-6">
              Never Miss{' '}
              <span className="text-amber-400">Another</span>{' '}
              Customer Call.
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Pivot AI answers every inbound call, captures leads, books
              appointments, and notifies you instantly — 24/7, on autopilot.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
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

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start">
              {[
                '14-day free trial',
                'No credit card required',
                'Live in 24 hours',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product demo visual */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Main call card */}
              <div className="bg-navy-950/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
                {/* Call header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-400" aria-hidden="true" />
                      </div>
                      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-navy-950 animate-pulse" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Incoming Call</p>
                      <p className="text-sm font-semibold text-white">+1 (559) 234-5678</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs">Live</Badge>
                </div>

                {/* AI response */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-navy-900">AI</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Pivot AI Receptionist</p>
                      <p className="text-sm text-white leading-relaxed">
                        &ldquo;Thanks for calling Desert Pro HVAC! How can I help
                        you today?&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="h-3 w-3 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Caller</p>
                      <p className="text-sm text-white leading-relaxed">
                        &ldquo;I need my AC serviced. Can I book for next Tuesday?&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions taken */}
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  {[
                    { icon: CheckCircle2, label: 'Lead captured', color: 'text-green-400' },
                    { icon: Calendar, label: 'Appointment booked — Tue 2PM', color: 'text-amber-400' },
                    { icon: MessageSquare, label: 'Owner notified by email', color: 'text-blue-400' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${color}`} aria-hidden="true" />
                      <span className="text-xs text-slate-300">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -left-6 top-8 bg-white rounded-xl shadow-xl px-4 py-3 hidden lg:block">
                <p className="text-xs text-slate-500 font-medium">Response time</p>
                <p className="text-xl font-bold text-navy-900">&lt; 2s</p>
              </div>
              <div className="absolute -right-4 bottom-12 bg-white rounded-xl shadow-xl px-4 py-3 hidden lg:block">
                <p className="text-xs text-slate-500 font-medium">Calls answered</p>
                <p className="text-xl font-bold text-navy-900">100%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '2,400+', label: 'Calls answered daily' },
              { value: '98%', label: 'Lead capture rate' },
              { value: '< 2s', label: 'Average response time' },
              { value: '50+', label: 'Industries served' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl sm:text-4xl font-bold text-amber-400 mb-1">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
