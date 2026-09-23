'use client'
import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import { Rise } from '@/components/motion/Rise'
import { Lightbox } from '@/components/ui/Lightbox'
import { formatArea } from '@/lib/format'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { FloorPlan, Project } from '@/lib/data/types'

type Props = { project: Project }
type Group = { unitType: string; plans: FloorPlan[] }

/**
 * `#plans` — floor plans grouped into one tab per distinct `unitType`, so a project
 * with three plans across two unit types (BKR Lakeview Enclave: 4 BHK ×2, 5 BHK ×1) gets exactly two
 * tabs, not three. Group order follows first-appearance in `project.floorPlans`, not alphabetical, so
 * the fixtures' authored ordering (smallest unit first) survives.
 *
 * The tabs are pills: outlined at rest, filled orange with a navy label when selected — the same
 * pairing as every filled button on the site, since a tab is a clickable choice.
 *
 * Cards are cropped to `16/10` rather than the drawing's own `4/3`. The placeholder floor plans carry
 * a caption burnt into the bottom of the image; a shallower crop removes that strip while leaving the
 * whole plan inside the frame (the drawing occupies 11%–88% of the image height, and this crop takes
 * 8.3% off each end). The drawing is shown as drawn — navy line on cream, already in the palette —
 * rather than swapped for a photograph: its alt text describes a floor plan, and a photograph there
 * would be a false statement to anyone relying on it.
 *
 * `bkr-green-meadows` and `bkr-landmark-township` both ship `floorPlans: []` — an empty array is a
 * real state (plans not finalised yet), not an error, so this renders an honest status line instead of
 * an empty, unlabelled tablist.
 */
export function PlansTabs({ project }: Props) {
  const groups = useMemo<Group[]>(() => {
    const order: string[] = []
    const byType = new Map<string, FloorPlan[]>()
    for (const plan of project.floorPlans) {
      if (!byType.has(plan.unitType)) {
        order.push(plan.unitType)
        byType.set(plan.unitType, [])
      }
      byType.get(plan.unitType)!.push(plan)
    }
    return order.map((unitType) => ({ unitType, plans: byType.get(unitType)! }))
  }, [project.floorPlans])

  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = e.key === 'ArrowRight' ? (i + 1) % groups.length : (i - 1 + groups.length) % groups.length
    setActiveIndex(next)
    setZoomIndex(null)
    tabRefs.current[next]?.focus()
  }

  return (
    <section
      id="plans"
      data-plans
      className={cn('pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}
    >
      <div className="container-page">
        <Rise as="h2" className="font-heading text-h2 text-secondary max-sm:text-h2-sm">
          Plans &amp; layouts
        </Rise>
      </div>

      {groups.length === 0 ? (
        <p className="container-page mt-8 text-body text-muted">
          Floor plans for this project are being finalised and will be published here soon.
        </p>
      ) : (
        <>
          <div className="container-page mt-10">
            <div>
              <div role="tablist" aria-label="Unit types" className="flex flex-wrap gap-3">
                {groups.map((group, i) => (
                  <button
                    key={group.unitType}
                    ref={(el) => {
                      tabRefs.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`plans-tab-${i}`}
                    aria-selected={activeIndex === i}
                    aria-controls={`plans-panel-${i}`}
                    tabIndex={activeIndex === i ? 0 : -1}
                    onClick={() => {
                      setActiveIndex(i)
                      setZoomIndex(null)
                    }}
                    onKeyDown={(e) => onTabKeyDown(e, i)}
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-full border px-5 font-heading text-small transition-colors duration-300',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                      activeIndex === i
                        ? 'border-accent bg-accent text-secondary'
                        : 'border-navyLine text-secondary hover:border-accent'
                    )}
                  >
                    {group.unitType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {groups.map((group, i) => (
            <div
              key={group.unitType}
              role="tabpanel"
              id={`plans-panel-${i}`}
              aria-labelledby={`plans-tab-${i}`}
              hidden={activeIndex !== i}
              className="layout-grid mt-10 gap-y-12"
            >
              {group.plans.map((plan, planIndex) => (
                <Reveal key={plan.title} delay={planIndex * 0.06} className="col-span-12 sm:col-span-6 lg:col-span-4">
                  <button
                    type="button"
                    data-zoom
                    data-cursor="zoom"
                    aria-label={`Zoom floor plan: ${plan.title}`}
                    onClick={() => setZoomIndex(planIndex)}
                    className="group relative block aspect-[16/10] w-full overflow-clip rounded-card border border-hairline bg-offwhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                  >
                    <Image
                      src={plan.image.url}
                      alt={plan.image.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 92vw"
                      className="object-cover transition-transform duration-1000 ease-zoom group-hover:scale-105 motion-reduce:transition-none"
                    />
                    <span aria-hidden="true" className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-secondary">
                      <svg viewBox="0 0 16 16" className="h-4 w-4">
                        <path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM10.3 10.3 13.5 13.5M7 5v4M5 7h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <h3 className="mt-5 font-heading text-[20px] leading-[1.3] text-secondary">
                    {plan.title}
                  </h3>
                  <p className="mt-1 text-small text-muted">
                    {formatArea(plan.area, plan.areaUnit)}
                  </p>
                </Reveal>
              ))}

              {activeIndex === i && zoomIndex !== null && (
                <Lightbox
                  images={group.plans.map((p) => p.image)}
                  index={zoomIndex}
                  onClose={() => setZoomIndex(null)}
                />
              )}
            </div>
          ))}
        </>
      )}
    </section>
  )
}
