import Link from 'next/link'
import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-6">
          <Phone className="h-8 w-8 text-navy-900" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">404</p>
        <h1 className="text-4xl font-bold text-navy-900 mb-4">Page not found</h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="amber" size="lg">Back to Home</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline-navy" size="lg">Contact Us</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
