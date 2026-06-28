import {
  Phone,
  MessageSquare,
  Calendar,
  RefreshCw,
  Smartphone,
  Mail,
  GitFork,
  BookOpen,
  Mic,
  Globe,
  LayoutDashboard,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Phone,
    title: 'AI Receptionist',
    description:
      'Your 24/7 professional phone representative, powered by advanced AI. Answers every call in your business name.',
  },
  {
    icon: MessageSquare,
    title: 'Missed Call Recovery',
    description:
      'Automatically texts back any missed callers within seconds, so no potential customer ever goes uncontacted.',
  },
  {
    icon: Calendar,
    title: 'Appointment Booking',
    description:
      'Collects caller details, service needs, and preferred times — then creates confirmed appointments automatically.',
  },
  {
    icon: RefreshCw,
    title: 'Google Calendar Sync',
    description:
      'Syncs booked appointments to Google Calendar. No manual entry, no double bookings, no missed appointments.',
  },
  {
    icon: Smartphone,
    title: 'SMS Notifications',
    description:
      'Instant text alerts for every lead, booking, and caller message — sent to you and your customer immediately.',
  },
  {
    icon: Mail,
    title: 'Email Confirmations',
    description:
      'Professional, branded confirmation emails to both callers and business owners after every interaction.',
  },
  {
    icon: GitFork,
    title: 'Smart Call Routing',
    description:
      'Intelligently routes callers based on intent, availability, and urgency.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description:
      'Answers common questions using your business information — hours, pricing, services, and FAQs — instantly.',
  },
  {
    icon: Mic,
    title: 'Natural AI Voice',
    description:
      'Powered by Google\'s most advanced voice technology. Callers hear a professional, warm, human-like voice.',
  },
  {
    icon: Globe,
    title: 'English-Language AI',
    description:
      'Natural, professional call handling in English. Spanish and additional languages are on our roadmap.',
  },
  {
    icon: LayoutDashboard,
    title: 'Business Dashboard',
    description:
      'See every call, lead, booking, and transcript in one clean dashboard. Your entire call history at a glance.',
  },
  {
    icon: Users,
    title: 'Lead Capture',
    description:
      'Every caller becomes a lead. Name, phone, email, service request, and intent recorded on every call.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            Everything You Need
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            One platform to handle every call
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Pivot AI comes fully loaded with every tool your business needs to
            capture leads, book appointments, and serve customers around the clock.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="group border-slate-200 hover:border-amber-300 transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                    <Icon className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-semibold text-navy-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
