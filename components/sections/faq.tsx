import { Accordion } from '@/components/ui/accordion'
import Link from 'next/link'

const faqItems = [
  {
    question: 'How long does setup take?',
    answer:
      'We work to get your business live as quickly as possible. You fill out a brief onboarding form with your business details, services, hours, and FAQs. Our founding team configures your AI receptionist and works with you to ensure it is ready to answer calls.',
  },
  {
    question: 'Will it work with my existing phone number?',
    answer:
      'Call routing options depend on your current phone provider and approved production configuration. During pilot onboarding, we review the safest forwarding or number setup for your business before activation.',
  },
  {
    question: 'Can callers tell it\'s an AI?',
    answer:
      'Pivot AI uses a natural conversational voice and should be presented truthfully as a virtual assistant. Voice quality can vary by phone connection, caller speech and provider conditions, so pilot testing is completed before launch.',
  },
  {
    question: 'What if the AI gives wrong information about my business?',
    answer:
      'Pivot AI is configured from the business information you review during onboarding. When a question is outside the approved information, the assistant should avoid inventing an answer and offer follow-up. You remain responsible for reviewing business details, prices and policies before activation.',
  },
  {
    question: 'How is Pivot AI different from a traditional answering service?',
    answer:
      'Pivot AI is designed to answer routine questions, capture leads, record appointment requests and support follow-up workflows around the clock. Available integrations and automation depend on the approved pilot configuration and are verified before activation.',
  },
  {
    question: 'I\'m a solo operator with low call volume — is Pivot AI right for me?',
    answer:
      'The Starter plan is intended for solo operators and lower call volume. Request a pilot demo so we can review your missed-call pattern, confirm current availability and determine whether the expected recovered revenue justifies the monthly cost.',
  },
  {
    question: 'What if I want to transfer a caller to a live person?',
    answer:
      'Transfer behavior can be configured for approved destinations and scenarios. It must be tested with your phone setup because carrier, availability and provider conditions can affect whether a live transfer completes.',
  },
  {
    question: 'What happens after hours?',
    answer:
      'When the pilot is configured for after-hours coverage, Pivot AI can answer eligible calls, capture caller details and record requests for review. Exact behavior follows the business hours, fallback rules and workflows approved during onboarding.',
  },
  {
    question: 'Is my customer data secure?',
    answer:
      'Pivot AI uses access controls and encryption-supported services, but production use is approved only after the applicable security, privacy and retention settings are reviewed. Contractual or regulatory commitments are provided only in the governing service terms.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'Pilot, billing and cancellation terms are confirmed before activation. Requesting a demo does not start a subscription or charge a card. Review the applicable order and service terms before activating a paid plan.',
  },
  {
    question: 'Can I customize what the AI says?',
    answer:
      'The greeting, tone, fallback phrases and approved business knowledge can be configured. Customer-facing prices, policies and other high-risk details should be reviewed and tested before they are used in live calls.',
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
