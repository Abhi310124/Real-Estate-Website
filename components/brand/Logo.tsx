import { cn } from '@/lib/cn'
import { LogoMark } from '@/components/brand/LogoMark'

/**
 * The lockup: the BKR INFRA mark, optionally over the tagline.
 *
 * This replaces a type-only wordmark — the letters "BKR" set in the body face beside the dot
 * ornament. That was the right call while the design was monochrome and borrowed its identity from
 * the reference, whose own mark is a word and an ornament and nothing else. It is the wrong call now:
 * the palette is derived from this mark, so the mark is the thing the palette has to agree with, and
 * setting the brand as plain text throws away the one element anybody recognises — the orange wedge.
 *
 * The earlier objection to shipping the real mark was that a two-colour logo needs a light variant, a
 * dark variant and a minimum legible size. That objection was sound and `LogoMark` answers it rather
 * than ignoring it: the letterforms are `currentColor`, so one instance inverts with whatever ink the
 * header has sampled, and there is no second file to keep in sync.
 *
 * `variant` is kept for the existing call sites: `dark` means dark ink for a light ground, `light`
 * means light ink for a dark one. The header overrides this at runtime — it samples what is actually
 * painted behind the band — so the value here only decides the server-rendered first paint.
 *
 * Sized by width. See the note in `LogoMark` about the 8px-tall header logo this project already
 * shipped once.
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
      <LogoMark className="h-auto w-[9.5vw] shrink-0 max-sm:w-[30vw]" />
      {withTagline && (
        <span className="mt-[0.4vw] font-mono text-mono uppercase text-muted max-sm:mt-[2vw] max-sm:text-mono-sm">
          Redefining Real Estate Excellence
        </span>
      )}
    </span>
  )
}
