import Link from 'next/link'
import { cn } from '@/lib/cn'
import { STATUS_LABELS } from '@/lib/format'
import type { ProjectCategory, ProjectStatus, SiteSettings } from '@/lib/data/types'

type Active = { category?: ProjectCategory; status?: ProjectStatus }

type Props = {
  categories: SiteSettings['categories']
  active: Active
}

const STATUSES = Object.keys(STATUS_LABELS) as ProjectStatus[]

// `override` uses "key present" (not "value truthy") to distinguish "leave this axis alone" from
// "clear this axis": omitting a key keeps whatever is in `active`, while passing it explicitly as
// `null` clears it. That is the only way a single helper can serve both the per-option links (set one
// axis, preserve the other) and the "View all" reset links (clear one axis, still preserve the other).
function hrefFor(active: Active, override: { category?: ProjectCategory | null; status?: ProjectStatus | null }): string {
  const category = 'category' in override ? override.category : active.category
  const status = 'status' in override ? override.status : active.status
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (status) params.set('status', status)
  const qs = params.toString()
  return qs ? `/projects?${qs}#our-projects` : '/projects#our-projects'
}

/**
 * One filter option — plain text, the way the layout sets its filter row, with the live option in
 * orange and marked `aria-current` so the state is not carried by colour alone. `min-h-11` gives a
 * 44px target around ~16px of visible text.
 */
function FilterLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center font-heading transition-colors duration-300',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
        isActive ? 'text-accentInk' : 'text-secondary hover:text-accentInk'
      )}
    >
      {children}
    </Link>
  )
}

function FilterRow({
  label,
  size,
  items,
}: {
  label: string
  size: 'lg' | 'sm'
  items: Array<{ key: string; href: string; isActive: boolean; label: string }>
}) {
  return (
    <div className="flex items-center justify-between gap-x-10 gap-y-2 max-lg:flex-col max-lg:items-start">
      <span className={cn('shrink-0 text-secondary', size === 'lg' ? 'text-body' : 'text-small text-muted')}>{label}</span>
      <ul className={cn('flex flex-wrap items-center gap-x-11 max-sm:gap-x-6', size === 'lg' ? 'text-body' : 'text-small')}>
        {items.map((item) => (
          <li key={item.key}>
            <FilterLink href={item.href} isActive={item.isActive}>
              {item.label}
            </FilterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The listing's two filter axes, as plain `<Link>`s — crawlable, working without JS, middle-clickable
 * — each in its own `<nav>` landmark, so tests and assistive technology can address "the category
 * filters" specifically. That scoping matters: the footer lists every project by name on every route,
 * so an unscoped query for a label here can match twice.
 *
 * The reference filters on one axis and sets it in a single row: "Filter By:" on the left, the options
 * across the right. Category is that row; status sits under it as a quieter second row, because the
 * portfolio mixes finished, running and future work and a buyer usually wants to separate them.
 */
export function FilterBar({ categories, active }: Props) {
  return (
    <div className="space-y-2">
      <nav aria-label="Filter by category">
        <FilterRow
          label="Filter by:"
          size="lg"
          items={[
            ...categories.map((category) => ({
              key: category.value,
              href: hrefFor(active, { category: category.value }),
              isActive: active.category === category.value,
              label: category.label,
            })),
            { key: 'all', href: hrefFor(active, { category: null }), isActive: !active.category, label: 'View all' },
          ]}
        />
      </nav>
      <nav aria-label="Filter by status">
        <FilterRow
          label="Status:"
          size="sm"
          items={[
            ...STATUSES.map((value) => ({
              key: value,
              href: hrefFor(active, { status: value }),
              isActive: active.status === value,
              label: STATUS_LABELS[value],
            })),
            { key: 'all', href: hrefFor(active, { status: null }), isActive: !active.status, label: 'Any status' },
          ]}
        />
      </nav>
    </div>
  )
}
