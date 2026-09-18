import { cn } from '@/lib/cn'
import { DotOrnament } from '@/components/motion/DotOrnament'

/**
 * The wordmark: type plus the dot ornament.
 *
 * The traced BKR monogram it replaces is retired by choice. The reference's identity is a word and
 * an ornament — nothing else — and that is what survives being set in one weight at any size
 * against photography. A two-colour monogram cannot: it needs a light variant, a dark variant, and
 * a minimum legible size, all of which were real problems here (it once rendered 8px tall in the
 * header because a height budget let flex-shrink crush it).
 *
 * `variant` is kept for back-compatibility with existing call sites: `dark` means dark ink for a
 * light background, `light` means light ink for a dark one. In a monochrome palette that is the
 * entire decision.
 */
export function Logo({
  variant = 'dark',
  withTagline = false,
  className,
}: {
  variant?: 'dark' | 'light'
  withTagline?: boolean
  className?: string
}) {
  const ink = variant === 'dark' ? 'text-secondary' : 'text-primary'

  return (
    <span
      role="img"
      aria-label="BKR INFRA — Redefining Real Estate Excellence"
      className={cn('inline-flex shrink-0 flex-col', ink, className)}
    >
      <span className="flex items-center gap-[0.4vw]">
        <span className="text-lead font-display leading-none max-sm:text-lead-sm">BKR</span>
        <DotOrnament />
      </span>
      {withTagline && (
        <span className="mt-[0.4vw] font-mono text-mono uppercase opacity-60 max-sm:text-mono-sm">
          Redefining Real Estate Excellence
        </span>
      )}
    </span>
  )
}
