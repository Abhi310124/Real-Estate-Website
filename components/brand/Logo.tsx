import { cn } from '@/lib/cn'
import { LogoMark } from '@/components/brand/LogoMark'

/**
 * The accessible wrapper around the mark: it supplies the name, `LogoMark` supplies the artwork.
 *
 * `withTagline` no longer renders a separate line of type. The real lockup has "REDEFINING REAL
 * ESTATE EXCELLENCE" set inside it, as two colours and a rule, so the `lockup` variant of the mark IS
 * the tagline — reproducing it in mono type beside the image would show it twice, in the wrong face,
 * at the wrong tracking, in one colour instead of two.
 *
 * `variant` decides only the SERVER-RENDERED first paint. On the header the ink sampler takes over
 * on the first frame and cross-fades between the mark's two inks from there, so being wrong here
 * costs a frame rather than a page.
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
  // The mark picks its own ink off this class, the same way the header band does.
  const ink = variant === 'dark' ? 'text-secondary' : 'text-primary'

  return (
    <span
      role="img"
      aria-label="BKR INFRA — Redefining Real Estate Excellence"
      className={cn('inline-flex shrink-0', ink, className)}
    >
      <LogoMark variant={withTagline ? 'lockup' : 'mark'} className="w-full" />
    </span>
  )
}
