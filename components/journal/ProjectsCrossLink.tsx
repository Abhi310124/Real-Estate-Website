import Link from 'next/link'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { Button } from '@/components/ui/Button'
import { resolvePhoto } from '@/components/project/photo'
import { cn } from '@/lib/cn'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The two blocks that close the reading and hand the visitor back to the work: a line of display type
 * with one control, then two project plates.
 *
 * ## Why a journal page ends by pointing at projects
 *
 * Because the alternative is ending on a card. Every route on the reference closes the same way —
 * cross-link, showcase, intake — and the reason is structural rather than decorative: a listing has no
 * natural end, so whatever sits last becomes the page's conclusion. Four posts and then a footer says
 * the journal is the destination. Four posts, then "see where the thinking lands", then two buildings,
 * then a form says the writing was the argument and the projects are the evidence, which is the only
 * reading of a journal that serves a lead-generation site.
 *
 * ## The cross-link block
 *
 * `mt-[20vw]` (288px) — the same chapter gap that introduces the featured row, so the two ends of the
 * listing are framed by equal silences. The heading takes six columns, which wraps 28 characters of
 * 100.8px display to three lines and gives the block its measured 302.4px; the control sits in columns
 * 8–11 aligned to the bottom of that box, so it lands level with the heading's last line rather than
 * hovering beside its first. `justify-end` is doing that, and it is the one thing in this block that
 * is not obvious from the markup.
 *
 * The heading is NOT run through `SplitLines`. Display steps are line-height 1.0, where the mask is
 * narrower than the ink and would shave ascenders and descenders off permanently — and the reference
 * animates prose and never its display type.
 *
 * ## The showcase is two frames and nothing else
 *
 * 920px tall, which is exactly the taller frame: `aspect-[12/16]` (690x920) beside `aspect-[14/12]`
 * (690x591.4), flush at the top. No title, no dateline, no button under either one — the anchor IS the
 * frame. That is what keeps the block at 920px, and adding a control below would both break the
 * measurement and turn two plates into two more cards, which the page already has four of.
 *
 * The consequence is a link with no visible text, so each carries an `aria-label` naming its project;
 * a screen reader gets "Explore BKR Lakeview Enclave" where a sighted visitor gets a photograph. The
 * reference puts a visible "Explore" inside the frame, but it arrives as a cursor-following pill on
 * hover, which is a separate piece of work — when that lands, these two frames want it.
 *
 * Renders the cross-link alone if no published project has a photograph to show, rather than an empty
 * 920px band.
 */

// 690x920 and 690x591.4 in a 690px column. Positional, like every other frame shape on the route: the
// tall plate first is what makes the pair read as a spread rather than as a row.
const PLATE_ASPECTS = ['aspect-[12/16]', 'aspect-[14/12]'] as const

export function ProjectsCrossLink({ projects }: { projects: ProjectSummary[] }) {
  const plates = projects.slice(0, PLATE_ASPECTS.length)

  return (
    <>
      <div className="layout-grid mt-[20vw] max-sm:mt-[24vw]">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-6">
          See where the thinking lands
        </h2>

        <div className="col-span-12 my-[5vw] flex flex-col sm:col-span-4 sm:col-start-8 sm:my-0 sm:justify-end">
          <Button href="/projects" tone="dark" className="max-sm:w-full">
            View Projects
          </Button>
        </div>
      </div>

      {plates.length > 0 ? (
        <div className="layout-grid mt-[10vw] max-sm:mt-[16vw] max-sm:gap-y-[10vw]">
          {plates.map((project, i) => {
            // The fixtures' hero paths are generated placeholders; this maps each onto one of the real
            // architectural photographs in `public/photography/`, and the `i` keeps the pair distinct.
            const image = resolvePhoto(project.heroImage, i)

            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                aria-label={`Explore ${project.title}`}
                data-testid={`journal-projects-plate-${i + 1}`}
                className="col-span-12 h-fit focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary sm:col-span-6"
              >
                <ImageReveal
                  src={image.url}
                  alt={image.alt}
                  // Quoted against the frame; the photograph inside renders at 1.2x, so a 47.9vw
                  // column asks for ~58vw of pixels.
                  sizes="(min-width: 640px) 58vw, 110vw"
                  // The grade rides on the frame because `ImageReveal` exposes no class for its
                  // `<Image>`; the only other thing in the frame is a pure-black scrim, which a
                  // saturation multiplier cannot change. Move it onto the image if that prop lands.
                  className={cn('w-full saturate-[1.12]', PLATE_ASPECTS[i])}
                />
              </Link>
            )
          })}
        </div>
      ) : null}
    </>
  )
}
