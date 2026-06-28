'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Industries', href: '/#industries' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Pivot AI home">
          <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm group-hover:bg-amber-400 transition-colors">
            <Phone className="h-4 w-4 text-navy-900" aria-hidden="true" />
          </div>
          <span
            className={cn(
              'text-xl font-bold tracking-tight transition-colors',
              scrolled ? 'text-navy-900' : 'text-white'
            )}
          >
            Pivot AI
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-amber-500',
                scrolled ? 'text-slate-600' : 'text-white/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/contact">
            <Button
              variant={scrolled ? 'ghost' : 'outline'}
              size="sm"
              className={cn(!scrolled && 'text-white border-white/40 hover:bg-white/10')}
            >
              Contact
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="amber" size="sm">
              Get a Demo
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={cn(
            'md:hidden p-2 rounded-lg transition-colors',
            scrolled ? 'text-navy-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          )}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 bg-white border-b border-slate-200',
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 pb-2 flex flex-col gap-2">
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              <Button variant="outline-navy" size="sm" className="w-full">Contact</Button>
            </Link>
            <Link href="/demo" onClick={() => setMobileOpen(false)}>
              <Button variant="amber" size="sm" className="w-full">Get a Demo</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
