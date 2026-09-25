import { HeroMedia } from '@/components/home/HeroMedia'
import { resolvePhoto } from '@/components/project/photo'
import { LineButton } from '@/components/ui/Button'
import { HERO } from '@/lib/content/home'
import { CATEGORY_LABELS, STATUS_LABELS, describeProject } from '@/lib/format'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The opening screen: a split hero, as the layout this site follows sets it at 1440×900.
 *
 *   ┌─────────────────────────────┬─┬─────────────────────────────┐
 *   │ Creating spaces             │▒│                             │
 *   │ for lives well lived        │▒│         photograph          │
 *   │                             │▒│      (right half, full      │
 *   │ lede, 3 lines               │▒│       height of the band)   │
 *   │                             │▒│                             │
 *   │ In-View                     │▒│   ┌──────────────┐          │
 *   │ Project – Status Type …     │▒│   │ floating card│          │
 *   │ ( Discover Project ↗ )      │▒│   └──────────────┘          │
 *   └─────────────────────────────┴─┴─────────────────────────────┘
 *                                  ▲ the 8px gradient seam
 *
 * The band is one viewport tall, starting under the sticky header, so the photograph runs just past the
 * fold the way the reference's does. The project "in view" is the first featured
 * project — the owner's own showcase selector — so the headline block always points at something real,
 * and the line under the label describes it from its own status, category and locality.
 * On phones the photograph drops below the copy at a 3:4 frame, the way the reference stacks it.
 */
export function HomeHero({ project }: { project: ProjectSummary | undefined }) {
  const hero = project ? resolvePhoto(project.heroImage) : undefined

  return (
    <section data-hero className="relative overflow-x-clip lg:h-[100svh] lg:min-h-[760px]">
      <div className="layout-grid h-full">
        <div className="col-span-12 pt-9 lg:col-span-6 max-lg:pt-14">
          <h1 className="font-heading text-h1 text-secondary max-sm:text-h1-sm">
            {HERO.lines.map((line) => (
              <span key={line.text + line.accent} className="block">
                {line.text}
                {line.accent && <span className="text-accentInk">{line.accent}</span>}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-[340px] text-body text-secondary max-sm:text-[16px]">{HERO.lede}</p>

          {project && (
            <div className="mt-[92px] max-lg:mt-12">
              <p className="text-body text-navySoft">{HERO.focusLabel}</p>
              <p className="mt-4 text-small text-muted">{describeProject(project)}</p>
              <LineButton href={`/projects/${project.slug}`} className="mt-4">
                Discover {project.title}
              </LineButton>
            </div>
          )}
        </div>

        {project && hero && (
          <div className="relative max-lg:col-span-12 max-lg:mt-8 max-lg:aspect-[3/4] max-lg:max-h-[640px] lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-0">
            <HeroMedia
              src={hero.url}
              alt={hero.alt}
              eyebrow={`${project.location.area}, ${project.location.city}`}
              caption={`${CATEGORY_LABELS[project.category]} · ${STATUS_LABELS[project.status]}`}
            />
          </div>
        )}
      </div>
    </section>
  )
}
