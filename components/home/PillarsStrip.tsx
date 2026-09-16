import { Reveal } from '@/components/motion/Reveal'
import { Marquee } from '@/components/motion/Marquee'
import type { SiteSettings } from '@/lib/data'

type Props = { settings: SiteSettings }

// One simple orange circle line-icon per pillar (Develop / Design / Deliver, in that
// fixed order — the brand's three pillars, not an open-ended list). Plain inline SVG,
// stroke-only: orange is explicitly allowed for icons regardless of background contrast
// (Ruling 9's contrast law carves out "display/rules/icons/filled-buttons" from the
// AA-body-text restriction), so no new icon-set dependency is needed for three glyphs.
const PILLAR_GLYPHS: React.ReactNode[] = [
  // Develop — an ascending line into an arrow corner: growth.
  <path
    key="develop"
    d="M15 29 L22 21 L27 25 L34 16 M28 16 H34 V22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // Design — a compass-needle diamond: planning and precision.
  <path
    key="design"
    d="M24 14 L30 30 L24 27 L18 30 Z M24 14 V10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  // Deliver — a checkmark: handed over, complete.
  <path
    key="deliver"
    d="M15 24 L21 30 L33 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
]

function PillarIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-12 w-12 text-orange">
      <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {PILLAR_GLYPHS[index % PILLAR_GLYPHS.length]}
    </svg>
  )
}

/**
 * The strip directly beneath the hero: three Reveal-staggered columns naming BKR's
 * Develop / Design / Deliver pillars, then a champagne-on-navy Marquee of the five
 * project categories. `settings.pillars` and `settings.categories` are both real content
 * (Task 2's SiteSettings), not placeholder copy.
 */
export function PillarsStrip({ settings }: Props) {
  return (
    <section data-pillars className="bg-navy-800 py-24 text-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-3">
        {settings.pillars.map((pillar, i) => (
          <Reveal
            key={pillar.title}
            delay={i * 0.12}
            className="flex flex-col items-center text-center md:items-start md:text-left"
          >
            <PillarIcon index={i} />
            <h3 className="mt-6 font-display-expanded text-display-md text-white">{pillar.title}</h3>
            <p className="mt-3 text-body text-white/80">{pillar.description}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 border-t border-white/10 pt-10">
        {/* Champagne on navy: 7.2:1, explicitly clear of AA even at this size. */}
        <Marquee speed={40} className="text-lg font-display-expanded text-champagne">
          {settings.categories.map((c) => (
            <span key={c.value} className="mx-8">
              {c.label}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
