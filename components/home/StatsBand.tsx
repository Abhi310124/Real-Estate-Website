import { Counter } from '@/components/motion/Counter'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { getSiteSettings } from '@/lib/data'

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Chapter 5 of the home page (navy-800, between CategoryGrid and CtaBand). The brief's documented
 * signature is `<StatsBand />` with no props — it fetches `settings` itself so the numbers stay
 * owner-editable (Ruling 1) without every caller having to thread them through.
 *
 * Ruling 7: each `Counter` gets both the brief's own `data-counter` (via the shared attribute
 * every instance carries, satisfying the spec's `[data-counter]` selector) and a distinct
 * `data-testid` per stat, so four identical default testids cannot trip Playwright's strict mode.
 */
export async function StatsBand() {
  const settings = await getSiteSettings()

  return (
    <section data-stats className="bg-navy-800 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Champagne text on navy is ~7.2:1 (fine, per the contrast law); this is the one section
            where the eyebrow is not navy-700, because there is no ivory here to fail against. */}
        <Eyebrow className="text-champagne">BY THE NUMBERS</Eyebrow>

        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {settings.stats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                data-counter=""
                data-testid={`stat-counter-${slugify(stat.label)}`}
                className="font-display-expanded text-display-md text-white"
              />
              <p className="mt-2 text-caption text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
