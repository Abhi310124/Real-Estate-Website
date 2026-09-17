'use client'
import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Lightbox } from '@/components/ui/Lightbox'
import { formatArea } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { FloorPlan, Project } from '@/lib/data/types'

type Props = { project: Project }
type Group = { unitType: string; plans: FloorPlan[] }

/**
 * `#plans` (ivory) — floor plans grouped into one tab per distinct `unitType`, so a
 * project with three plans across two unit types (BKR Lakeview Enclave: 4 BHK x2, 5 BHK
 * x1) gets exactly two tabs, not three. Group order follows first-appearance in
 * `project.floorPlans`, not alphabetical, so the fixture's authored ordering (smallest
 * unit first) survives.
 *
 * `bkr-green-meadows` and `bkr-landmark-township` both ship `floorPlans: []` — an empty
 * array is a real state (plans not finalised yet), not an error, so this renders an
 * honest status line instead of an empty, unlabelled tablist.
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
    <section id="plans" data-plans className="scroll-mt-[180px] bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Eyebrow className="text-orange">Floor Plans</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-navy-800">Plans &amp; Layouts</h2>

        {groups.length === 0 ? (
          <p className="mt-8 text-body text-navy-700">
            Floor plans for this project are being finalised and will be published here soon.
          </p>
        ) : (
          <>
            <div role="tablist" aria-label="Unit types" className="mt-8 flex gap-2 border-b border-navy-800/10">
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
                    'min-h-11 border-b-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
                    activeIndex === i
                      ? 'border-orange text-navy-800'
                      : 'border-transparent text-navy-700/70 hover:text-navy-800',
                  )}
                >
                  {group.unitType}
                </button>
              ))}
            </div>

            {groups.map((group, i) => (
              <div
                key={group.unitType}
                role="tabpanel"
                id={`plans-panel-${i}`}
                aria-labelledby={`plans-tab-${i}`}
                hidden={activeIndex !== i}
                className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {group.plans.map((plan, planIndex) => (
                  <Reveal key={plan.title} delay={planIndex * 0.06}>
                    <div className="overflow-hidden rounded-sm bg-ivory-warm">
                      <button
                        type="button"
                        data-zoom
                        data-cursor="zoom"
                        aria-label={`Zoom floor plan: ${plan.title}`}
                        onClick={() => setZoomIndex(planIndex)}
                        className="relative block aspect-[4/3] w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                      >
                        <Image
                          src={plan.image.url}
                          alt={plan.image.alt}
                          fill
                          sizes="(min-width: 1024px) 33vw, 90vw"
                          className="object-cover"
                        />
                      </button>
                      <div className="p-4">
                        <h3 className="font-semibold text-navy-800">{plan.title}</h3>
                        <p className="mt-1 text-sm text-navy-700">{formatArea(plan.area, plan.areaUnit)}</p>
                      </div>
                    </div>
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
      </div>
    </section>
  )
}
