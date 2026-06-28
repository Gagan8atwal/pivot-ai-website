import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Industries', href: '/#industries' },
  { label: 'Request Demo', href: '/demo' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-navy-900" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold">Pivot AI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered phone receptionist for local service businesses. 
              Answer every call, capture every lead, book every appointment — 24/7.
            </p>
            <div className="mt-6 space-y-2">
              <a
                href="mailto:hello@pivotai.app"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                hello@pivotai.app
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

          {/* Company links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
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
