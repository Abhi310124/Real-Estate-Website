'use client'
import { useState } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#specifications` (ivory) — accordion over `project.specifications`, one panel per
 * category. The first category is open by default (the brief's own instruction). The
 * click handler sets `openIndex` to the clicked index unconditionally rather than
 * toggling it: a toggle would close the first panel again the moment a visitor (or the
 * e2e test) clicks that already-open first item, which conflicts with both "open the
 * first by default" and the test's click-then-still-`aria-expanded="true"` assertion on
 * that same first button. One consequence of "set, don't toggle": there is always
 * exactly one open panel, never zero — an intentional simplification, not an oversight,
 * since the brief never asks for a fully-collapsed state.
 */
export function Specifications({ project }: Props) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="specifications" data-specs className="scroll-mt-[180px] bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <Eyebrow className="text-orange">Specifications</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-navy-800">Built to Last</h2>

        {project.specifications.length === 0 ? (
          <p className="mt-8 text-body text-navy-700">
            Detailed specifications for this project will be published here soon.
          </p>
        ) : (
          <div className="mt-10 divide-y divide-navy-800/10 border-y border-navy-800/10">
            {project.specifications.map((spec, i) => {
              const isOpen = openIndex === i
              const panelId = `spec-panel-${i}`
              const buttonId = `spec-button-${i}`
              return (
                <div key={spec.category}>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(i)}
                    className="flex min-h-11 w-full items-center justify-between gap-4 py-5 text-left font-semibold text-navy-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                  >
                    {spec.category}
                    <span
                      aria-hidden="true"
                      className={cn('shrink-0 text-xl leading-none text-orange transition-transform', isOpen && 'rotate-45')}
                    >
                      +
                    </span>
                  </button>
                  <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="pb-6">
                    <ul className="space-y-2">
                      {spec.items.map((item) => (
                        <li key={item} className="flex gap-3 text-body text-navy-700">
                          <span aria-hidden="true" className="text-orange">
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
        )}
      </div>
    </section>
  )
}
