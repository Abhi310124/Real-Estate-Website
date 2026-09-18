import Link from 'next/link'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import type { ProjectSummary } from '@/lib/data/types'

type Props = { project: ProjectSummary; className?: string }

/**
 * One tile in `/projects`' grid, in the monochrome listing register.
 *
 * The anatomy is the reference's, and is deliberately *not* a card: there is no panel, no ring, no
 * fill. Photograph, then title at `lead`, then the metadata line at `label` in `muted`, then the
 * status. What separates one tile from the next is the 10vw of white the grid puts between them,
 * not a border. Adding a surface here would reintroduce the "search result" look the whole design
 * language is built to avoid — and the old ivory/navy panel it replaces referenced two colours
 * that no longer exist in the palette.
 *
 * Contents are wrapped in a single `<Link>` rather than the old title-link-plus-`::after` overlay.
 * With no panel to click, an invisible pseudo-element covering an unbordered tile is a worse
 * affordance than the honest one, and one link per card is what the e2e suite asserts
 * (`[data-project-card] a`).
 *
 * No hover zoom on the photograph. The finished home sections (Expertise, ProjectsFeature,
 * JournalPreview) never scale their images, and the previous `group-hover:scale-105` here landed on
 * `ImageReveal`'s *outer* frame — the element that owns `overflow-hidden` — so it grew the frame
 * itself into its neighbours instead of zooming inside it. The hover signal is the hairline that
 * draws itself under the title, which is the site's own gesture, and it animates `transform` only.
 *
 * `data-flip-id` follows GSAP's own documented Flip guidance for framework re-renders: give each
 * target a stable identity attribute so `Flip.getState`/`Flip.from` (in ProjectGrid) keep matching
 * the right element to the right recorded state even if a future refactor changes how these nodes
 * get created, rather than depending solely on React's key-driven DOM reuse.
 */

/**
 * The fixtures in `lib/data/mock.ts` still point at `/placeholder/projects/<slug>/hero.jpg`, which
 * is generated navy-and-orange vector art with the project's name burnt into it — an artefact of
 * the pre-monochrome design, and the only coloured thing that would appear on this page. Until the
 * fixtures are re-pointed, a placeholder URL is swapped here for one of the real photographs, at
 * the one place that renders a listing hero.
 *
 * The pool is the seven `exterior-*` files whose contents were checked to actually be buildings —
 * `exterior-03.jpg` is excluded because, despite its name, it is an interior, and a living room
 * under a card titled after a plot layout is worse than no substitution at all. A listing hero
 * wants the elevation, so no interiors or details are in the pool.
 *
 * Keyed off the slug, not the render index, so a project keeps the same photograph as filters
 * change the grid around it — index-keyed selection would reshuffle every image on every filter
 * click and make Flip's reposition read as a content swap instead of a move. FNV-1a because a plain
 * char-code sum collides on these slugs (they share a `bkr-` prefix and a similar length); with
 * seven entries the five published fixtures land on five different photographs. More than seven
 * placeholder-backed projects will start to repeat, which is the point at which the fixtures should
 * carry real images rather than this list growing.
 */
const STANDIN_PHOTOS = [
  '/photography/exterior-07.jpg',
  '/photography/exterior-08.jpg',
  '/photography/exterior-02.jpg',
  '/photography/exterior-04.jpg',
  '/photography/exterior-05.jpg',
  '/photography/exterior-06.jpg',
  '/photography/exterior-01.jpg',
] as const

function resolveHero(url: string, slug: string): string {
  if (!url.startsWith('/placeholder/')) return url
  let hash = 2166136261
  for (let i = 0; i < slug.length; i += 1) {
    hash ^= slug.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  return STANDIN_PHOTOS[hash % STANDIN_PHOTOS.length] as string
}

export function ProjectCard({ project, className }: Props) {
  return (
    <article
      data-project-card
      data-flip-id={project.slug}
      data-category={project.category}
      data-status={project.status}
      data-cursor="view"
      className={cn('group relative flex flex-col', className)}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      >
        <ImageReveal
          src={resolveHero(project.heroImage.url, project.slug)}
          alt={project.heroImage.alt}
          sizes="(min-width: 640px) 42vw, 92vw"
          // Overrides ImageReveal's shared default testid — one grid full of cards would
          // otherwise violate Playwright's strict mode together.
          data-testid={`project-card-image-${project.slug}`}
          className="aspect-[4/5] w-full"
        />

        <h3 className="mt-[1.6vw] text-lead font-display max-sm:mt-[5vw] max-sm:text-lead-sm">
          {/* The underline draws from the right on hover, 300ms — the same gesture and origin as
              RuleDraw, so the card's only hover state belongs to the same vocabulary as every
              section divider. Pure `transform`, and inert under reduced motion. */}
          <span className="relative inline-block after:absolute after:inset-x-0 after:-bottom-[0.15em] after:block after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-in-out after:content-[''] group-hover:after:scale-x-100 motion-reduce:after:transition-none">
            {project.title}
          </span>
        </h3>

        {/* Location and price on one `label` line in `muted`, split by a hairline slash. With no
            hue left to separate them, the divider does that job. `tnum` aligns the figures down
            the column between cards. */}
        <p className="mt-[1vw] flex flex-wrap items-baseline gap-x-[1vw] gap-y-[0.4vw] text-label text-muted max-sm:mt-[3vw] max-sm:gap-x-[2.5vw] max-sm:text-label-sm">
          <span>{project.location.area}</span>
          <span aria-hidden="true" className="text-edge">
            /
          </span>
          <span className="tnum">
            {formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest)}
          </span>
        </p>

        <div className="mt-[1.4vw] flex flex-wrap items-center gap-x-[1.2vw] gap-y-[0.8vw] max-sm:mt-[4vw] max-sm:gap-x-[3vw]">
          <Pill status={project.status} />
          {project.unitTypes.length > 0 && (
            <span className="font-mono text-mono uppercase text-muted max-sm:text-mono-sm">
              {project.unitTypes.join(' · ')}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}
