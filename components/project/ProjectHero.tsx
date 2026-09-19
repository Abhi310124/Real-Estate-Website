import Image from 'next/image'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { resolvePhoto } from './photo'
import { formatPrice } from '@/lib/format'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * Full-bleed opening for a single project, built to the same shape as `components/storey/Hero.tsx`:
 * `110svh`, one `priority` `fill` photograph, a gradient scrim, and the copy anchored a fixed
 * fraction of the *viewport height* up from the bottom.
 *
 * `110svh` is the detail that carries it. The photograph is always taller than the screen, so the
 * first content chapter is already encroaching as the visitor starts to scroll and the page reads as
 * continuous rather than paged. `svh` rather than `vh` so mobile browser chrome cannot crop it, and
 * the copy block is positioned in `svh` too — a `vw` offset inside a height-sized section pushes the
 * metadata off the bottom edge at wide-but-short viewports.
 *
 * A raw `next/image` rather than `ImageReveal`: this is unambiguously the LCP element, and the reveal
 * is a black shutter rather than a fade. `ImageReveal` covers its frame with an opaque `bg-secondary`
 * panel and takes it away in 250ms on intersection — and because that panel's rest state is
 * transparent and can only turn opaque once the reduced-motion hook has reported back, a frame this
 * far up the page paints, is covered black immediately after hydration, and then uncovers. A largest
 * paint that flashes to black after painting is the one thing worse than one that simply arrives, so
 * the shutter belongs below the fold — where `Overview` uses it, and where the gallery, the plans and
 * the construction strip do not, because each of those paints inside a control the visitor is already
 * operating and a black panel over a swiped slide reads as a broken frame rather than as a reveal.
 *
 * The scrim is stronger here than on the home hero (`/90` at the bottom rather than `/70`) because
 * what sits over it is different. The home hero puts one `text-body` line there — large text, which
 * needs only 3:1 — while this puts a row of `mono` labels at 1.1vw ≈ 16px, which needs 4.5:1. At
 * `/70` a photograph that happens to be pale at the bottom brought white-at-70% down to ~3:1.
 *
 * No `Pill` and no status chip. Over photography, `Pill`'s outlined variants resolve to `secondary`
 * or `muted` ink, which is unreadable on a dark scrim and cannot be overridden from the outside
 * (same class specificity, so which of `text-secondary`/`text-primary` wins depends on stylesheet
 * order, not on the order they are passed). Status becomes one entry in the metadata row instead,
 * which is where the rest of the project's facts already are.
 *
 * The RERA number is in that row for a legal reason, not a design one: it must be displayed, so it
 * is on screen in plain sight rather than in a footnote or behind a tooltip.
 */
/**
 * `'sold-out'` → `'Sold Out'`. Done in JS rather than with `capitalize`/`uppercase` on purpose: the
 * e2e suite asserts case-sensitively against this section's text (`/Hyderabad|Kokapet|…/`), and a
 * CSS text-transform is invisible to `textContent` but not to every way a value could later be
 * read, so casing that is meant to be part of the content belongs in the content.
 */
function titleCase(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function ProjectHero({ project }: Props) {
  const hero = resolvePhoto(project.heroImage)

  // Order is "what it is" → "where it is" → "what it costs" → "what you can buy" → the registration.
  const meta: Array<{ term: string; value: string }> = [
    { term: 'Status', value: titleCase(project.status) },
    { term: 'Typology', value: titleCase(project.category) },
    { term: 'Location', value: `${project.location.area}, ${project.location.city}` },
    { term: 'Price', value: formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest) },
    ...(project.unitTypes.length > 0 ? [{ term: 'Units', value: project.unitTypes.join(' / ') }] : []),
    { term: 'RERA', value: project.reraNumber },
  ]

  return (
    <section data-project-hero className="relative h-[110svh] w-full bg-secondary text-primary">
      <div className="absolute inset-0">
        <Image src={hero.url} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />
        {/* A gradient, not a flat wash: the copy only needs protecting at the bottom, and a flat
            overlay would mute the whole photograph, which is most of what the section is for. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/45 to-secondary/15"
        />
      </div>

      {/* Anchored in `svh`, not `vw`. The section is sized in `svh`, so a viewport-relative *width*
          offset inside it pushes the metadata strip off the bottom edge at wide-but-short viewports.
          The section is 110svh and this sits 13svh up from its bottom, which puts the block's own
          bottom edge at 97svh — inside the fold with a little air, rather than exactly on it. */}
      <div className="layout-grid absolute inset-x-0 bottom-[13svh] max-sm:bottom-[12svh]">
        <div className="col-span-12 sm:col-span-10">
          <p className="font-mono text-mono uppercase text-primary/70 max-sm:text-mono-sm">
            {project.tagline}
          </p>
          <h1 className="mt-[1.6vw] text-display-lg font-display max-sm:mt-[5vw] max-sm:text-display-sm-lg">
            {project.title}
          </h1>
        </div>

        <RuleDraw className="col-span-12 mt-[3vw] text-primary/60 max-sm:mt-[8vw]" />

        {/* The metadata strip. A definition list because that is what it is — six terms and their
            values — laid out as a row on desktop and two columns below `sm`, where six items in one
            line would each wrap to three words. */}
        <dl className="col-span-12 mt-[2vw] grid grid-cols-2 gap-x-[3vw] gap-y-[6vw] max-sm:mt-[6vw] sm:flex sm:justify-between sm:gap-x-[2vw]">
          {meta.map((entry) => (
            <div key={entry.term}>
              <dt className="font-mono text-mono uppercase text-primary/70 max-sm:text-mono-sm">{entry.term}</dt>
              <dd className="mt-[0.6vw] text-label max-sm:mt-[2vw] max-sm:text-label-sm">{entry.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
