import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

// The eight amenity `icon` keys actually used across every fixture in `lib/data/mock.ts`.
// Each is a small stroke-only glyph, orange, `aria-hidden` — decorative only, never the
// accessible name for its `<li>`.
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
 * `#amenities` (navy) — a real `<ul>`, one `<li>` per `project.amenities`, staggered by
 * `Reveal`. Icons are decorative (`aria-hidden`); the visible amenity title is what
 * carries meaning to a screen reader, per the brief's instruction and the global
 * "icons never substitute for text" rule. An unrecognised `icon` key falls back to a
 * plain ring glyph rather than rendering nothing — none of the six fixtures needs this
 * fallback today, but it keeps a future data typo from silently dropping an amenity's
 * icon.
 */
export function Amenities({ project }: Props) {
  return (
    <section id="amenities" data-amenities className="scroll-mt-[180px] bg-navy-800 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Eyebrow className="text-champagne">Amenities</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-white">Everything You Need, Within the Gate</h2>

        {project.amenities.length === 0 ? (
          <p className="mt-8 text-body text-white/80">The amenity list for this project is being finalised.</p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {project.amenities.map((amenity, i) => (
              <Reveal key={amenity.title} delay={i * 0.05}>
                <li className="flex items-center gap-4 border-b border-white/10 pb-4">
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
                    className="shrink-0 text-orange"
                  >
                    <path d={ICON_PATHS[amenity.icon] ?? FALLBACK_PATH} />
                  </svg>
                  <span className="text-body text-white/90">{amenity.title}</span>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
