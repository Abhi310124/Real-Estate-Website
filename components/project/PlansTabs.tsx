'use client'
import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { Lightbox } from '@/components/ui/Lightbox'
import { formatArea } from '@/lib/format'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { FloorPlan, Project } from '@/lib/data/types'

type Props = { project: Project }
type Group = { unitType: string; plans: FloorPlan[] }

/**
 * `#plans` — white chapter. Floor plans grouped into one tab per distinct `unitType`, so a project
 * with three plans across two unit types (BKR Lakeview Enclave: 4 BHK ×2, 5 BHK ×1) gets exactly two
 * tabs, not three. Group order follows first-appearance in `project.floorPlans`, not alphabetical, so
 * the fixtures' authored ordering (smallest unit first) survives.
 *
 * The tabs are mono labels over a hairline, and the active one is marked by ink weight plus a rule
 * directly beneath it. Nothing is filled, tinted or rounded — this is the same treatment `SectionNav`
 * uses for its current item, which is what stops the page having two unrelated idioms for "this is
 * the thing you are looking at".
 *
 * Cards are cropped to `16/10` rather than the drawing's own `4/3`. The placeholder floor plans carry
 * a caption burnt into the bottom of the image; a shallower crop removes that strip while leaving the
 * whole plan inside the frame (the drawing occupies 11%–88% of the image height, and this crop takes
 * 8.3% off each end). The drawing itself is rendered `grayscale` rather than swapped for a photograph
 * — its alt text describes a floor plan, and a photograph there would be a false statement to anyone
 * relying on it.
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
      className={cn('w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          Plans &amp; Layouts
        </h2>
      </div>

      {groups.length === 0 ? (
        <div className="layout-grid mt-[4vw] max-sm:mt-[10vw]">
          <p className="col-span-12 text-body text-muted max-sm:text-body-sm sm:col-span-5">
            Floor plans for this project are being finalised and will be published here soon.
          </p>
        </div>
      ) : (
        <>
          <div className="layout-grid mt-[6vw] max-sm:mt-[12vw]">
            {/* The divider sits ABOVE the tab row, not below it. A rule under the row would land
                flush against the active tab's own underline and read as an accidental 2px double
                line — and the active item's mark is the only rule that needs to be there, since it
                is what carries the state. */}
            <RuleDraw className="col-span-12 text-edge" />

            <div className="col-span-12 mt-[1.6vw] max-sm:mt-[5vw]">
              <div role="tablist" aria-label="Unit types" className="flex gap-[2vw] max-sm:gap-[6vw]">
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
                      'relative inline-flex min-h-11 items-center rounded-none font-mono text-mono uppercase',
                      'transition-colors duration-150 ease-in-out',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
                      'max-sm:text-mono-sm',
                      activeIndex === i ? 'text-secondary' : 'text-muted hover:text-secondary'
                    )}
                  >
                    {group.unitType}
                    {activeIndex === i && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 bg-current"
                        style={{ height: 'max(0.1vw, 1px)' }}
                      />
                    )}
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
              className="layout-grid mt-[4vw] gap-y-[4vw] max-sm:mt-[10vw] max-sm:gap-y-[10vw]"
            >
              {group.plans.map((plan, planIndex) => (
                <Reveal key={plan.title} delay={planIndex * 0.06} className="col-span-12 sm:col-span-4">
                  <button
                    type="button"
                    data-zoom
                    data-cursor="zoom"
                    aria-label={`Zoom floor plan: ${plan.title}`}
                    onClick={() => setZoomIndex(planIndex)}
                    className="relative block aspect-[16/10] w-full overflow-hidden rounded-none border border-hairline bg-offwhite focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                  >
                    <Image
                      src={plan.image.url}
                      alt={plan.image.alt}
                      fill
                      sizes="(min-width: 640px) 33vw, 92vw"
                      className="object-cover grayscale"
                    />
                  </button>
                  <h3 className="mt-[1.4vw] text-lead max-sm:mt-[4vw] max-sm:text-lead-sm">
                    {plan.title}
                  </h3>
                  <p className="mt-[0.6vw] font-mono text-mono uppercase text-muted max-sm:mt-[2vw] max-sm:text-mono-sm">
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
