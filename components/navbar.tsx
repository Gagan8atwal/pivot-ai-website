'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
]

const industryGroups = [
  {
    group: 'Trade Services',
    items: [
      { label: 'HVAC', href: '/industries/hvac' },
      { label: 'Plumbing', href: '/industries/plumbing' },
      { label: 'Electrical', href: '/industries/electrical' },
      { label: 'Roofing', href: '/industries/roofing' },
      { label: 'Landscaping', href: '/industries/landscaping' },
    ],
  },
  {
    group: 'Healthcare',
    items: [
      { label: 'Dental', href: '/industries/dental' },
      { label: 'Medical', href: '/industries/medical' },
      { label: 'Chiropractic', href: '/industries/chiropractic' },
    ],
  },
  {
    group: 'Local Services',
    items: [
      { label: 'Auto Repair', href: '/industries/automotive' },
      { label: 'Restaurants', href: '/industries/restaurants' },
      { label: 'Home Services', href: '/industries/home-services' },
    ],
  },
  {
    group: 'Professional',
    items: [
      { label: 'Law Firms', href: '/industries/law-firm' },
      { label: 'Insurance', href: '/industries/insurance' },
      { label: 'Real Estate', href: '/industries/real-estate' },
      { label: 'Trucking', href: '/industries/trucking' },
    ],
  },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = React.useState(false)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Detect scroll for header background
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click or Escape
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Close mobile menu + dropdown on route change
  React.useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
    setMobileIndustriesOpen(false)
  }, [pathname])

  const isIndustryPage = pathname?.startsWith('/industries')

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav
        className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
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
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-amber-500',
                scrolled ? 'text-slate-600 hover:bg-slate-50' : 'text-white/80 hover:bg-white/10'
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Industries dropdown trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className={cn(
                'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-amber-500',
                scrolled ? 'text-slate-600 hover:bg-slate-50' : 'text-white/80 hover:bg-white/10',
                isIndustryPage && (scrolled ? 'text-amber-600' : 'text-amber-400')
              )}
            >
              Industries
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  dropdownOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown panel */}
            {dropdownOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-50"
                role="menu"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Industries we serve
                  </p>
                  <Link
                    href="/#industries"
                    className="text-xs text-amber-600 font-semibold hover:text-amber-500 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    See all →
                  </Link>
                </div>

                {/* 4-column group grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {industryGroups.map(({ group, items }) => (
                    <div key={group}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {group}
                      </p>
                      <ul className="space-y-1">
                        {items.map(({ label, href }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              role="menuitem"
                              onClick={() => setDropdownOpen(false)}
                              className="block text-sm text-slate-600 hover:text-navy-900 hover:bg-amber-50 rounded-md px-2 py-1 -mx-2 transition-colors"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Footer CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href="/demo"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between w-full bg-navy-900 hover:bg-navy-800 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors group"
                  >
                    <span>Not sure which fits? Get a free demo</span>
                    <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
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
          mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
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

          {/* Mobile Industries accordion */}
          <div>
            <button
              type="button"
              onClick={() => setMobileIndustriesOpen((prev) => !prev)}
              aria-expanded={mobileIndustriesOpen}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-navy-900 rounded-lg transition-colors"
            >
              Industries
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-slate-400 transition-transform duration-200',
                  mobileIndustriesOpen && 'rotate-180'
                )}
                aria-hidden="true"
              />
            </button>
            {mobileIndustriesOpen && (
              <div className="mt-1 ml-4 pl-4 border-l-2 border-amber-200 space-y-3 pb-2">
                {industryGroups.map(({ group, items }) => (
                  <div key={group}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 mt-2">
                      {group}
                    </p>
                    {items.map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        className="block py-1.5 text-sm text-slate-600 hover:text-navy-900 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

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
