/**
 * Generate raster brand assets (favicon.ico, PWA PNGs, social avatars, logo PNGs)
 * from the hand-authored SVG masters using sharp.
 *
 * Run from the repo root:  node scripts/gen-brand-rasters.js
 * Requires: sharp (dev-only; present in the local toolchain — `npm i -D sharp` if absent).
 *
 * Outputs are committed, so this only needs re-running when an SVG master changes.
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const p = (...a) => path.join(ROOT, ...a)

/** Pack PNG buffers into a multi-resolution .ico container. */
function packIco(images) {
  const count = images.length
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type = icon
  header.writeUInt16LE(count, 4)
  const dir = Buffer.alloc(16 * count)
  let offset = 6 + 16 * count
  const bodies = []
  images.forEach((img, i) => {
    const b = dir.subarray(i * 16, i * 16 + 16)
    b.writeUInt8(img.size >= 256 ? 0 : img.size, 0) // width (0 = 256)
    b.writeUInt8(img.size >= 256 ? 0 : img.size, 1) // height
    b.writeUInt8(0, 2) // palette count
    b.writeUInt8(0, 3) // reserved
    b.writeUInt16LE(1, 4) // color planes
    b.writeUInt16LE(32, 6) // bits per pixel
    b.writeUInt32LE(img.buf.length, 8) // bytes in resource
    b.writeUInt32LE(offset, 12) // offset from start of file
    offset += img.buf.length
    bodies.push(img.buf)
  })
  return Buffer.concat([header, dir, ...bodies])
}

const svgToPng = (svgPath, size) =>
  sharp(fs.readFileSync(svgPath), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

const svgToPngWidth = (svgPath, width) =>
  sharp(fs.readFileSync(svgPath), { density: 384 }).resize({ width }).png().toBuffer()

;(async () => {
  const written = []
  const write = (fp, buf) => {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    fs.writeFileSync(fp, buf)
    written.push(`${path.relative(ROOT, fp)} (${buf.length} B)`)
  }

  // favicon.ico — 16/32/48 multi-res from favicon.svg
  const favSvg = p('public/icons/favicon.svg')
  const favPngs = []
  for (const s of [16, 32, 48]) favPngs.push({ size: s, buf: await svgToPng(favSvg, s) })
  const ico = packIco(favPngs)
  write(p('app/favicon.ico'), ico) // Next.js app-dir convention
  write(p('public/favicon.ico'), ico) // classic /favicon.ico
  write(p('public/icons/favicon-32.png'), favPngs[1].buf)
  write(p('public/icons/favicon-16.png'), favPngs[0].buf)

  // PWA + apple-touch icons from app-icon.svg
  const appSvg = p('public/icons/app-icon.svg')
  write(p('public/icons/icon-192.png'), await svgToPng(appSvg, 192))
  write(p('public/icons/icon-512.png'), await svgToPng(appSvg, 512))
  write(p('public/icons/icon-maskable-512.png'), await svgToPng(appSvg, 512))
  write(p('public/icons/apple-touch-icon.png'), await svgToPng(appSvg, 180))

  // Social profile avatar
  const socialSvg = p('branding/social-profile.svg')
  write(p('branding/social-profile-400.png'), await svgToPng(socialSvg, 400))
  write(p('branding/social-profile-800.png'), await svgToPng(socialSvg, 800))

  // Logo PNGs (transparent) at retina widths
  write(p('public/logo/pivot-ai-logo.png'), await svgToPngWidth(p('branding/logo-primary.svg'), 960))
  write(
    p('public/logo/pivot-ai-logo-white.png'),
    await svgToPngWidth(p('branding/logo-primary-dark.svg'), 960)
  )
  write(p('public/logo/pivot-ai-mark.png'), await svgToPng(p('branding/logo-mark.svg'), 512))

  console.log('Generated brand rasters:\n' + written.join('\n'))
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
