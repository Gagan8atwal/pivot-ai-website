import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Pivot AI Privacy Policy — how we collect, use, disclose, retain, and protect information.',
}

export default function PrivacyPage() {
  const lastUpdated = 'July 27, 2026'

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
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-xl font-bold text-navy-900 mb-2">Early-access notice</h2>
                <p>
                  Pivot AI is currently offered through founder-assisted pilots. Requesting a demo
                  does not create a customer account, activate phone service, begin a subscription,
                  or charge a payment method. The data practices that apply to an activated pilot may
                  also be described in a separate order, onboarding record, or service agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">1. Introduction</h2>
                <p>
                  Pivot AI (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), operated by AL
                  Logistics LLC, provides this Privacy Policy to explain how we collect, use,
                  disclose, retain, and protect information when you visit{' '}
                  <a href="https://pivotcalls.co" className="text-amber-600 hover:underline">
                    pivotcalls.co
                  </a>{' '}
                  or participate in an activated Pivot AI pilot.
                </p>
                <p className="mt-3">
                  This policy describes current categories and intended practices. A feature described
                  here may not be enabled for every pilot, phone number, sender, provider, or account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">2.1 Website and intake information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name, email address, phone number, business details, and message content you submit</li>
                  <li>Demo preferences, requested contact time, and optional SMS-consent selection</li>
                  <li>Submission identifiers, form timing, IP address, user agent, and limited anti-abuse evidence</li>
                  <li>Delivery and failure records for configured transactional email or calendar side effects</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-2 mt-4">2.2 Activated receptionist information</h3>
                <p>Depending on the pilot configuration and provider support, the Service may process:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Inbound and outbound phone-number metadata, call identifiers, timing, and call status</li>
                  <li>Audio, recordings, transcripts, summaries, or conversation events when enabled</li>
                  <li>Caller-provided contact information, service needs, and preferred appointment times</li>
                  <li>Appointment requests and later owner disposition such as confirmed, completed, or cancelled</li>
                  <li>Messaging consent, opt-out, delivery, and provider-status evidence when configured</li>
                  <li>Business settings, approved knowledge, team membership, and operational audit records</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-2 mt-4">2.3 Account and billing information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Account identifiers, authentication events, roles, and tenant membership</li>
                  <li>Plan, subscription, invoice, and payment status if paid billing is activated</li>
                  <li>Payment-card details are handled by Stripe; we do not intend to store complete card numbers</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-2 mt-4">2.4 Device and website information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address, browser type, device information, referring URL, and requested pages</li>
                  <li>Essential session, security, and preference cookies</li>
                  <li>Analytics information only when an analytics service is enabled</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">3. How We Use Information</h2>
                <p>We may use collected information to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Respond to contact and demo requests</li>
                  <li>Configure, test, operate, support, and secure an approved pilot</li>
                  <li>Route calls, capture available lead details, and record appointment requests</li>
                  <li>Deliver configured email, SMS, calendar, or owner notifications</li>
                  <li>Authenticate users and enforce tenant, role, and owner access boundaries</li>
                  <li>Detect duplicate submissions, abuse, operational failures, and security events</li>
                  <li>Process billing if a paid subscription is separately activated</li>
                  <li>Comply with applicable legal obligations and enforce service terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">4. SMS and Messaging</h2>
                <p>
                  SMS is not automatically enabled by submitting a demo request. When messaging is
                  configured, messages should be sent only for the disclosed purpose and only when
                  the required consent evidence and provider configuration are present.
                </p>
                <p className="mt-3">
                  The public demo form records affirmative written consent only when the optional SMS
                  checkbox is selected. We do not represent in this policy that recorded verbal consent,
                  custom STOP/HELP processing, or every messaging workflow is currently enabled.
                </p>
                <p className="mt-3">
                  Supported opt-out behavior depends on the sender type and Twilio Messaging Service
                  configuration. Follow the instructions in the message, including replying STOP where
                  offered. Message and data rates may apply. For assistance, use the instructions in the
                  message or email{' '}
                  <a href="mailto:hello@pivotcalls.co" className="text-amber-600 hover:underline">
                    hello@pivotcalls.co
                  </a>
                  .
                </p>
                <p className="mt-3">
                  Mobile information is not sold or shared with third parties or affiliates for their
                  own marketing or promotional purposes. It may be processed by service providers to
                  deliver and secure the requested messaging service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">5. How We Disclose Information</h2>
                <p>We may disclose information to:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>
                    <strong>Business customers:</strong> Information associated with a configured
                    receptionist may be made available to the business whose number or workflow the
                    caller used, subject to tenant and role controls.
                  </li>
                  <li>
                    <strong>Service providers:</strong> Depending on enabled features, providers may
                    include Twilio, OpenAI, Supabase, Resend, Stripe, Google, Render, and Vercel. They
                    process information under their own terms and privacy practices to provide hosting,
                    communications, AI processing, authentication, storage, email, payments, or calendar services.
                  </li>
                  <li>
                    <strong>Professional advisers and transaction participants:</strong> Where reasonably
                    necessary for legal, security, accounting, insurance, financing, or business transactions.
                  </li>
                  <li>
                    <strong>Legal and safety purposes:</strong> When required by law, valid legal process,
                    or reasonably necessary to protect rights, safety, systems, or users.
                  </li>
                </ul>
                <p className="mt-3">We do not sell personal information for money.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">6. Data Retention</h2>
                <p>
                  Retention varies by record type, pilot configuration, provider, operational need,
                  contractual requirement, and applicable law. We do not currently promise an automatic
                  &ldquo;active subscription plus 90 days&rdquo; deletion schedule for all call, transcript,
                  lead, consent, or operational records.
                </p>
                <p className="mt-3">
                  We aim to retain information only for as long as reasonably necessary for the purposes
                  described in this policy, including service delivery, security, troubleshooting,
                  dispute resolution, legal compliance, and enforcement. Provider copies, backups, logs,
                  legal holds, and de-identified records may follow different schedules.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">7. Security</h2>
                <p>
                  We use measures intended to reduce risk, such as HTTPS/TLS for website traffic,
                  authentication, access controls, tenant-scoped authorization, restricted service
                  credentials, and provider-managed infrastructure where configured. Controls can vary
                  by environment and feature, and no transmission or storage system is guaranteed secure.
                </p>
                <p className="mt-3">
                  This policy does not represent that Pivot AI has completed an independent security
                  certification, compliance audit, or recurring review program.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">8. Privacy Requests and Choices</h2>
                <p>
                  Depending on where you live and the circumstances, you may have rights to request
                  access, correction, deletion, or information about certain processing. You may also
                  withdraw consent or object to certain uses where applicable.
                </p>
                <p className="mt-3">
                  Submit a request to{' '}
                  <a href="mailto:hello@pivotcalls.co" className="text-amber-600 hover:underline">
                    hello@pivotcalls.co
                  </a>
                  . We may need to verify your identity and authority before acting. Requests may be
                  limited or denied where an exception applies, where records belong to a business
                  customer, or where retention is required for security, legal, contractual, or operational reasons.
                </p>
                <p className="mt-3">
                  We do not currently represent that every request can be completed through a self-service
                  export or deletion control in the dashboard.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">9. Cookies and Analytics</h2>
                <p>
                  We may use essential cookies for authentication, security, sessions, and preferences.
                  Analytics or similar technologies may be used only when configured. Browser settings
                  can limit cookies, but some account or application functions may then be unavailable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">10. Children</h2>
                <p>
                  Pivot AI is a business service and is not directed to children. Do not intentionally
                  submit personal information about a child through a demo, contact, or pilot workflow
                  unless you have appropriate authority and the use has been separately approved.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy as our service and practices change. We will post the
                  revised policy and update the date above. Additional notice may be provided where required.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">12. Contact</h2>
                <p>For questions or privacy requests, contact:</p>
                <address className="mt-3 not-italic">
                  <strong>Pivot AI · AL Logistics LLC</strong><br />
                  Fresno, California<br />
                  <a href="mailto:hello@pivotcalls.co" className="text-amber-600 hover:underline">
                    hello@pivotcalls.co
                  </a>
                </address>
              </section>

              <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm">
                <p>
                  This policy is intended to describe Pivot AI&apos;s current practices and is not a
                  substitute for legal advice. Business customers remain responsible for their own
                  notices, consents, call-recording rules, communications compliance, and use of caller data.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
