import { cn } from '@/lib/cn'

type EyebrowProps = {
  children: React.ReactNode
  className?: string
}

/**
 * Small tracked-caps label atom, built on the `.eyebrow` font-variation class and the
 * `text-eyebrow` size/tracking pair already defined in globals.css / tailwind.config.ts
 * (Task 1). Deliberately sets no colour of its own: at eyebrow size (11px) orange fails the
 * AA contrast law on ivory (Ruling 9), so this atom always inherits `currentColor` from
 * wherever it is placed instead of hard-coding a shade that would be wrong on at least one
 * of the two backgrounds it needs to work on (ivory sections vs the navy mega-menu).
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return <span className={cn('eyebrow text-eyebrow', className)}>{children}</span>
}
