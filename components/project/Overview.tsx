import { ImageReveal } from '@/components/motion/ImageReveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import { resolvePhoto } from './photo'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#overview` — the first white chapter, and the page's first ordinary section after the hero.
 *
 * Laid out on the 12-column grid the way the home page's white chapters are: a plain `display-lg`
 * heading with nothing above it (`Expertise` and `JournalPreview` both open exactly this way — the
 * mono eyebrow is reserved for a labelled aside, not used as a decorative kicker on every section),
 * then the prose in a narrow measure with the photograph pushed to the right-hand columns.
 *
 * The rotated vertical "OVERVIEW" side label the previous version carried is gone. It was a device
 * from a different design language, and it also failed contrast as real text while being marked
 * `aria-hidden` — which hides it from assistive tech without making it legible to a sighted reader
 * with low vision.
 *
 * Prose stays at four columns rather than filling the row. `text-body` is 1.6vw ≈ 23px, and a
 * paragraph of that set across eight columns runs well past 100 characters a line; the narrow
 * measure is a large part of why the reference's body copy reads as considered rather than dumped.
 *
 * Uses the project's own first gallery photograph — there is no dedicated overview image on
 * `Project` — falling back to the hero for a project whose gallery is empty.
 */
export function Overview({ project }: Props) {
  const image = resolvePhoto(project.gallery[0] ?? project.heroImage)

  return (
    <section
      id="overview"
      className={cn('w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          Overview
        </h2>
      </div>

      <div className="layout-grid mt-[6vw] max-sm:mt-[14vw]">
        <RuleDraw className="col-span-12 text-edge" />

        <div className="col-span-12 mt-[2vw] max-sm:mt-[6vw] sm:col-span-4">
          {project.overview.map((paragraph, i) => (
            <p
              key={paragraph.slice(0, 24) + i}
              className={cn('text-body text-muted max-sm:text-body-sm', i > 0 && 'mt-[1.6vw] max-sm:mt-[5vw]')}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Column 8 onwards, and a portrait crop: the asymmetry (narrow text left, tall image right,
            with two empty columns between them) is the same device `ProjectsFeature` uses on the home
            page. An even two-up split would read as a template. */}
        <ImageReveal
          src={image.url}
          alt={image.alt}
          sizes="(min-width: 640px) 38vw, 92vw"
          data-testid="overview-image-reveal"
          className="col-span-12 mt-[6vw] aspect-[4/5] w-full max-sm:mt-[12vw] sm:col-span-5 sm:col-start-8 sm:mt-[2vw]"
        />
      </div>
    </section>
  )
}
