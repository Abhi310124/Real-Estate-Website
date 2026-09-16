// Generates every placeholder asset that lib/data/mock.ts references but that does not exist
// on disk. The path list is PARSED FROM mock.ts rather than hard-coded here, so a fixture that
// gains an image can never silently drift out of sync with its asset — re-run this script and
// the new path is generated too.
//
// These are deliberately abstract brand-palette graphics, not stand-ins pretending to be
// photographs: a viewer should read them as "artwork pending", never mistake one for the real
// project. Plan Task 26 replaces the whole tree with real photography and real brochures.
//
// Run: node scripts/generate-placeholders.mjs [--force]

import { readFile, mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join, resolve, basename } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const MOCK = join(ROOT, 'lib', 'data', 'mock.ts')
const PUBLIC = join(ROOT, 'public')
const FORCE = process.argv.includes('--force')

const NAVY_900 = '#071628'
const NAVY_800 = '#0A1A2F'
const NAVY_700 = '#16233A'
const IVORY = '#F7F4EE'
const ORANGE = '#FF4907'
const CHAMPAGNE = '#C9A227'

// Deterministic hash so every asset looks different from its neighbours but identical across
// runs and machines. Math.random() would make each run produce a fresh diff for no reason.
function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rng(seed) {
  let s = seed || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function label(text, w, h, colour) {
  return `<text x="${w / 2}" y="${h - Math.round(h * 0.045)}" fill="${colour}"
    font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(w * 0.016)}"
    letter-spacing="${Math.round(w * 0.005)}" text-anchor="middle"
    opacity="0.55">${esc(text.toUpperCase())}</text>`
}

// A dusk skyline: layered blocks with lit windows. Used for heroes, galleries and site updates,
// varied by seed so no two read the same.
function skyline(w, h, seed, opts) {
  const r = rng(seed)
  const { bands = 3, warm = ORANGE } = opts
  let out = ''
  for (let band = 0; band < bands; band++) {
    const depth = (band + 1) / bands
    const baseY = h * (0.45 + 0.16 * band)
    const fill = [NAVY_700, NAVY_800, NAVY_900][band % 3]
    let x = -w * 0.05
    while (x < w * 1.05) {
      const bw = w * (0.04 + r() * 0.09)
      const bh = h * (0.16 + r() * (0.42 - 0.1 * band))
      const y = baseY - bh
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${(h - y).toFixed(1)}" fill="${fill}" opacity="${(0.55 + 0.15 * depth).toFixed(2)}"/>`
      // Lit windows, sparse and warm, only on the nearer bands so distance reads.
      if (band < 2) {
        const cols = Math.max(1, Math.floor(bw / (w * 0.014)))
        const rows = Math.max(1, Math.floor(bh / (h * 0.05)))
        for (let c = 0; c < cols; c++) {
          for (let ro = 0; ro < rows; ro++) {
            if (r() > 0.82) {
              const wx = x + w * 0.004 + c * (bw / cols)
              const wy = y + h * 0.014 + ro * (bh / rows)
              const col = r() > 0.65 ? warm : CHAMPAGNE
              out += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${(w * 0.0045).toFixed(1)}" height="${(h * 0.012).toFixed(1)}" fill="${col}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`
            }
          }
        }
      }
      x += bw + w * 0.008
    }
  }
  return out
}

function photoSvg(w, h, seed, text) {
  const r = rng(seed)
  const hueShift = r()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${NAVY_900}"/>
        <stop offset="${(45 + hueShift * 20).toFixed(0)}%" stop-color="${NAVY_800}"/>
        <stop offset="100%" stop-color="${NAVY_700}"/>
      </linearGradient>
      <radialGradient id="glow" cx="${(20 + hueShift * 60).toFixed(0)}%" cy="38%" r="55%">
        <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky)"/>
    <rect width="${w}" height="${h}" fill="url(#glow)"/>
    ${skyline(w, h, seed, { bands: 3 })}
    <rect y="${h * 0.82}" width="${w}" height="${h * 0.18}" fill="${NAVY_900}" opacity="0.5"/>
    ${label(text, w, h, IVORY)}
  </svg>`
}

// Floor plans read as line drawings on paper, not as photographs — a dark gradient here would
// be actively misleading about what the asset is.
function floorPlanSvg(w, h, seed, text) {
  const r = rng(seed)
  const m = w * 0.09
  const iw = w - m * 2
  const ih = h - m * 2
  let out = `<rect x="${m}" y="${m}" width="${iw}" height="${ih}" fill="none" stroke="${NAVY_800}" stroke-width="${w * 0.006}"/>`
  // Recursive splits give plausible room proportions without hand-placing every wall.
  const split = (x, y, ww, hh, d) => {
    if (d === 0 || ww < iw * 0.18 || hh < ih * 0.18) return
    const vertical = ww > hh
    const t = 0.34 + r() * 0.32
    if (vertical) {
      const cx = x + ww * t
      out += `<line x1="${cx.toFixed(1)}" y1="${y.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(y + hh).toFixed(1)}" stroke="${NAVY_800}" stroke-width="${w * 0.0032}"/>`
      // Doorway: a gap drawn back in ivory over the wall.
      const dy = y + hh * (0.3 + r() * 0.4)
      out += `<line x1="${cx.toFixed(1)}" y1="${dy.toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(dy + hh * 0.14).toFixed(1)}" stroke="${IVORY}" stroke-width="${w * 0.005}"/>`
      split(x, y, ww * t, hh, d - 1)
      split(cx, y, ww * (1 - t), hh, d - 1)
    } else {
      const cy = y + hh * t
      out += `<line x1="${x.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(x + ww).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${NAVY_800}" stroke-width="${w * 0.0032}"/>`
      const dx = x + ww * (0.3 + r() * 0.4)
      out += `<line x1="${dx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(dx + ww * 0.14).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${IVORY}" stroke-width="${w * 0.005}"/>`
      split(x, y, ww, hh * t, d - 1)
      split(x, cy, ww, hh * (1 - t), d - 1)
    }
  }
  split(m, m, iw, ih, 4)
  out += `<line x1="${m}" y1="${h - m * 0.45}" x2="${m + iw * 0.3}" y2="${h - m * 0.45}" stroke="${ORANGE}" stroke-width="${w * 0.004}"/>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="${IVORY}"/>${out}${label(text, w, h, NAVY_800)}</svg>`
}

// The masterplan needs plots and roads because Task 16 overlays interactive hotspots on it.
function masterPlanSvg(w, h, seed, text) {
  const r = rng(seed)
  let out = `<rect width="${w}" height="${h}" fill="${IVORY}"/>`
  out += `<rect x="${w * 0.04}" y="${h * 0.04}" width="${w * 0.92}" height="${h * 0.92}" fill="none" stroke="${NAVY_700}" stroke-width="${w * 0.0035}"/>`
  for (const y of [0.32, 0.66]) {
    out += `<rect x="${w * 0.04}" y="${h * y}" width="${w * 0.92}" height="${h * 0.05}" fill="${NAVY_700}" opacity="0.16"/>`
  }
  out += `<rect x="${w * 0.47}" y="${h * 0.04}" width="${w * 0.05}" height="${h * 0.92}" fill="${NAVY_700}" opacity="0.16"/>`
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 10; col++) {
      const x = w * 0.06 + col * w * 0.088 + (col >= 5 ? w * 0.03 : 0)
      const y = h * 0.08 + row * h * 0.34
      if (x + w * 0.072 > w * 0.95) continue
      const sold = r() > 0.72
      out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(w * 0.072).toFixed(1)}" height="${(h * 0.2).toFixed(1)}" fill="${sold ? ORANGE : NAVY_800}" opacity="${sold ? 0.18 : 0.1}" stroke="${sold ? ORANGE : NAVY_800}" stroke-width="${w * 0.0018}"/>`
    }
  }
  out += label(text, w, h, NAVY_800)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${out}</svg>`
}

// Minimal single-page PDF with a correct xref table, so real viewers open it rather than
// repairing it. Task 21 links these as brochure downloads.
function pdf(title) {
  const lines = [
    'BT /F1 22 Tf 62 726 Td (BKR INFRA) Tj ET',
    `BT /F1 14 Tf 62 694 Td (${title.replace(/[()\\]/g, '')}) Tj ET`,
    'BT /F1 10 Tf 62 664 Td (Placeholder brochure - artwork pending.) Tj ET',
    'BT /F1 10 Tf 62 648 Td (Redefining Real Estate Excellence) Tj ET',
  ].join('\n')
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${lines.length} >>\nstream\n${lines}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let body = ''
  const offsets = []
  let pos = '%PDF-1.4\n'.length
  objs.forEach((o, i) => {
    const chunk = `${i + 1} 0 obj\n${o}\nendobj\n`
    offsets.push(pos)
    body += chunk
    pos += chunk.length
  })
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  for (const o of offsets) xref += `${String(o).padStart(10, '0')} 00000 n \n`
  return Buffer.from(
    `%PDF-1.4\n${body}${xref}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${pos}\n%%EOF\n`,
    'latin1'
  )
}

function prettyName(p) {
  const proj = p.split('/').slice(-2)[0].replace(/-/g, ' ')
  const file = basename(p).replace(/\.[a-z]+$/, '').replace(/-/g, ' ')
  return `${proj} — ${file}`
}

const exists = (p) =>
  access(p).then(
    () => true,
    () => false
  )

const src = await readFile(MOCK, 'utf8')
const paths = [...new Set(src.match(/\/placeholder\/[A-Za-z0-9/._-]+/g) ?? [])].sort()
if (paths.length === 0) throw new Error('parsed zero placeholder paths from mock.ts — refusing to run')

let made = 0
let skipped = 0

for (const p of paths) {
  const out = join(PUBLIC, p)
  if (!FORCE && (await exists(out))) {
    skipped++
    continue
  }
  await mkdir(dirname(out), { recursive: true })
  const seed = hash(p)
  const name = prettyName(p)

  if (p.endsWith('.pdf')) {
    await writeFile(out, pdf(name))
  } else {
    const f = basename(p)
    let svg
    if (f.startsWith('floorplan')) svg = floorPlanSvg(1600, 1200, seed, name)
    else if (f.startsWith('masterplan')) svg = masterPlanSvg(2000, 1400, seed, name)
    else if (f.startsWith('hero')) svg = photoSvg(1920, 1080, seed, name)
    else svg = photoSvg(1600, 1067, seed, name)
    await sharp(Buffer.from(svg)).jpeg({ quality: 78, mozjpeg: true }).toFile(out)
  }
  made++
}

console.log(`placeholders: ${made} written, ${skipped} already present, ${paths.length} referenced by mock.ts`)
