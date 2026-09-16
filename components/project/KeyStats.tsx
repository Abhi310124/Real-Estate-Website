import { Counter } from '@/components/motion/Counter'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * `data-key-stats` — a plain ivory-warm band of the project's own `keyStats` (land area,
 * unit count, possession date, and similar headline figures), one `Counter` per stat.
 * Follows the exact `data-counter` + per-instance `data-testid` convention
 * `components/home/StatsBand.tsx` already established (Ruling 8): every `Counter` gets
 * the shared `data-counter` attribute the briefs' tests select on, plus a distinct
 * `data-testid` so multiple Counters on one page never collide under Playwright's strict
 * mode — `Counter`'s own default testid is a single fixed string, which two or more
 * instances on one page would otherwise share.
 */
export function KeyStats({ project }: Props) {
  return (
    <section data-key-stats className="bg-ivory-warm py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {project.keyStats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                data-counter=""
                data-testid={`key-stat-${slugify(stat.label)}`}
                className="font-display-expanded text-display-md text-navy-800"
              />
              <p className="mt-2 text-caption text-navy-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
