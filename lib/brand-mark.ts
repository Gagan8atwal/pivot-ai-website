/**
 * lib/brand-mark.ts — the Pivot AI mark as an inline SVG string + data URI,
 * shared by the dynamically-generated icon / OG image routes (next/og).
 *
 * Two variants:
 *  - MARK_SVG:        navy rounded square + amber phone glyph (for light bg)
 *  - MARK_ON_DARK_SVG: navy square with amber outline + amber glyph (for navy bg)
 */

const GLYPH =
  'M41 43c-2.2 0-4.4-.4-6.4-1.2-.6-.2-1.4-.2-1.8.4l-3.8 4.8c-5.6-2.8-10-7.2-12.8-12.8l4.8-3.8c.6-.6.6-1.2.4-1.8-.8-2-1.2-4.2-1.2-6.4 0-1.2-.8-2-2-2H13c-1.2 0-2 .8-2 2 0 16.6 13.4 30 30 30 1.2 0 2-.8 2-2v-5c0-1.2-.8-2-2-2z'

export const MARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect width="64" height="64" rx="16" fill="#0E1B2C"/>` +
  `<path d="${GLYPH}" fill="#F59E0B"/></svg>`

export const MARK_ON_DARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<rect x="1" y="1" width="62" height="62" rx="16" fill="#0E1B2C" stroke="#F59E0B" stroke-width="2"/>` +
  `<path d="${GLYPH}" fill="#F59E0B"/></svg>`

export function toDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
