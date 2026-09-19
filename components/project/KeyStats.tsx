import { Counter } from '@/components/motion/Counter'
import { RuleDraw } from '@/components/motion/RuleDraw'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * `data-key-stats` — the first navy chapter: the project's own headline figures (land area, unit
 * count, possession year) as display-scale numerals with mono labels.
 *
 * Two-up rather than four-up, which is a typographic constraint rather than a preference. At
 * `display-lg` (7vw ≈ 100px) a value like "40 ft wide" is roughly 500px; three columns of the
 * 12-column grid is 335px at 1440, so a four-across row would either overflow or force the numerals
 * down to a size at which they stop being the point of the section. Six columns is 690px, which
 * every value in the fixtures fits inside. It also keeps working for the projects that ship three
 * stats rather than four.
 *
 * Each row is separated by a drawn hairline, staggered — the same rhythm as `Expertise`'s rows on
 * the home page, and the reason a stats band here reads as part of the same document rather than as
 * a widget dropped into it.
 *
 * Every `Counter` keeps the shared `data-counter` attribute the e2e suite selects on, plus a
 * distinct `data-testid`: `Counter`'s own default testid is a single fixed string, which several
 * instances on one page would otherwise share and trip Playwright's strict mode over.
 */
export function KeyStats({ project }: Props) {
  // No fixture ships an empty `keyStats`, but the section still renders in that case rather than
  // returning null: `data-key-stats` is a hook the e2e suite selects on, and a section that
  // sometimes does not exist is a harder thing to reason about than one that says so. Same shape as
  // the honest one-line status every other optional section here renders.
  if (project.keyStats.length === 0) {
    return (
      <section data-key-stats className="w-full bg-secondary py-[8vw] text-primary max-sm:py-[16vw]">
        <div className="layout-grid">
          <p className="col-span-12 text-body text-primary/80 max-sm:text-body-sm sm:col-span-6">
            Key figures for this project are being finalised and will be published here soon.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section data-key-stats className="w-full bg-secondary py-[8vw] text-primary max-sm:py-[16vw]">
      <ul className="layout-grid gap-y-[6vw] max-sm:gap-y-[12vw]">
        {project.keyStats.map((stat, i) => (
          <li key={stat.label} className="col-span-12 sm:col-span-6">
            <RuleDraw delayMs={i * 90} className="text-primary/30" />
            <Counter
              value={stat.value}
              suffix={stat.suffix}
              data-counter=""
              data-testid={`key-stat-${slugify(stat.label)}`}
              className="mt-[2vw] block text-display-lg font-display tabular-nums max-sm:mt-[6vw] max-sm:text-display-sm-lg"
            />
            <p className="mt-[1.4vw] font-mono text-mono uppercase text-primary/70 max-sm:mt-[4vw] max-sm:text-mono-sm">
              {stat.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
