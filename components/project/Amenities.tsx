import { Reveal } from '@/components/motion/Reveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

// The eight amenity `icon` keys actually used across every fixture in `lib/data/mock.ts`. Each is a
// small stroke-only glyph, `aria-hidden` — decoration, never the accessible name for its `<li>`.
const ICON_PATHS: Record<string, string> = {
  clubhouse: 'M4 21V10l8-6 8 6v11M9 21v-6h6v6',
  pool: 'M3 17c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0M3 12h18M6 7h3M15 7h3',
  garden: 'M12 21V9M12 9c0-4-3-6-7-6 0 4 2 7 7 7Zm0 0c0-4 3-6 7-6 0 4-2 7-7 7Z',
  'kids-play': 'M12 3l2.6 5.4 5.9.9-4.3 4.1 1 5.9L12 16.5 6.8 19.3l1-5.9-4.3-4.1 5.9-.9L12 3Z',
  gym: 'M4 8v8M20 8v8M7 6v12M17 6v12M7 12h10',
  security: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z',
  'power-backup': 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  parking: 'M6 4h6a4 4 0 0 1 0 8H9v8M9 8h3a2 2 0 1 0 0-4H9',
}
const FALLBACK_PATH = 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'

/**
 * `#amenities` — cream chapter. A real `<ul>`, one `<li>` per `project.amenities`, each row opened by
 * a drawn hairline and staggered by `Reveal`.
 *
 * Three columns of ruled rows rather than a card grid: the rule is how every other list on this site
 * is separated, and it means the row's shape comes from the grid rather than from a box drawn around
 * each item.
 *
 * The glyphs are set in `edge` (#BCBEBE), not in the body ink. They are `aria-hidden` ornament and the
 * amenity's name is what carries the meaning, so they should sit behind the text in the reading order
 * — the same reasoning as `Expertise`'s ghosted numerals on the home page, which are `hairline` for
 * exactly this reason. An unrecognised `icon` key falls back to a plain ring rather than rendering
 * nothing, so a future data typo cannot silently drop an amenity's glyph.
 *
 * `Reveal` sits INSIDE the `<li>`. It renders a `<div>`, and wrapping the `<li>` would make that div a
 * direct child of `<ul>`, which axe flags as both `list` and `listitem`.
 */
export function Amenities({ project }: Props) {
  return (
    <section
      id="amenities"
      data-amenities
      className={cn('w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-9">
          Everything You Need, Within the Gate
        </h2>
      </div>

      {project.amenities.length === 0 ? (
        <div className="layout-grid mt-[4vw] max-sm:mt-[10vw]">
          <p className="col-span-12 text-body text-muted max-sm:text-body-sm sm:col-span-5">
            The amenity list for this project is being finalised.
          </p>
        </div>
      ) : (
        <ul className="layout-grid mt-[6vw] gap-y-[2vw] max-sm:mt-[12vw] max-sm:gap-y-[6vw]">
          {project.amenities.map((amenity, i) => (
            <li key={amenity.title} className="col-span-12 sm:col-span-4">
              <RuleDraw delayMs={i * 60} className="text-edge" />
              <Reveal delay={i * 0.05} className="flex items-center gap-[1vw] pt-[1.2vw] max-sm:gap-[4vw] max-sm:pt-[4vw]">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="shrink-0 text-edge"
                >
                  <path d={ICON_PATHS[amenity.icon] ?? FALLBACK_PATH} />
                </svg>
                <span className="text-body max-sm:text-body-sm">{amenity.title}</span>
              </Reveal>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
