// Downloads the architectural photography the site renders, into public/photography/.
//
// Replaces scripts/generate-placeholders.mjs, whose procedural brand-palette graphics were
// deliberately abstract. The Storey rebuild needs real photography — a monochrome editorial
// layout is carried almost entirely by its images, and abstract fills read as unfinished.
//
// Every file is verified after download (valid JPEG magic bytes, > 40KB) and any failure falls
// back to a second source rather than leaving a gap, because a blank image well is the one
// outcome the brief rules out. Re-running skips what already exists; --force refetches.
//
// Run: node scripts/fetch-photography.mjs [--force]

import { mkdir, writeFile, access, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUT = join(ROOT, 'public', 'photography')
const FORCE = process.argv.includes('--force')

// Unsplash photo IDs, grouped by the role each plays in the layout. Unsplash's licence permits
// commercial use without attribution, but CREDITS.md records them anyway so they can be traced
// and swapped for real BKR photography later.
const SETS = {
  // Wide dusk/exterior — hero, studio statement, project heroes
  exterior: [
    '1600585154340-be6161a56a0c',
    '1600596542815-ffad4c1539a9',
    '1600607687939-ce8a6c25118c',
    '1512917774080-9991f1c4c750',
    '1523217582562-09d0def993a6',
    '1518780664697-55e3ad937233',
    '1564013799919-ab600027ffc6',
    '1570129477492-45c003edd2be',
  ],
  // Interiors — gallery, expertise thumbs, journal covers
  interior: [
    '1600566753086-00f18fb6b3ea',
    '1600573472550-8090b5e0745e',
    '1600210492486-724fe5c67fb0',
    '1600566753190-17f0baa2a6c3',
    '1600607688969-a5bfcd646154',
    '1616486338812-3dadae4b4ace',
    '1616594039964-ae9021a400a0',
    '1618221195710-dd6b41faaea6',
    '1615874959474-d609969a20ed',
    '1583608205776-bfd35f0d9f83',
  ],
  // Detail / material / landscape — the 3D ring, offset pairs, texture moments
  detail: [
    '1600047509807-ba8f99d2cdde',
    '1600121848594-d8644e57abab',
    '1617104678098-de229db51175',
    '1449844908441-8829872d2607',
    '1580587771525-78b9dba3b914',
    '1600607688066-890987f18a86',
    '1600607688960-e095ff83135b',
    '1600607687920-4e2a09cf159d',
  ],
}

const MIN_BYTES = 40_000

const exists = (p) => access(p).then(() => true, () => false)

function isJpeg(buf) {
  // SOI marker FF D8 FF, and EOI FF D9 at the tail — catches truncated downloads, which a
  // byte-length check alone would pass.
  return buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
}

async function fetchBuf(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Primary source, then a fallback, so a dead ID never leaves an empty well. */
async function download(id, index, w, h) {
  const attempts = [
    `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&fm=jpg`,
    `https://picsum.photos/seed/bkr-${index}/${w}/${h}`,
  ]
  const errors = []
  for (const url of attempts) {
    try {
      const buf = await fetchBuf(url)
      if (!isJpeg(buf)) throw new Error('not a JPEG')
      if (buf.length < MIN_BYTES) throw new Error(`only ${buf.length} bytes`)
      return { buf, url }
    } catch (err) {
      errors.push(`${url.split('?')[0]} → ${err.message}`)
    }
  }
  throw new Error(`all sources failed:\n    ${errors.join('\n    ')}`)
}

// Dimensions per role: heroes are wide and large (they are LCP candidates), ring items are small
// because they render at 13.2vw, so shipping 2400px there would waste the whole budget.
const SPECS = {
  exterior: { w: 2400, h: 1350 },
  interior: { w: 1800, h: 1200 },
  detail: { w: 1400, h: 1050 },
}

await mkdir(OUT, { recursive: true })

const credits = []
let written = 0
let skipped = 0
const failures = []

for (const [role, ids] of Object.entries(SETS)) {
  const { w, h } = SPECS[role]
  for (const [i, id] of ids.entries()) {
    const name = `${role}-${String(i + 1).padStart(2, '0')}.jpg`
    const out = join(OUT, name)
    if (!FORCE && (await exists(out))) {
      const s = await stat(out)
      if (s.size >= MIN_BYTES) {
        skipped++
        credits.push({ name, id, role })
        continue
      }
    }
    try {
      const { buf, url } = await download(id, `${role}-${i}`, w, h)
      await mkdir(dirname(out), { recursive: true })
      await writeFile(out, buf)
      written++
      credits.push({ name, id, role, bytes: buf.length, from: url.includes('unsplash') ? 'unsplash' : 'picsum' })
      console.log(`  ✓ ${name}  ${(buf.length / 1024).toFixed(0)}KB`)
    } catch (err) {
      failures.push(`${name}: ${err.message}`)
      console.error(`  ✗ ${name}  ${err.message}`)
    }
  }
}

const lines = [
  '# Photography credits',
  '',
  'Architectural photography from [Unsplash](https://unsplash.com), whose licence permits',
  'commercial use. Fetched by `scripts/fetch-photography.mjs`.',
  '',
  '**These are placeholders.** They are real photographs of buildings BKR INFRA did not build,',
  'used so the layout can be judged with real content rather than empty wells. Every one is',
  'replaced with genuine BKR photography before launch — see `docs/OWNER-GUIDE.md`.',
  '',
  '| File | Role | Source |',
  '| --- | --- | --- |',
  ...credits.map((c) => `| \`${c.name}\` | ${c.role} | https://unsplash.com/photos/${c.id} |`),
  '',
  '```bash',
  'node scripts/fetch-photography.mjs          # fill in anything missing',
  'node scripts/fetch-photography.mjs --force  # refetch everything',
  '```',
]
await writeFile(join(OUT, 'CREDITS.md'), lines.join('\n'))

console.log(`\nphotography: ${written} written, ${skipped} already present, ${failures.length} failed`)
if (failures.length) {
  console.error('FAILURES:\n' + failures.join('\n'))
  process.exitCode = 1
}
