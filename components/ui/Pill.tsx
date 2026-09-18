import { cn } from '@/lib/cn'
import type { ProjectStatus } from '@/lib/data/types'

/**
 * Project status label.
 *
 * Monochrome, and square — the previous version used four tinted rounded chips (orange for
 * ongoing, champagne for upcoming) which no longer exist in the palette. With no hue available,
 * status is carried by weight and border instead: the active state is a solid fill, the rest are
 * outlined. That is a weaker signal than colour was, which is why the label text is never
 * abbreviated — the word does the work now, not the tint.
 *
 * Kept as `Pill` with the same `status` prop so the nine call sites need no edit, despite the name
 * no longer describing the shape (`border-radius: 0`).
 */
const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  // The one status a buyer most needs to notice gets the solid fill.
  ongoing: { label: 'Ongoing', className: 'bg-secondary text-primary' },
  upcoming: { label: 'Upcoming', className: 'border border-current text-secondary' },
  completed: { label: 'Completed', className: 'border border-current text-muted' },
  'sold-out': { label: 'Sold Out', className: 'border border-current text-muted opacity-60' },
}

export function Pill({ status, className }: { status: ProjectStatus; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none px-[0.7vw] py-[0.25vw] font-mono text-mono uppercase max-sm:px-[2vw] max-sm:py-[1vw] max-sm:text-mono-sm',
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  )
}
