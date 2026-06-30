import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Pivot AI home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-sm">
            <Phone className="h-4 w-4 text-navy-900" />
          </div>
          <span className="text-lg font-bold text-navy-900">Pivot AI</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
