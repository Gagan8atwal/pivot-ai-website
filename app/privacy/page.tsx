import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Pivot AI Privacy Policy — how we collect, use, and protect your information.',
}

export default function PrivacyPage() {
  const lastUpdated = 'June 27, 2026'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-16">
        <div className="bg-navy-900 py-14 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="container mx-auto px-4 lg:px-8 py-14">
          <div className="max-w-3xl mx-auto prose prose-slate max-w-none">
            <div className="space-y-10 text-slate-700 leading-relaxed">

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">1. Introduction</h2>
                <p>
                  Pivot AI (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by AL
                  Logistics LLC, is committed to protecting the privacy of our customers,
                  website visitors, and call participants. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when you use our
                  website at{' '}
                  <a href="https://pivotai.app" className="text-amber-600 hover:underline">
                    pivotai.app
                  </a>{' '}
                  and our AI receptionist services.
                </p>
                <p className="mt-3">
                  By using our services, you consent to the practices described in this policy.
                  If you do not agree, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name, email address, and phone number when you request a demo or contact us</li>
                  <li>Business name, industry, and size information</li>
                  <li>Payment information (processed securely via Stripe; we do not store card numbers)</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-2 mt-4">2.2 Information Collected Through Our Service</h3>
                <p>When our AI receptionist answers calls on behalf of our business customers:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Caller phone numbers (inbound call metadata)</li>
                  <li>Call recordings and transcripts</li>
                  <li>Caller-provided information: name, phone, email, and service requests</li>
                  <li>SMS consent status and consent language</li>
                  <li>Appointment details and preferences</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-2 mt-4">2.3 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address, browser type, and device information</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Referring URLs</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Provide, maintain, and improve our AI receptionist services</li>
                  <li>Process and respond to demo requests and inquiries</li>
                  <li>Send appointment confirmations and notifications</li>
                  <li>Send service-related SMS messages where consent has been obtained</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">4. SMS Communications</h2>
                <p>
                  <strong>Consent Required:</strong> We only send SMS messages to individuals
                  who have explicitly consented to receive them. Consent is obtained either
                  through our web forms (written consent) or verbally during an AI-assisted
                  call (verbal consent, which is recorded and logged with a timestamp).
                </p>
                <p className="mt-3">
                  <strong>Opt-Out:</strong> You may opt out of SMS communications at any time
                  by replying <strong>STOP</strong> to any text message we send. You will
                  receive one final confirmation and no further messages will be sent.
                </p>
                <p className="mt-3">
                  <strong>Help:</strong> Reply <strong>HELP</strong> to any of our messages for
                  assistance, or contact us at{' '}
                  <a href="mailto:hello@pivotai.app" className="text-amber-600 hover:underline">
                    hello@pivotai.app
                  </a>
                  .
                </p>
                <p className="mt-3">
                  <strong>Message Frequency:</strong> Message frequency varies based on your
                  interactions with our service. Message and data rates may apply.
                </p>
                <p className="mt-3">
                  <strong>No Third-Party Marketing:</strong> Mobile information collected by
                  Pivot AI, including phone numbers obtained through web forms or AI calls,
                  will not be shared with third parties or affiliates for marketing or
                  promotional purposes. Information may be shared with subprocessors solely to
                  deliver the services described in this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">5. How We Share Information</h2>
                <p>We may share information with:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    <strong>Business customers:</strong> Call data, leads, and transcripts are
                    shared with the business whose number the caller dialed.
                  </li>
                  <li>
                    <strong>Service providers (subprocessors):</strong> We use the following
                    services to operate Pivot AI:
                    <ul className="list-disc pl-6 mt-1 space-y-1">
                      <li>Twilio (voice and SMS infrastructure)</li>
                      <li>OpenAI (AI conversation processing)</li>
                      <li>Supabase (secure database and authentication)</li>
                      <li>Resend (transactional email delivery)</li>
                      <li>Stripe (payment processing)</li>
                      <li>Google Calendar API (calendar integration)</li>
                      <li>Render (application hosting)</li>
                      <li>Vercel (website hosting)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Legal requirements:</strong> We may disclose information when
                    required by law or in response to valid legal process.
                  </li>
                </ul>
                <p className="mt-3">
                  We do not sell personal information to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">6. Data Retention</h2>
                <p>
                  We retain call records, transcripts, and lead data for as long as you
                  maintain an active subscription plus 90 days following cancellation. Payment
                  records are retained as required by law. You may request deletion of your
                  data at any time by contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">7. Security</h2>
                <p>
                  We implement industry-standard security measures including encryption in
                  transit (TLS) and at rest, access controls, and regular security reviews.
                  No method of transmission over the internet is 100% secure. We cannot
                  guarantee absolute security but are committed to protecting your data.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">8. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of SMS communications by replying STOP</li>
                  <li>Object to certain processing activities</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, contact us at{' '}
                  <a href="mailto:hello@pivotai.app" className="text-amber-600 hover:underline">
                    hello@pivotai.app
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">9. Cookies</h2>
                <p>
                  Our website uses essential cookies necessary for operation and analytics
                  cookies to understand how visitors use our site. We do not use advertising
                  cookies. You may disable cookies in your browser settings; some features
                  may not function properly as a result.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">10. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of
                  material changes by posting the updated policy on our website and updating
                  the &ldquo;Last updated&rdquo; date. Your continued use of our services following
                  changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">11. Contact</h2>
                <p>
                  For questions about this Privacy Policy or your data, contact us at:
                </p>
                <address className="mt-3 not-italic">
                  <strong>Pivot AI · AL Logistics LLC</strong><br />
                  Fresno, California<br />
                  <a href="mailto:hello@pivotai.app" className="text-amber-600 hover:underline">
                    hello@pivotai.app
                  </a>
                </address>
              </section>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
