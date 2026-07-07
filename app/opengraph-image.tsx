import { ImageResponse } from 'next/og'
import { MARK_ON_DARK_SVG, toDataUri } from '@/lib/brand-mark'

// Open Graph image — rendered to PNG at build time so it actually works on
// social scrapers (Facebook, LinkedIn, iMessage, Slack, etc.).
export const alt = 'Pivot AI — the 24/7 AI receptionist for local businesses'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0E1B2C 0%, #132C55 100%)',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: mark + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={toDataUri(MARK_ON_DARK_SVG)} width={96} height={96} alt="" />
          <div style={{ display: 'flex', marginLeft: 24, fontSize: 52, fontWeight: 700, letterSpacing: -1 }}>
            <span style={{ color: '#FFFFFF' }}>Pivot</span>
            <span style={{ color: '#F59E0B' }}>&nbsp;AI</span>
          </div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 82, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.05, letterSpacing: -2 }}>
            Never miss another
          </div>
          <div style={{ fontSize: 82, fontWeight: 800, color: '#F59E0B', lineHeight: 1.05, letterSpacing: -2 }}>
            customer call.
          </div>
          <div style={{ fontSize: 32, color: '#AAC2DD', marginTop: 28, maxWidth: 900, lineHeight: 1.35 }}>
            A 24/7 AI receptionist that answers calls, captures leads, and books appointments — for local service businesses.
          </div>
        </div>

        {/* Bottom: domain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 30, fontWeight: 600, color: '#FFFFFF' }}>pivotcalls.co</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#7A9ECB' }}>
            24/7 · Multilingual · Books to your calendar
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
