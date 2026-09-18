import Link from 'next/link'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { RuleDraw } from '@/components/motion/RuleDraw'
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

/**
 * One filter option: a mono label, not a chip.
 *
 * The active state is carried by ink weight plus a hairline underneath — black on `muted`, with a
 * rule under the live option. The previous version used a filled navy pill against ivory outlines,
 * which in a palette with no hue becomes either a black blob (reading as a button, competing with
 * the real `Button`) or an invisible difference. An underline is how the reference marks a live
 * item, and it is the same hairline vocabulary as every divider on the page.
 *
 * `min-h-11` on the link, not on the label span, so the 44px touch target exists even though the
 * visible text is ~16px tall. `outline-current` for the focus ring: the palette has no accent to
 * ring with, and the old `outline-orange` silently stopped generating any CSS when the colour was
 * removed from the theme, leaving these links with no visible focus state at all.
 */
function FilterLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex min-h-11 items-center rounded-none font-mono text-mono uppercase transition-colors duration-150 ease-in-out max-sm:text-mono-sm',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
        isActive ? 'text-secondary' : 'text-muted hover:text-secondary'
      )}
    >
      <span className={cn('block pb-[0.35vw] max-sm:pb-[1.2vw]', isActive && 'border-b border-current')}>
        {children}
      </span>
    </Link>
  )
}

/**
 * One filter axis: a drawn rule, then a row of mono labels divided by vertical hairlines.
 *
 * The row is `flex-wrap`, so a wrapped line can start with a divider. That is left alone
 * deliberately — suppressing it needs either `nowrap` (which overflows at 390px, where five
 * category labels cannot share a line) or a JS measurement, and a leading hairline on a wrapped
 * row reads as continuation rather than as a mistake.
 */
function FilterRow({
  label,
  items,
  delayMs,
}: {
  label: string
  items: Array<{ key: string; href: string; isActive: boolean; label: string }>
  delayMs: number
}) {
  return (
    <>
      <RuleDraw delayMs={delayMs} className="text-edge" />
      <div className="mt-[0.8vw] flex flex-wrap items-center max-sm:mt-[3vw]">
        <Eyebrow className="mr-[2vw] shrink-0 max-sm:mr-0 max-sm:w-full">{label}</Eyebrow>
        <ul className="flex flex-wrap items-center">
          {items.map((item, i) => (
            <li
              key={item.key}
              className={cn(
                'flex items-center',
                i === 0
                  ? 'pr-[1.4vw] max-sm:pr-[3.5vw]'
                  : 'border-l border-edge px-[1.4vw] max-sm:px-[3.5vw]'
              )}
            >
              <FilterLink href={item.href} isActive={item.isActive}>
                {item.label}
              </FilterLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/**
 * Two independent filter axes — category and status — rendered as plain `<Link>`s (crawlable, work
 * with JS disabled, middle-clickable), each in its own `<nav>` landmark so tests and assistive tech
 * can address "the category filters" specifically rather than every link on the page. That scoping
 * is not just a convenience: components/layout/Footer.tsx independently renders one link per
 * `settings.categories` entry on every route via app/layout.tsx, so an unscoped
 * `getByRole('link', { name: /^villas$/i })` on this page would match both this bar's link and
 * Footer's, and strict-mode-fail. Scoping through this nav's own `aria-label` is the fix (see
 * tests/e2e/projects-listing.spec.ts).
 */
export function FilterBar({ categories, active }: Props) {
  return (
    <div className="flex flex-col gap-y-[2.2vw] max-sm:gap-y-[7vw]">
      <nav aria-label="Filter by category">
        <FilterRow
          label="Category"
          delayMs={0}
          items={[
            {
              key: 'all',
              href: hrefFor(active, { category: null }),
              isActive: !active.category,
              label: 'All Projects',
            },
            ...categories.map((category) => ({
              key: category.value,
              href: hrefFor(active, { category: category.value }),
              isActive: active.category === category.value,
              label: category.label,
            })),
          ]}
        />
      </nav>
      <nav aria-label="Filter by status">
        <FilterRow
          label="Status"
          delayMs={90}
          items={[
            {
              key: 'all',
              href: hrefFor(active, { status: null }),
              isActive: !active.status,
              label: 'All Statuses',
            },
            ...STATUS_OPTIONS.map((option) => ({
              key: option.value,
              href: hrefFor(active, { status: option.value }),
              isActive: active.status === option.value,
              label: option.label,
            })),
          ]}
        />
      </nav>
    </div>
  )
}
