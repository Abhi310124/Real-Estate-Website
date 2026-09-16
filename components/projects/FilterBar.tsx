import Link from 'next/link'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'
import type { ProjectCategory, ProjectStatus, SiteSettings } from '@/lib/data/types'

type Active = { category?: ProjectCategory; status?: ProjectStatus }

type Props = {
  categories: SiteSettings['categories']
  active: Active
}

// Not read from Pill.tsx's own STATUS_META (module-private, and tuned for a chip's fixed
// label/colour pairing, not a filter's label/href pairing) — kept as its own small, local list
// so this component does not need Pill exported to change what it renders.
const STATUS_OPTIONS: Array<{ label: string; value: ProjectStatus }> = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Sold Out', value: 'sold-out' },
]

// `override` uses "key present" (not "value truthy") to distinguish "leave this axis alone"
// from "clear this axis": omitting a key keeps whatever is in `active`, while passing it
// explicitly as `null` clears it. That is the only way a single helper can serve both the
// per-option links (set one axis, preserve the other) and the "All ..." reset links (clear one
// axis, still preserve the other) without two near-duplicate functions.
function hrefFor(active: Active, override: { category?: ProjectCategory | null; status?: ProjectStatus | null }): string {
  const category = 'category' in override ? override.category : active.category
  const status = 'status' in override ? override.status : active.status
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (status) params.set('status', status)
  const qs = params.toString()
  return qs ? `/projects?${qs}` : '/projects'
}

function FilterLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-200 ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
        isActive
          ? 'bg-navy-800 text-white'
          : 'bg-ivory-warm text-navy-700 ring-1 ring-navy-800/10 hover:text-navy-800'
      )}
    >
      {children}
    </Link>
  )
}

/**
 * Two independent filter rows — category and status — rendered as plain `<Link>`s per the
 * master prompt (crawlable, work with JS disabled, middle-clickable), each in its own `<nav>`
 * landmark so tests and assistive tech can address "the category filters" specifically rather
 * than every link on the page. That scoping is not just a convenience: components/layout/
 * Footer.tsx independently renders one link per `settings.categories` entry (its "Explore"
 * column) on every route via app/layout.tsx, so an unscoped `getByRole('link', { name: /^villas$/i })`
 * on this page would match both this bar's link and Footer's, and strict-mode-fail. Scoping
 * through this nav's own `aria-label` is the fix (see tests/e2e/projects-listing.spec.ts).
 */
export function FilterBar({ categories, active }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Filter by category">
        <Eyebrow className="text-navy-700">Category</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterLink href={hrefFor(active, { category: null })} isActive={!active.category}>
            All Projects
          </FilterLink>
          {categories.map((category) => (
            <FilterLink
              key={category.value}
              href={hrefFor(active, { category: category.value })}
              isActive={active.category === category.value}
            >
              {category.label}
            </FilterLink>
          ))}
        </div>
      </nav>
      <nav aria-label="Filter by status">
        <Eyebrow className="text-navy-700">Status</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterLink href={hrefFor(active, { status: null })} isActive={!active.status}>
            All Statuses
          </FilterLink>
          {STATUS_OPTIONS.map((option) => (
            <FilterLink
              key={option.value}
              href={hrefFor(active, { status: option.value })}
              isActive={active.status === option.value}
            >
              {option.label}
            </FilterLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
