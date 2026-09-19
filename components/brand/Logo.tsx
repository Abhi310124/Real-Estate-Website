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
 *
 * Weight 400 at the 31.68px step, and the wordmark ornament rather than the button asterisk — the
 * two details that decide whether this reads as the same mark the header sets. Nothing on the
 * reference is weight 500 below its two display steps, so `font-display` here would make the
 * logotype a step heavier than every other instance of the same word on the page. The 3.6px gap is
 * measured too: at 5.76px the ornament stops reading as punctuation attached to the word.
 *
 * `DotOrnament` at `md` carries its own top padding to meet the cap line, so it takes no wrapper
 * and no height of its own here.
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
      <span className="flex items-start gap-[0.25vw]">
        <span className="text-lead max-sm:text-lead-sm">BKR</span>
        <DotOrnament size="md" />
      </span>
      {withTagline && (
        <span className="mt-[0.4vw] font-mono text-mono uppercase opacity-60 max-sm:text-mono-sm">
          Redefining Real Estate Excellence
        </span>
      )}
    </span>
  )
}
