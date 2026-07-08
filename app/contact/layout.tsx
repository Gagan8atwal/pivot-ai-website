import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Pivot AI team. Questions, feedback, or need help — we respond within one business day.',
  openGraph: {
    title: 'Contact Us | Pivot AI',
    description:
      'Get in touch with the Pivot AI team. Questions, feedback, or need help — we respond within one business day.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
