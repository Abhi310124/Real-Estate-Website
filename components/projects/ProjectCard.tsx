import Link from 'next/link'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import type { ProjectSummary } from '@/lib/data/types'

type Props = { project: ProjectSummary; className?: string }

/**
 * One tile in `/projects`' grid — an image well (`bg-navy-800`, `ImageReveal`) stacked above an
 * ivory-warm info panel, the same convention HorizontalShowcase's cards established (Ruling 9):
 * `Pill`'s `upcoming` (`bg-champagne/20 text-navy-800`) and `completed` (`bg-navy-800 text-white`)
 * variants are contrast-tuned for a light surface, and lose all shape/legibility over a navy
 * well, so status and every other piece of metadata render only on the ivory panel below it.
 *
 * `data-flip-id` follows GSAP's own documented Flip guidance for framework re-renders: give
 * each target a stable identity attribute so `Flip.getState`/`Flip.from` (in ProjectGrid) keep
 * matching the right element to the right recorded state even if a future refactor changes how
 * these nodes get created, rather than depending solely on React's key-driven DOM reuse.
 */
export function ProjectCard({ project, className }: Props) {
  return (
    <article
      data-project-card
      data-flip-id={project.slug}
      data-category={project.category}
      data-status={project.status}
      data-cursor="view"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-sm bg-ivory-warm ring-1 ring-navy-800/10',
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy-800">
        <ImageReveal
          src={project.heroImage.url}
          alt={project.heroImage.alt}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          // Overrides ImageReveal's shared default testid — one grid full of cards would
          // otherwise violate Playwright's strict mode together (same fix CategoryGrid applies).
          data-testid={`project-card-image-${project.slug}`}
          className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Pill status={project.status} />
          <span className="text-caption text-navy-700">{project.location.area}</span>
        </div>
        <h3 className="mt-3 font-display-expanded text-xl leading-tight text-navy-800">
          {/* One link per card, covering the card via `::after` rather than wrapping the whole
              article, so a screen reader announces one link named after the title instead of a
              single giant link with every price/status/unit-type crammed into its accessible
              name (same pattern as HorizontalShowcase's cards). */}
          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex min-h-11 items-end rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
          >
            {project.title}
          </Link>
        </h3>
        {/* navy-800, not champagne: champagne-on-ivory is ~2.2:1 and decorative-only under the
            master prompt's contrast law; orange is barred below 24px. `tnum` aligns the figures
            between cards, same as HorizontalShowcase's price line. */}
        <p className="tnum mt-2 text-body font-semibold text-navy-800">
          {formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest)}
        </p>
        {project.unitTypes.length > 0 && (
          <p className="mt-auto pt-3 text-caption text-navy-700">{project.unitTypes.join(' · ')}</p>
        )}
      </div>
    </article>
  )
}
