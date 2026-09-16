import { cn } from '@/lib/cn'
import { COLORS } from '@/lib/tokens'
import { LogoMark } from './LogoMark'

// The monogram in LogoMark was re-traced from pixel measurements of docs/brand-refs/logo-wide.jpeg,
// cross-checked against logo-square.jpeg, and verified against the reference at matched cap
// height (see .superpowers/sdd/2026-09-15-bkr-infra-website/logo-comparison-v2.png, the
// logo-iter-*.png progression, and fix-wave-1-report.md). Agreement is 99.7% of pixels whose
// classification the reference JPEG's own edge blur does not make ambiguous, so the vector
// trace stands and there is no raster fallback.
//
// Size this lockup by WIDTH, never by height. It mixes a scalable SVG with fixed-px text, so
// under a height budget the text holds its size and the mark is the only thing that can give
// — flex-shrink then crushed the monogram to 8px in the header and 12px in the footer, making
// it smaller than the INFRA text beneath it and inverting the reference's hierarchy (the
// reference monogram is ~2.9x the INFRA cap height). Width-sizing makes the mark's height
// aspect-derived and the container's height automatic, so nothing competes for space. The
// `shrink-0` on both the root and the mark is what guarantees it, since a flex parent would
// otherwise still be free to compress the declared width.

type LogoProps = {
  variant: 'dark' | 'light'
  withTagline?: boolean
  className?: string
}

// White has no COLORS token (COLORS only defines the navy/ivory/orange/champagne brand
// ramp), so unlike every other colour in this component it is necessarily a literal —
// there is no token to defer to. Every other colour reference here goes through COLORS.
const WHITE = '#FFFFFF'

export function Logo({ variant, withTagline = false, className }: LogoProps) {
  const ink = variant === 'dark' ? COLORS['navy-800'] : WHITE

  return (
    <span
      role="img"
      aria-label="BKR INFRA — Redefining Real Estate Excellence"
      className={cn('inline-flex shrink-0 flex-col items-center leading-none', className)}
    >
      <LogoMark animated={false} color={ink} className="h-auto w-full shrink-0" />

      <span aria-hidden="true" className="mt-2 flex items-center justify-center gap-3">
        <span aria-hidden="true" className="h-[3px] w-6" style={{ backgroundColor: COLORS.orange }} />
        {/* text-base, not text-sm: at the mark's 418:100 aspect this puts the monogram at ~3x
            the INFRA cap height, matching the reference. At text-sm the ratio was ~3.4 and
            INFRA read undersized against the mark. */}
        <span
          className="font-display-expanded text-base"
          style={{ color: ink, letterSpacing: '0.3em' }}
        >
          INFRA
        </span>
        <span aria-hidden="true" className="h-[3px] w-6" style={{ backgroundColor: COLORS.orange }} />
      </span>

      {withTagline && (
        <span aria-hidden="true" className="mt-2 flex flex-col items-center gap-1.5">
          <span className="text-[10px]" style={{ letterSpacing: '0.18em' }}>
            <span style={{ color: COLORS.orange }}>REDEFINING</span>{' '}
            <span style={{ color: ink }}>REAL ESTATE EXCELLENCE</span>
          </span>
          {/* Short centred rule beneath the tagline — present in the reference artwork but
              not called out in the brief text; included for fidelity to the source (Ruling 2). */}
          <span aria-hidden="true" className="h-[2px] w-10" style={{ backgroundColor: COLORS.orange }} />
        </span>
      )}
    </span>
  )
}
