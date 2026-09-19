import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { COLORS } from '@/lib/tokens'

/**
 * The real lockup, inlined as a data URI.
 *
 * Satori renders this route and cannot resolve a bare `/brand/...` path — it has no origin to resolve
 * against — so the bytes have to be embedded. Read at module scope so it happens once per server
 * rather than once per request, and the reversed (cream-ink) variant because this card is navy.
 */
const LOCKUP = `data:image/png;base64,${readFileSync(
  join(process.cwd(), 'public/brand/bkr-lockup-light.png')
).toString('base64')}`

export const alt = 'BKR INFRA — Contemporary Residential Development, Hyderabad'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Branded Open Graph card: the real lockup on the brand navy.
 *
 * It previously set the word "BKR" in the body face beside a hand-built dot ornament, because no
 * usable artwork existed in the repo. It does now, so the card uses it.
 *
 * Sizes are in px, not vw: there is no viewport in an OG image, and `vw` resolves to 0.
 */
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
          background: COLORS.secondary,
          color: COLORS.primary,
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        {/* The actual artwork rather than the word "BKR" set in the body face beside a drawn
            ornament, which is what this used to be. A social card is often the first and only
            impression of the brand, so the mark on it should be the mark. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders this route, not the
            browser; next/image has no meaning here and would not resolve. */}
        <img src={LOCKUP} alt="" width={420} height={194} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ width: 220, height: 2, background: COLORS.primary }} />
          <span style={{ fontSize: 52, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 900 }}>
            Contemporary residential development, Hyderabad
          </span>
          <span style={{ fontSize: 24, color: COLORS.edge, letterSpacing: '-0.03em' }}>
            Open plots · Villas · Apartments · Independent houses
          </span>
        </div>
      </div>
    ),
    size
  )
}
