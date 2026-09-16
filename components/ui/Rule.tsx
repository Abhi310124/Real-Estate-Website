import { cn } from '@/lib/cn'

type RuleProps = {
  className?: string
}

/**
 * Purely decorative orange hairline — one of the explicit allowed uses of orange from
 * Ruling 9 (display text ≥24px, rules, icons, filled buttons with white labels). Always
 * `aria-hidden`: it carries no content, so exposing it to assistive tech would only add
 * noise. Callers size it with `className` (width/height utilities); defaults to a small
 * flanking rule matching the one already traced into Logo.tsx's INFRA lockup.
 */
export function Rule({ className }: RuleProps) {
  return <span aria-hidden="true" className={cn('block h-[3px] w-10 bg-orange', className)} />
}
