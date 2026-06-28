import { Accordion } from '@/components/ui/accordion'
import Link from 'next/link'

const faqItems = [
  {
    question: 'How long does setup take?',
    answer:
      'Most businesses are live within 24 hours. You fill out a brief onboarding form with your business details, services, hours, and FAQs. We configure your AI receptionist and hand it back to you fully tested and ready to answer calls.',
  },
  {
    question: 'Will it work with my existing phone number?',
    answer:
      'Yes. We use Twilio to route calls from your existing number to Pivot AI. Your customers dial the same number they always have — nothing changes on their end. No number porting or changes required.',
  },
  {
    question: 'Can callers tell it\'s an AI?',
    answer:
      "Our AI uses Google's most advanced voice technology, which sounds natural and professional. Most callers assume they're speaking with a human receptionist. The AI identifies itself as your 'virtual assistant' if a caller asks directly.",
  },
  {
    question: 'What if I want to transfer a caller to a live person?',
    answer:
      'Pivot AI can be configured to transfer calls to you, a team member, or another number at any point in the conversation — based on intent, urgency, or caller request.',
  },
  {
    question: 'What happens after hours?',
    answer:
      'Your AI receptionist works 24/7 — nights, weekends, and holidays. Every after-hours call is answered, every lead is captured, and every appointment request is logged. You wake up to a full summary of overnight activity.',
  },
  {
    question: 'Is my customer data secure?',
    answer:
      'Yes. All data is encrypted in transit and at rest using industry-standard security. We comply with relevant data protection regulations and never sell or share your customer data with third parties.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'Cancel anytime with no penalty or cancellation fee. We operate month-to-month on all plans. Your 14-day free trial requires no credit card — you only enter billing information if you decide to continue.',
  },
  {
    question: 'Can I customize what the AI says?',
    answer:
      'Absolutely. The greeting, tone, fallback phrases, and knowledge base are all customizable. We work with you to make the AI sound exactly like your business — including your pricing, services, and common scenarios.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-5 text-balance">
              Common questions
            </h2>
            <p className="text-lg text-slate-500">
              Everything you need to know about getting started with Pivot AI.
            </p>
          </div>

          {/* Accordion */}
          <Accordion items={faqItems} />

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <p className="text-slate-500">
              Still have questions?{' '}
              <Link
                href="/contact"
                className="text-navy-900 font-semibold hover:text-amber-600 transition-colors underline underline-offset-4"
              >
                Talk to our team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
