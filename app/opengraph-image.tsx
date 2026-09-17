import { ImageResponse } from 'next/og'
import { COLORS } from '@/lib/tokens'

export const alt = 'BKR INFRA — Redefining Real Estate Excellence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Same geometry as components/brand/LogoMark.tsx's five <path>s, copied rather than imported:
// Satori (the renderer behind next/og's ImageResponse) only reads inline `style` objects and
// plain SVG presentation attributes, never Tailwind classNames or a component's own CSS custom
// properties, so LogoMark's `className`-sized/`color`-prop API would silently do nothing useful
// here. The `d` path data is the one thing worth sharing byte-for-byte with the real logo mark;
// everything else about how it is mounted (size, layout, colour source) is necessarily
// re-authored for Satori's constraints. White has no COLORS token (see Logo.tsx's own WHITE
// constant for the same reason) and is the mark's ink colour here, matching how the header/
// footer render the logo light-on-navy.
const WHITE = '#FFFFFF'
const MONOGRAM_WIDTH = 418
const CAP = 100

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS['navy-800'],
        }}
      >
        <svg
          width={MONOGRAM_WIDTH * 1.7}
          height={CAP * 1.7}
          viewBox={`0 0 ${MONOGRAM_WIDTH} ${CAP}`}
        >
          <path
            fillRule="evenodd"
            fill={WHITE}
            d="M0,0 H104 C112,0 128,11 128,24 V36 Q124,42 119,48 Q126,54 129,62 V78
               C129,90 113,100 105,100 H0 Z
               M0,21 H104 V39.4 H0 Z
               M23,60 H104 V78.4 H23 Z"
          />
          <path fill={COLORS.orange} d="M149,0 H197.5 L149,43 Z" />
          <path fill={WHITE} d="M242,0 H276 L155,100 H149 V77 Z" />
          <path fill={WHITE} d="M184,48 H218 L276,100 H242 Z" />
          <path
            fillRule="evenodd"
            fill={WHITE}
            d="M293,0 H396 C404,0 418,10 418,23 V36 C418,49 404,60 396,60 H316 V100 H293 Z
               M293,21 H394 V39.4 H293 Z"
          />
          <path fill={WHITE} d="M345,56 H377 L418,100 H386 Z" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 40 }}>
          <div style={{ width: 72, height: 5, backgroundColor: COLORS.orange }} />
          <div style={{ display: 'flex', fontSize: 44, color: WHITE, letterSpacing: 14 }}>
            INFRA
          </div>
          <div style={{ width: 72, height: 5, backgroundColor: COLORS.orange }} />
        </div>

        <div style={{ display: 'flex', marginTop: 32, fontSize: 24, letterSpacing: 5 }}>
          <span style={{ color: COLORS.orange }}>REDEFINING&nbsp;</span>
          <span style={{ color: WHITE }}>REAL ESTATE EXCELLENCE</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
