import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Pivot AI Terms of Service — the terms governing your use of our platform.',
}

export default function TermsPage() {
  const lastUpdated = 'June 27, 2026'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        <div className="bg-navy-900 py-14 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-14">
          <div className="max-w-3xl mx-auto space-y-10 text-slate-700 leading-relaxed">

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Pivot AI (&ldquo;Service&rdquo;), operated by AL Logistics LLC
                (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), you agree to be bound by these Terms of Service.
                If you do not agree to all terms, you may not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">2. Description of Service</h2>
              <p>
                Pivot AI provides an AI-powered phone receptionist service for local
                service businesses. The Service includes: AI call answering, lead capture,
                appointment booking, SMS and email notifications, and related dashboard tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">3. Accounts and Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old and a legal business entity to use the Service.</li>
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You agree to provide accurate and complete information during registration.</li>
                <li>One account per business. Sharing accounts between unrelated businesses is prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">4. Acceptable Use</h2>
              <p>You agree not to use Pivot AI to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Engage in illegal activities or violate any applicable laws or regulations</li>
                <li>Send unsolicited messages (spam) to any party</li>
                <li>Collect information without proper consent as required by applicable law</li>
                <li>Impersonate any person or entity fraudulently</li>
                <li>Transmit harmful, defamatory, obscene, or otherwise objectionable content</li>
                <li>Violate the TCPA, CAN-SPAM Act, or other applicable communications laws</li>
                <li>Use the Service in any manner that disrupts, damages, or impairs it</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">5. SMS and Telecommunications Compliance</h2>
              <p>
                You are solely responsible for ensuring that any SMS messages sent through
                Pivot AI comply with all applicable telecommunications laws, including but
                not limited to the Telephone Consumer Protection Act (TCPA), the CAN-SPAM
                Act, and Twilio&apos;s Messaging Policy.
              </p>
              <p className="mt-3">Specifically, you represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>
                  You have obtained all legally required consents before sending any SMS
                  messages to callers through the Service.
                </li>
                <li>
                  You will honor all opt-out requests (STOP replies) immediately and maintain
                  a do-not-contact list.
                </li>
                <li>
                  You will not use the Service for high-risk communications categories
                  including but not limited to: debt collection, SHAFT content, illegal
                  substances, or other prohibited categories as defined by Twilio.
                </li>
                <li>
                  All calling and texting activity complies with A2P 10DLC requirements
                  where applicable.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">6. Fees and Payment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscriptions are billed monthly in advance.</li>
                <li>All fees are listed in USD and are non-refundable except as required by law.</li>
                <li>We reserve the right to change pricing with 30 days&apos; notice.</li>
                <li>Failed payments may result in service suspension after reasonable notice.</li>
                <li>Your 14-day free trial requires no payment information and will not auto-charge.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">7. Cancellation</h2>
              <p>
                You may cancel your subscription at any time through your account dashboard
                or by contacting us at{' '}
                <a href="mailto:hello@pivotai.app" className="text-amber-600 hover:underline">
                  hello@pivotai.app
                </a>
                . Cancellation takes effect at the end of your current billing period.
                We do not charge cancellation fees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">8. Intellectual Property</h2>
              <p>
                The Service, including its software, AI models, design, and documentation,
                is owned by AL Logistics LLC and protected by intellectual property laws.
                You receive a limited, non-exclusive, non-transferable license to use the
                Service as described herein.
              </p>
              <p className="mt-3">
                You retain ownership of your business data, call transcripts, and customer
                information. You grant us a limited license to process this data solely to
                provide the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">9. Privacy and Data</h2>
              <p>
                Your use of the Service is also governed by our{' '}
                <a href="/privacy" className="text-amber-600 hover:underline">
                  Privacy Policy
                </a>
                , which is incorporated into these Terms by reference.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">10. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES
                OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
                MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR
                COMPLETELY SECURE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">11. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AL LOGISTICS LLC SHALL NOT BE
                LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                DAMAGES, INCLUDING LOST PROFITS, ARISING FROM YOUR USE OF THE SERVICE.
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU IN THE
                THREE MONTHS PRECEDING THE CLAIM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">12. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless AL Logistics LLC, its officers,
                directors, employees, and agents from any claims, damages, or expenses
                arising from your use of the Service, your violation of these Terms, or
                your violation of any applicable law or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">13. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of California, without
                regard to conflict of law provisions. Disputes shall be resolved in the
                courts of Fresno County, California.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide at
                least 14 days&apos; notice of material changes via email or in-app notification.
                Continued use of the Service after changes constitutes acceptance of the
                updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">15. Contact</h2>
              <address className="not-italic">
                <strong>Pivot AI · AL Logistics LLC</strong><br />
                Fresno, California<br />
                <a href="mailto:hello@pivotai.app" className="text-amber-600 hover:underline">
                  hello@pivotai.app
                </a>
              </address>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
