import type { MetadataRoute } from 'next'

// PWA web app manifest (Next.js file convention → /manifest.webmanifest).
// Icons are generated from public/icons/app-icon.svg (see scripts/gen-brand-rasters.js).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pivot AI — AI Receptionist',
    short_name: 'Pivot AI',
    description:
      'Pivot AI answers calls 24/7, captures leads, and books appointments for local service businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e1b2c',
    theme_color: '#0e1b2c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
