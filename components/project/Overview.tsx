import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#overview` — the paragraph that follows the hero, as the layout sets it: the project's first
 * overview paragraph at the 26px lede step, starting at the fourth column and running to the margin,
 * with anything further set as body copy beneath it in a readable measure.
 *
 * There is no heading on the page for this block, as on the reference; the section nav carries its
 * name ("Overview"), and an sr-only heading keeps the document outline whole for assistive technology.
 */
export function Overview({ project }: Props) {
  const [lede, ...rest] = project.overview

  return (
    <section id="overview" className={cn('layout-grid py-32 max-lg:py-20', SECTION_SCROLL_MT)}>
      <h2 className="sr-only">Overview</h2>
      <div className="col-span-12 lg:col-span-9 lg:col-start-4">
        {lede && <p className="font-heading text-lede text-secondary max-sm:text-lede-sm">{lede}</p>}
        {rest.length > 0 && (
          <div className="mt-10 max-w-[760px] space-y-5 text-body text-secondary">
            {rest.map((paragraph, i) => (
              <p key={paragraph.slice(0, 24) + i}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
