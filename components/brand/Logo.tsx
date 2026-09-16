import { cn } from '@/lib/cn'
import { COLORS } from '@/lib/tokens'
import { LogoMark } from './LogoMark'

// Decision gate (Ruling 3 / Task 6 Step 5): the traced LogoMark below was compared against
// docs/brand-refs/logo-wide.jpeg at matching widths (see
// .superpowers/sdd/2026-09-15-bkr-infra-website/logo-comparison.png and the write-up in
// batch-b-report.md). That comparison and the go/no-go call on whether the vector trace is
// close enough to ship, versus falling back to public/brand/logo-wide.png for static
// placements, is intentionally left open for the orchestrator — this file does not decide
// it. The rest of this component and every later task builds on the assumption the SVG
// stands, per Ruling 3's instruction to keep going rather than block on that gate.

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
