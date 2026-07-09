import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Request Demo', href: '/demo' },
]

const industryLinks = [
  { label: 'HVAC', href: '/industries/hvac' },
  { label: 'Plumbing', href: '/industries/plumbing' },
  { label: 'Electrical', href: '/industries/electrical' },
  { label: 'Roofing', href: '/industries/roofing' },
  { label: 'Landscaping', href: '/industries/landscaping' },
  { label: 'Dental', href: '/industries/dental' },
  { label: 'Medical', href: '/industries/medical' },
  { label: 'Chiropractic', href: '/industries/chiropractic' },
  { label: 'Law Firms', href: '/industries/law-firm' },
  { label: 'Insurance', href: '/industries/insurance' },
  { label: 'Real Estate', href: '/industries/real-estate' },
  { label: 'Auto Repair', href: '/industries/automotive' },
  { label: 'Restaurants', href: '/industries/restaurants' },
  { label: 'Home Services', href: '/industries/home-services' },
  { label: 'Trucking', href: '/industries/trucking' },
]

const companyLinks = [
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      {/* Main footer */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-navy-900" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold">Pivot AI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered phone receptionist for local service businesses.
              Answer calls 24/7, capture leads, and book appointments.
            </p>
            <div className="mt-6 space-y-2">
              <a
                href="mailto:hello@pivotcalls.co"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                hello@pivotcalls.co
              </a>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Fresno, California
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries links — 2-column sub-grid */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Industries
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {industryLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company links row */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6">
            {companyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* A2P Compliance bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <p className="text-xs text-slate-500 leading-relaxed max-w-4xl">
            <strong className="text-slate-400">SMS Consent &amp; Opt-Out:</strong>{' '}
            By providing your phone number and requesting a demo, you agree to receive text
            messages from Pivot AI related to your inquiry. Message frequency varies. Message
            and data rates may apply. Reply <strong className="text-slate-400">STOP</strong> to
            opt out at any time. Reply <strong className="text-slate-400">HELP</strong> for
            help. Your mobile information will not be shared with third parties or affiliates
            for marketing or promotional purposes. For more information, see our{' '}
            <Link href="/privacy" className="underline hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="underline hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Pivot AI · AL Logistics LLC · All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
