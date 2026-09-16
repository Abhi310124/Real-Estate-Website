import { cn } from '@/lib/cn'
import type { ProjectStatus } from '@/lib/data/types'

const STATUS_META: Record<ProjectStatus, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-champagne/20 text-navy-800' },
  // Ruling 9's filled-button carve-out for orange-with-white-text applies here too: this is
  // the one status a buyer most needs to notice, so it gets the same treatment as a solid
  // Button rather than the quieter tints the other three statuses use.
  ongoing: { label: 'Ongoing', className: 'bg-orange text-white' },
  completed: { label: 'Completed', className: 'bg-navy-800 text-white' },
  'sold-out': { label: 'Sold Out', className: 'bg-navy-700/10 text-navy-700' },
}

type PillProps = {
  status: ProjectStatus
  className?: string
}

/** Status chip for project cards/listings — maps a `ProjectStatus` straight to its fixed
 *  label and tone so every surface that shows project status (cards, detail pages, filters)
 *  reads identically instead of re-deriving the label/colour pairing per call site. */
export function Pill({ status, className }: PillProps) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  )
}
