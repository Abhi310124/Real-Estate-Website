'use client'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#specifications` — an accordion over `project.specifications`, one panel per category, ruled with
 * hairlines: the heading in the left three columns, the list in the other nine, the way the layout
 * sets its "Key figures" and "Location" blocks.
 *
 * The first category is open by default. The click handler sets `openIndex` to the clicked index
 * unconditionally rather than toggling it: a toggle would close the first panel again the moment a
 * visitor clicks that already-open item, which conflicts with "open the first by default". So there is
 * always exactly one open panel — an intentional simplification.
 *
 * The marker is an orange disc whose `+` turns to `×`; the panel is shown and hidden with the `hidden`
 * attribute rather than an animated height, which keeps closed panels out of the accessibility tree.
 */
export function Specifications({ project }: Props) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="specifications" data-specs className={cn('layout-grid gap-y-10 pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
      <h2 className="col-span-12 font-heading text-h2 text-secondary max-sm:text-h2-sm lg:col-span-3">Specifications</h2>

      {project.specifications.length === 0 ? (
        <p className="col-span-12 text-body text-muted lg:col-span-9">Detailed specifications for this project will be published here soon.</p>
      ) : (
        <div className="col-span-12 border-t border-hairline lg:col-span-9">
          {project.specifications.map((spec, i) => {
            const isOpen = openIndex === i
            const panelId = `spec-panel-${i}`
            const buttonId = `spec-button-${i}`
            return (
              <div key={spec.category} className="border-b border-hairline">
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(i)}
                  className="flex min-h-11 w-full items-center justify-between gap-6 py-6 text-left font-heading text-h4 text-secondary transition-colors duration-300 hover:text-accentInk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary max-sm:text-h4-sm"
                >
                  {spec.category}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-secondary transition-transform duration-500 ease-door motion-reduce:transition-none',
                      isOpen && 'rotate-45'
                    )}
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
                      <path d="M8 2.5v11M2.5 8h11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="pb-8">
                  <ul className="grid gap-x-10 gap-y-3 md:grid-cols-2">
                    {spec.items.map((item) => (
                      <li key={item} className="flex gap-3 text-body text-secondary">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
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
    </section>
  )
}
