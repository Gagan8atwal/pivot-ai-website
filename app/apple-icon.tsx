import { ImageResponse } from 'next/og'
import { MARK_SVG, toDataUri } from '@/lib/brand-mark'

// Apple touch icon — rendered to a 180×180 PNG (Apple requires raster).
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E1B2C',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={toDataUri(MARK_SVG)} width={132} height={132} alt="" />
      </div>
    ),
    { ...size }
  )
}
