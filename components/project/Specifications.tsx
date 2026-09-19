'use client'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#specifications` — black chapter. An accordion over `project.specifications`, one panel per
 * category, separated by hairlines rather than boxed into cards.
 *
 * The first category is open by default. The click handler sets `openIndex` to the clicked index
 * unconditionally rather than toggling it: a toggle would close the first panel again the moment a
 * visitor (or the e2e test) clicks that already-open first item, which conflicts with both "open the
 * first by default" and the test's click-then-still-`aria-expanded="true"` assertion on that same
 * button. One consequence of "set, don't toggle" is that there is always exactly one open panel and
 * never zero — an intentional simplification, not an oversight.
 *
 * The `+` marker rotating to `×` is the only animation here, and it is a `transform`, so it costs
 * nothing to composite and is disabled wholesale under `prefers-reduced-motion` by
 * `motion-reduce:transition-none`. The panel itself is shown and hidden with the `hidden` attribute
 * rather than an animated height: an auto-height transition needs a measured pixel height, and
 * `hidden` is what keeps the closed panels genuinely out of the accessibility tree.
 */
export function Specifications({ project }: Props) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section
      id="specifications"
      data-specs
      className={cn('w-full bg-secondary py-[8vw] text-primary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          Built to Last
        </h2>
      </div>

      {project.specifications.length === 0 ? (
        <div className="layout-grid mt-[4vw] max-sm:mt-[10vw]">
          <p className="col-span-12 text-body text-primary/70 max-sm:text-body-sm sm:col-span-5">
            Detailed specifications for this project will be published here soon.
          </p>
        </div>
      ) : (
        <div className="layout-grid mt-[6vw] max-sm:mt-[12vw]">
          <div className="col-span-12 border-t border-primary/25">
            {project.specifications.map((spec, i) => {
              const isOpen = openIndex === i
              const panelId = `spec-panel-${i}`
              const buttonId = `spec-button-${i}`
              return (
                <div key={spec.category} className="border-b border-primary/25">
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(i)}
                    className="flex min-h-11 w-full items-center justify-between gap-[2vw] rounded-none py-[1.6vw] text-left text-lead focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-sm:py-[5vw] max-sm:text-lead-sm"
                  >
                    {spec.category}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'shrink-0 text-lead leading-none transition-transform duration-300 ease-in-out motion-reduce:transition-none max-sm:text-lead-sm',
                        isOpen && 'rotate-45'
                      )}
                    >
                      +
                    </span>
                  </button>

                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="pb-[2.4vw] max-sm:pb-[6vw]">
                    {/* Items sit in the right-hand half of the row, indented off the category name —
                        the same "term left, detail right" split the rest of the page uses, and it
                        keeps the measure narrow enough to read at `text-body`. */}
                    <ul className="space-y-[0.8vw] max-sm:space-y-[3vw] sm:w-1/2">
                      {spec.items.map((item) => (
                        <li
                          key={item}
                          className="flex gap-[0.8vw] text-body text-primary/80 max-sm:gap-[3vw] max-sm:text-body-sm"
                        >
                          <span aria-hidden="true" className="text-primary/40">
                            —
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
