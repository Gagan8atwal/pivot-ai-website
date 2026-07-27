import type { Metadata } from 'next'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Pivot AI Terms of Service — terms governing approved use of the platform and early-access pilots.',
}

export default function TermsPage() {
  const lastUpdated = 'July 27, 2026'

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
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="text-xl font-bold text-navy-900 mb-2">Early-access notice</h2>
              <p>
                Pivot AI is currently offered through founder-assisted pilots. A contact or demo
                submission is only a request for review. It does not create an account, activate a
                phone number, begin a subscription, or authorize a charge. A paid or live pilot may
                require a separate order, onboarding approval, provider setup, or service agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">1. Acceptance and Scope</h2>
              <p>
                These Terms govern approved access to Pivot AI (&ldquo;Service&rdquo;), operated by AL
                Logistics LLC (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;). By using an
                activated account or pilot, you agree to these Terms and any applicable order,
                onboarding record, or written service terms.
              </p>
              <p className="mt-3">
                Website browsing and submitting a demo request do not by themselves create a paid
                customer relationship. Where another signed agreement conflicts with these Terms,
                the signed agreement controls for that customer and scope.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">2. Description of Service</h2>
              <p>
                Pivot AI is an early-access AI customer-operations service designed to support
                configured phone-receptionist, lead-capture, appointment-request, notification,
                dashboard, and business-knowledge workflows.
              </p>
              <p className="mt-3">
                Features are enabled selectively and may depend on the customer&apos;s plan, business
                information, phone carrier, messaging registration, third-party authorization,
                provider availability, and successful testing. A displayed feature is not a promise
                that it is enabled or suitable for every account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">3. Accounts, Access, and Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old and authorized to act for the participating business.</li>
                <li>Access may be invite-only or founder-assisted during early access.</li>
                <li>You must provide accurate business, contact, billing, routing, and consent information.</li>
                <li>You are responsible for protecting credentials, sessions, devices, and authorized-user access.</li>
                <li>You must promptly report suspected unauthorized access or incorrect tenant membership.</li>
                <li>You may not use another business&apos;s tenant, data, phone number, or provider authorization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">4. Configuration and Customer Responsibilities</h2>
              <p>You are responsible for reviewing and approving information used by your receptionist, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>business name, hours, services, locations, contact details, and escalation paths;</li>
                <li>prices, guarantees, availability, regulated claims, and cancellation policies;</li>
                <li>call-recording notices, communications consent, and legally required disclosures;</li>
                <li>phone forwarding, transfer destinations, calendars, team roles, and notification recipients;</li>
                <li>imported website content and proposed configuration changes before they are applied.</li>
              </ul>
              <p className="mt-3">
                Reviewed or accepted imported information is not necessarily live. Proposal, approval,
                application, verification, and undo are separate states. Do not assume a change is in
                use until the Service shows it as applied and, where applicable, verified.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">5. AI and Service Limitations</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI output may be incomplete, delayed, misunderstood, or incorrect.</li>
                <li>Calls may fail because of carriers, networks, providers, configuration, software, or caller conditions.</li>
                <li>Captured appointment times are requests until an authorized person or verified workflow confirms them.</li>
                <li>Transcripts, names, email addresses, phone numbers, and spelled characters may contain errors.</li>
                <li>Transfers and notifications can fail or arrive late and require fallback procedures.</li>
                <li>The Service is not an emergency service and must not be used to contact 911 or other emergency responders.</li>
                <li>The Service is not a substitute for medical, legal, financial, safety, or other licensed professional judgment.</li>
              </ul>
              <p className="mt-3">
                You must maintain reasonable human review and backup procedures for urgent, high-risk,
                regulated, safety-sensitive, pricing, booking, and customer-commitment workflows.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">6. Acceptable Use</h2>
              <p>You may not use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>violate applicable law, regulation, court order, carrier rule, or provider policy;</li>
                <li>send spam, deceptive messages, or communications without required consent;</li>
                <li>fraudulently impersonate a person or business or conceal the use of a virtual assistant where disclosure is required;</li>
                <li>collect, upload, or disclose information without appropriate authority;</li>
                <li>process prohibited, highly sensitive, or regulated information without written approval and suitable controls;</li>
                <li>harass, threaten, discriminate, defraud, or facilitate illegal or dangerous activity;</li>
                <li>probe, bypass, disable, or interfere with authentication, tenant isolation, rate limits, audit controls, or security;</li>
                <li>reverse engineer or exploit the Service except where applicable law expressly permits it;</li>
                <li>use the Service for emergency dispatch, autonomous high-impact decisions, or decisions requiring licensed professional judgment.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">7. Communications and Telecommunications</h2>
              <p>
                Calling, recording, transcription, SMS, and email requirements vary by jurisdiction,
                sender type, message purpose, and recipient relationship. You are responsible for your
                use case, notices, approved content, recipient lists, and legally required consent. We
                are responsible for operating the configured platform controls described in the applicable pilot or order.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>SMS may be used only when the required consent and provider configuration are present.</li>
                <li>Do not upload or message purchased, scraped, or otherwise unauthorized contact lists.</li>
                <li>Honor opt-out and suppression signals and do not attempt to bypass provider block lists.</li>
                <li>Comply with applicable calling, recording, texting, email, A2P 10DLC, carrier, and provider requirements.</li>
                <li>Do not represent an appointment request as confirmed unless an authorized or verified workflow confirmed it.</li>
              </ul>
              <p className="mt-3">
                Messaging and opt-out behavior depends on the sender and Twilio configuration. The
                Service does not promise that custom STOP, HELP, verbal-consent, or suppression workflows
                are enabled unless they have been specifically configured and tested.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">8. Fees, Billing, and Taxes</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submitting a contact or demo form does not start billing or charge a payment method.</li>
                <li>Paid fees, included usage, overages, billing period, taxes, and renewal terms are stated in the applicable checkout, order, or service agreement.</li>
                <li>Provider, carrier, phone-number, messaging, usage, or third-party charges may apply where disclosed.</li>
                <li>You authorize charges only when you separately complete the applicable paid activation process.</li>
                <li>Failed or disputed payments may result in restricted or suspended service after reasonable notice where practicable.</li>
              </ul>
              <p className="mt-3">
                Pivot AI does not currently offer a generally available 14-day self-service free trial
                under these Terms. Any pilot credit, evaluation period, refund, or cancellation arrangement
                must be stated in the applicable order or written confirmation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">9. Cancellation and Suspension</h2>
              <p>
                Unless a separate agreement provides another method, request cancellation by emailing{' '}
                <a href="mailto:hello@pivotcalls.co" className="text-amber-600 hover:underline">
                  hello@pivotcalls.co
                </a>
                . A dashboard cancellation control is available only if it is shown and operational for
                your account. The effective date, final charges, data handling, number disposition, and
                provider obligations follow the applicable order, billing terms, and law.
              </p>
              <p className="mt-3">
                We may restrict or suspend access to protect users, providers, systems, tenant data, or
                legal compliance, including for abuse, security risk, nonpayment, provider suspension,
                invalid configuration, or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">10. Third-Party Services</h2>
              <p>
                The Service relies on third-party providers that may include Twilio, OpenAI, Supabase,
                Resend, Stripe, Google, Render, and Vercel. Their availability, rules, pricing, data
                practices, and terms are outside our complete control. Provider changes or outages may
                limit a feature or require reconfiguration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">11. Intellectual Property and Data</h2>
              <p>
                As between you and the Company, the Company owns its software, workflows, designs,
                documentation, and other original Service materials, excluding third-party software,
                models, services, and content. No ownership of a third-party AI model is claimed by these Terms.
              </p>
              <p className="mt-3">
                As between you and the Company, you retain your rights in business content and customer
                information you lawfully provide. You authorize us and our service providers to process
                that information as reasonably necessary to provide, secure, support, troubleshoot, and
                comply with law for the Service.
              </p>
              <p className="mt-3">
                You represent that you have the rights and authority needed for content, contacts,
                recordings, instructions, and data supplied to the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">12. Privacy</h2>
              <p>
                Our{' '}
                <a href="/privacy" className="text-amber-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                describes current information practices. Business customers remain responsible for
                providing any notices and obtaining any permissions required for their callers,
                contacts, employees, and end users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">13. Confidentiality</h2>
              <p>
                Each party should use reasonable care to protect nonpublic business, security, technical,
                and customer information received from the other and use it only for the approved Service
                relationship, except where disclosure is authorized or legally required.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">14. Disclaimer of Warranties</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND
                &ldquo;AS AVAILABLE.&rdquo; WE DISCLAIM IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, COMPLETELY SECURE, OR THAT AI OUTPUT,
                TRANSCRIPTS, CAPTURED DATA, TRANSFERS, NOTIFICATIONS, OR APPOINTMENT REQUESTS WILL BE ACCURATE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">15. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY WILL NOT BE LIABLE FOR INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS,
                REVENUE, DATA, GOODWILL, OR BUSINESS OPPORTUNITIES ARISING FROM THE SERVICE.
              </p>
              <p className="mt-3">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY&apos;S AGGREGATE LIABILITY ARISING
                FROM THE SERVICE WILL NOT EXCEED THE AMOUNT PAID BY YOU TO THE COMPANY FOR THE AFFECTED
                SERVICE DURING THE THREE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM. THIS LIMITATION
                DOES NOT APPLY WHERE APPLICABLE LAW DOES NOT ALLOW IT.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">16. Indemnification</h2>
              <p>
                To the extent permitted by law, you agree to defend, indemnify, and hold harmless the
                Company and its personnel from third-party claims arising from your content, contact
                lists, instructions, unlawful communications, lack of required consent, misuse of the
                Service, or violation of these Terms or third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">17. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of California, without regard to its
                conflict-of-law rules. Subject to any enforceable written dispute provision, disputes
                will be brought in courts with jurisdiction in Fresno County, California.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">18. Changes to Terms</h2>
              <p>
                We may update these Terms as the Service changes. We will post revised Terms and update
                the date above. Material changes will take effect as stated in the notice or as otherwise
                permitted by applicable law. Continued use after the effective date may constitute acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">19. Contact</h2>
              <address className="not-italic">
                <strong>Pivot AI · AL Logistics LLC</strong><br />
                Fresno, California<br />
                <a href="mailto:hello@pivotcalls.co" className="text-amber-600 hover:underline">
                  hello@pivotcalls.co
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
