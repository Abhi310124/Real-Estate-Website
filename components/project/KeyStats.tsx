import { Counter } from '@/components/motion/Counter'
import { RevealImage } from '@/components/motion/RevealImage'
import { Rise } from '@/components/motion/Rise'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { CATEGORY_LABELS, STATUS_LABELS, formatPrice } from '@/lib/format'
import { resolvePhoto } from './photo'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * `data-key-stats` — "Key figures", as the layout sets it: the heading in the left three columns, and
 * to its right a row of labelled facts (type of project, status and — ours — price, units and the RERA
 * registration), the project's own headline numbers counting up, and a large photograph.
 *
 * Every `Counter` keeps the shared `data-counter` attribute the e2e suite selects on, plus a distinct
 * `data-testid` so several on one page never trip Playwright's strict mode.
 *
 * The photograph is the project's second gallery frame (the first is the gallery's own opener),
 * falling back to the hero for a project with a short gallery.
 */
export function KeyStats({ project }: Props) {
  const image = resolvePhoto(project.gallery[1] ?? project.gallery[0] ?? project.heroImage, 1)
  const facts = [
    { term: 'Type of Project', value: CATEGORY_LABELS[project.category] },
    { term: 'Status', value: STATUS_LABELS[project.status] },
    { term: 'Price', value: formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest) },
    ...(project.unitTypes.length > 0 ? [{ term: 'Units', value: project.unitTypes.join(' / ') }] : []),
    ...(project.reraNumber ? [{ term: 'TS RERA', value: project.reraNumber }] : []),
  ]

  return (
    <section data-key-stats className="layout-grid gap-y-10 pb-32 max-lg:pb-20">
      <Rise as="h2" className="col-span-12 font-heading text-h2 text-secondary max-sm:text-h2-sm lg:col-span-3">
        Key figures
      </Rise>

      <div className="col-span-12 lg:col-span-9">
        <dl className="flex flex-wrap gap-x-14 gap-y-6 pt-2">
          {facts.map((fact) => (
            <div key={fact.term}>
              <dt className="text-body font-medium text-navySoft">{fact.term}</dt>
              <dd className="mt-1 text-body text-secondary">{fact.value}</dd>
            </div>
          ))}
        </dl>

        {project.keyStats.length > 0 ? (
          <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-hairline pt-10 lg:grid-cols-4">
            {project.keyStats.map((stat) => (
              <li key={stat.label}>
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  data-counter=""
                  data-testid={`key-stat-${slugify(stat.label)}`}
                  className="block font-heading text-h2 text-secondary tabular-nums max-sm:text-h2-sm"
                />
                <p className="mt-2 text-small text-muted">{stat.label}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-14 text-body text-muted">Key figures for this project are being finalised and will be published here soon.</p>
        )}

        <Tilt3D className="mt-14 lg:w-[88%]" max={3}>
          <RevealImage src={image.url} alt={image.alt} sizes="(max-width: 1023px) 100vw, 61vw" className="aspect-[880/700] rounded-card" />
        </Tilt3D>
      </div>
    </section>
  )
}
