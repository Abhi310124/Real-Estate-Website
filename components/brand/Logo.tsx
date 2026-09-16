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
// Known, deliberately NOT fixed here: the callers size this whole lockup by height
// (`h-9` in Header.tsx, `h-10` in Footer.tsx). Because LogoMark is a flex item whose
// aspect-derived height exceeds that budget once the INFRA line is laid out, flex-shrink
// crushes the mark to 8px tall in the header and 12px in the footer — smaller than the INFRA
// text beneath it, inverting the reference's hierarchy, where the monogram is roughly 3x the
// INFRA cap height. Correcting it means re-proportioning the lockup and the two call sites,
// which is a layout decision beyond this component. Measured evidence is in
// fix-wave-1-report.md.

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
      className={cn('inline-flex flex-col items-center', className)}
    >
      <LogoMark animated={false} color={ink} className="h-auto w-full" />

      <span aria-hidden="true" className="mt-2 flex items-center justify-center gap-3">
        <span aria-hidden="true" className="h-[3px] w-6" style={{ backgroundColor: COLORS.orange }} />
        <span
          className="text-sm font-display-expanded"
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
