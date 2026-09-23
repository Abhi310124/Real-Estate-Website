import { Rise } from '@/components/motion/Rise'
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
 * `#amenities` — the layout's "Key features" block, titled for what these are: a heading, then a
 * three-up grid of cards, each a frame over a title and a line of description.
 *
 * The reference fills each frame with a photograph of the feature. There are no photographs of these
 * amenities, and a stock pool standing in for "the clubhouse" would tell a buyer something untrue, so
 * each frame holds the amenity's own glyph, large, on the tinted panel — with the brand gradient
 * drawing across its foot on hover, the same gesture as the project cards.
 *
 * A real `<ul>` with one `<li>` per amenity; the glyph is `aria-hidden` ornament and the name carries
 * the meaning. An unrecognised `icon` key falls back to a plain ring rather than rendering nothing.
 */
export function Amenities({ project }: Props) {
  return (
    <section id="amenities" data-amenities className={cn('pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
      <div className="container-page">
        <Rise as="h2" className="font-heading text-h2 text-secondary max-sm:text-h2-sm">
          Amenities
        </Rise>
      </div>

      {project.amenities.length === 0 ? (
        <p className="container-page mt-8 text-body text-muted">The amenity list for this project is being finalised.</p>
      ) : (
        <ul className="layout-grid mt-12 gap-y-12">
          {project.amenities.map((amenity) => (
            <li key={amenity.title} className="group col-span-12 sm:col-span-6 lg:col-span-4">
              <div className="relative flex aspect-[416/220] items-center justify-center overflow-clip rounded-card bg-tint">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-20 w-20 text-navySoft transition-transform duration-1000 ease-zoom group-hover:scale-110 motion-reduce:transition-none"
                >
                  <path d={ICON_PATHS[amenity.icon] ?? FALLBACK_PATH} />
                </svg>
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2">
                  <div className="bg-brand-x h-full w-0 transition-[width] duration-500 ease-door group-hover:w-full group-hover:duration-[800ms] motion-reduce:transition-none" />
                </div>
              </div>
              <p className="mt-5 font-heading text-[20px] leading-[1.3] text-secondary">{amenity.title}</p>
              {amenity.category && <p className="mt-2 text-small text-muted">{amenity.category}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
