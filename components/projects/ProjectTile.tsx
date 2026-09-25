import Link from 'next/link'
import { resolvePhoto } from '@/components/project/photo'
import { RevealImage } from '@/components/motion/RevealImage'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { cn } from '@/lib/cn'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/format'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The project card, in the layout's construction — the same card on the home page, on /projects and
 * under a project as "other projects".
 *
 *   ┌──────────────────────────────┐
 *   │          photograph          │   8px radius; the tinted block drops off it as it scrolls in
 *   │▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│   8px brand-gradient bar, drawn across on hover
 *   └──────────────────────────────┘
 *   Title ›                   Category
 *   Area, City                Status
 *
 * Hover, as measured: the bar grows 0 → 100% over 800ms on the `door` curve (out in 500ms), the title
 * block slides 2vw to the right, a chevron appears after the title, and the photograph pushes in to
 * 1.1 over 1000ms on the `zoom` curve. All of it is CSS on the card's `group`, so it costs no script.
 * On top of that the photograph tips a few degrees toward the pointer in perspective.
 *
 * The whole card is one link, and `data-project-card` / `data-category` / `data-status` are the hooks
 * the listing's tests filter on.
 */
export function ProjectTile({
  project,
  sizes = '(max-width: 767px) 100vw, 50vw',
  aspect = 'aspect-[648/455]',
  className,
  titleAs: Title = 'h3',
  compact = false,
}: {
  project: ProjectSummary
  sizes?: string
  /** The frame's aspect. The home and listing cards are 648×455; the three-up "other projects" row is 416×256. */
  aspect?: string
  className?: string
  titleAs?: 'h2' | 'h3'
  /**
   * The listing grid and the three-up "other projects" row, which the layout sets smaller than the
   * home page's cards: the title at 26px rather than 32px, the type, status and locality all at 16px
   * in the muted voice, and the type/status pair pulled to the card's right edge.
   */
  compact?: boolean
}) {
  const hero = resolvePhoto(project.heroImage)

  return (
    <article
      data-project-card
      data-category={project.category}
      data-status={project.status}
      className={cn('group relative', className)}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        <Tilt3D max={3} perspective={1400}>
          <div className={cn('relative overflow-clip rounded-card', aspect)}>
            <RevealImage src={hero.url} alt={hero.alt} sizes={sizes} zoom fill />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2">
              <div className="bg-brand-x h-full w-0 transition-[width] duration-500 ease-door group-hover:w-full group-hover:duration-[800ms] motion-reduce:transition-none" />
            </div>
          </div>
        </Tilt3D>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="min-w-0 transition-transform duration-500 ease-door group-hover:translate-x-[2vw] group-hover:duration-[800ms] motion-reduce:transition-none">
            <Title
              className={cn(
                'flex items-center gap-3 font-heading text-secondary',
                compact ? 'text-lede max-sm:text-h4-sm' : 'text-h3 max-sm:text-h3-sm'
              )}
            >
              <span>{project.title}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-5 w-5 shrink-0 text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-sm:h-4 max-sm:w-4"
              >
                <path d="M6 3 11 8l-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Title>
            <p className={cn('mt-1 text-body max-sm:text-body-sm', compact ? 'text-muted' : 'text-secondary')}>
              {project.location.area}, {project.location.city}
            </p>
          </div>
          <p
            className={cn(
              'shrink-0 pt-2 text-muted max-sm:w-auto max-sm:text-right',
              compact ? 'text-body max-sm:text-small' : 'w-[28%] text-small'
            )}
          >
            <span className="block">{CATEGORY_LABELS[project.category]}</span>
            <span className="block">{STATUS_LABELS[project.status]}</span>
          </p>
        </div>
      </Link>
    </article>
  )
}
