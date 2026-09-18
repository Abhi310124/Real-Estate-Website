import { ImageResponse } from 'next/og'
import { COLORS } from '@/lib/tokens'

export const alt = 'BKR INFRA — Contemporary Residential Development, Hyderabad'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Branded Open Graph card: the wordmark and the dot ornament on black.
 *
 * Rebuilt for the monochrome palette. Note the ornament is drawn here with plain absolutely
 * positioned divs rather than by importing `DotOrnament` — Satori (which renders this) supports
 * only a subset of CSS and does not implement `transform-origin`, so the component's
 * rotate-about-bottom-edge construction would collapse into eight overlapping bars. Here each
 * spoke is positioned by its own pre-computed offset instead, which Satori can render.
 *
 * Sizes are in px, not vw: there is no viewport in an OG image, and `vw` resolves to 0.
 */
export default function OpengraphImage() {
  const SPOKES = [0, 45, 90, 135, 180, 225, 270, 315]

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.03em' }}>BKR</span>
          <div style={{ position: 'relative', width: 34, height: 34, display: 'flex' }}>
            {SPOKES.map((deg) => {
              // Satori has no transform-origin, so each spoke's position is computed rather than
              // rotated into place: polar coordinates from the centre, at a fixed radius.
              const rad = (deg * Math.PI) / 180
              const r = 11
              return (
                <div
                  key={deg}
                  style={{
                    position: 'absolute',
                    left: 17 + r * Math.sin(rad) - 2,
                    top: 17 - r * Math.cos(rad) - 2,
                    width: 4,
                    height: 4,
                    background: COLORS.primary,
                  }}
                />
              )
            })}
          </div>
        </div>

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
