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
      'Answers configured call scenarios in your business name using the approved greeting, hours, fallback rules and knowledge reviewed during pilot setup.',
  },
  {
    icon: MessageSquare,
    title: 'Missed Call Recovery',
    description:
      'Supports configured missed-call follow-up workflows when messaging, consent and carrier requirements are enabled for the pilot.',
  },
  {
    icon: Calendar,
    title: 'Appointment Requests',
    description:
      'Collects caller details, service needs and preferred times so your team can review, confirm, complete or cancel the resulting request.',
  },
  {
    icon: RefreshCw,
    title: 'Google Calendar Integration',
    description:
      'Can synchronize approved appointment workflows with Google Calendar after account authorization and protected real-account validation.',
  },
  {
    icon: Smartphone,
    title: 'SMS Notifications',
    description:
      'Sends configured text notifications only when the relevant messaging, consent, recipient and carrier requirements are enabled.',
  },
  {
    icon: Mail,
    title: 'Email Notifications',
    description:
      'Supports configured owner and customer email notifications with delivery evidence and recoverable failure handling.',
  },
  {
    icon: GitFork,
    title: 'Call Routing',
    description:
      'Supports approved routing and transfer scenarios subject to destination availability, carrier behavior and live pilot testing.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description:
      'Uses reviewed business information for common questions and should fall back rather than invent unsupported prices, policies or answers.',
  },
  {
    icon: Mic,
    title: 'Conversational Voice',
    description:
      'Provides a configurable virtual-assistant voice. Quality can vary by phone connection, caller speech and provider conditions.',
  },
  {
    icon: Globe,
    title: 'English-Language Pilot',
    description:
      'Current production validation is focused on English call handling. Additional language support requires separate quality testing.',
  },
  {
    icon: LayoutDashboard,
    title: 'Business Dashboard',
    description:
      'Provides tenant-scoped views of available calls, leads, appointment requests, messages and operational evidence for review.',
  },
  {
    icon: Users,
    title: 'Lead Capture',
    description:
      'Captures available caller details and service intent when the conversation provides them; incomplete information remains visibly incomplete.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
            Pilot Capabilities
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
            Configured around your approved call workflow
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Capabilities are enabled and validated by pilot configuration. Availability depends on
            the selected plan, provider setup and the workflows approved before activation.
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
