import { ImageReveal } from '@/components/motion/ImageReveal'
import { Reveal } from '@/components/motion/Reveal'
import { SplitWords } from '@/components/motion/SplitWords'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#overview` (ivory) — the first content chapter below `ProjectHero`. A decorative,
 * rotated "OVERVIEW" side label runs the height of the text column: champagne-on-ivory
 * is ~2.2:1 and would fail AA as real text, which is exactly why this is `aria-hidden`
 * ornament rather than the section's accessible name — the `<h2>` right beside it is
 * what a screen reader actually announces, and it is real navy-on-ivory text. Uses the
 * project's own first gallery photo (no dedicated "overview image" field exists on
 * `Project`), falling back to the hero image for a project with an empty gallery.
 */
export function Overview({ project }: Props) {
  const image = project.gallery[0] ?? project.heroImage

  return (
    <section id="overview" className="scroll-mt-[180px] bg-ivory py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[auto_1fr_1fr] lg:gap-16 lg:px-10">
        {/* navy-700, not champagne. Task 14's brief called this side label "decorative" and
            therefore exempt from the contrast rule, but champagne on ivory is 2.20:1 and axe
            flagged it — correctly. Marking text aria-hidden hides it from assistive tech; it
            does not make it legible to a sighted reader with low vision, and this label is
            plainly meant to be read. Our own rule already says champagne on ivory is decoration
            only, never text, so the original was in breach of it. It still reads as ornament
            because it is small, letter-spaced and rotated — the colour was never what made it
            subtle. */}
        <span
          aria-hidden="true"
          className="eyebrow hidden shrink-0 text-sm tracking-[0.3em] text-navy-700 lg:block"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          OVERVIEW
        </span>

        <div>
          <SplitWords as="h2" text="Overview" className="font-display-expanded text-display-md text-navy-800" />
          <div className="mt-6 space-y-4">
            {project.overview.map((paragraph, i) => (
              <Reveal key={paragraph.slice(0, 24) + i} delay={i * 0.08}>
                <p className="text-body text-navy-700">{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <ImageReveal
          src={image.url}
          alt={image.alt}
          data-testid="overview-image-reveal"
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="aspect-[4/5] w-full rounded-sm lg:aspect-auto"
        />
      </div>
    </section>
  )
}
