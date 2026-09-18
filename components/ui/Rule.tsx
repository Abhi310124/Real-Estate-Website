import { cn } from '@/lib/cn'

/**
 * Static hairline. For the version that draws itself in on scroll, use
 * `components/motion/RuleDraw.tsx` — this is the inert one, for places where a rule is structural
 * (a table edge, a footer divider) rather than a gesture.
 *
 * Height matches the animated variant exactly: `max(0.1vw, 1px)`, so it thins with the viewport but
 * never vanishes on a small screen. `currentColor` so it inherits the chapter's ink instead of
 * needing a colour passed at every call site.
 */
export function Rule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('block w-full bg-current', className)}
      style={{ height: 'max(0.1vw, 1px)' }}
    />
  )
}
