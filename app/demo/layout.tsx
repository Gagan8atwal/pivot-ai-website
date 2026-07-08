import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Request a Free Demo',
  description:
    'See Pivot AI answer a real call for your business. Founder-led setup, 14-day free trial, no credit card required.',
  openGraph: {
    title: 'Request a Free Demo | Pivot AI',
    description:
      'See Pivot AI answer a real call for your business. Founder-led setup, 14-day free trial, no credit card required.',
  },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
