import { cn } from '@/lib/cn'

/**
 * Small label above a heading.
 *
 * Restyled for the monochrome system rather than retired, because 20+ call sites use it and
 * changing them all would be churn for no gain. What changed is the treatment: the previous
 * version was wide-tracked uppercase in a brand colour; this is the reference's mono label —
 * `font-mono` at the `mono` size token, which carries -10% tracking, in `muted`.
 *
 * The -10% tracking is the whole character of these labels. Positive letter-spacing (the usual
 * instinct for a small uppercase label) reads as a 2010s eyebrow; negative tracking on a mono face
 * reads as stamped metadata, which is the register this design is in.
 *
 * `className` still overrides colour, so a label on a black chapter can pass `text-primary/50`.
 */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('block font-mono text-mono uppercase text-muted max-sm:text-mono-sm', className)}>
      {children}
    </span>
  )
}
