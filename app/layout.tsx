import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = 'https://pivotai.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pivot AI — AI Receptionist for Local Businesses',
    template: '%s | Pivot AI',
  },
  description:
    'Pivot AI answers calls 24/7, captures leads, and books appointments. Built for local service businesses.',
  keywords: [
    'AI receptionist',
    'missed call recovery',
    'appointment booking',
    'local business',
    'HVAC',
    'plumbing',
    'restoration',
    'AI phone answering',
    'call answering service',
    'lead capture',
  ],
  authors: [{ name: 'Pivot AI', url: siteUrl }],
  creator: 'Pivot AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Pivot AI — AI Receptionist for Local Businesses',
    description:
      'Pivot AI answers calls 24/7, captures leads, and books appointments. Built for local service businesses.',
    siteName: 'Pivot AI',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Pivot AI — Never Miss Another Customer Call',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pivot AI — AI Receptionist for Local Businesses',
    description:
      'Pivot AI answers calls 24/7, captures leads, and books appointments. Built for local service businesses.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@pivotai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0e1b2c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
