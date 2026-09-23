'use client'
import { useEffect, useRef } from 'react'
import { ProjectTile } from './ProjectTile'
import { Button } from '@/components/ui/Button'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { getGsap } from '@/components/motion/gsap'
import type { ProjectSummary } from '@/lib/data/types'

type Props = { projects: ProjectSummary[] }

type FlipState = ReturnType<typeof import('gsap/Flip').Flip.getState>

/**
 * The filtered listing: project cards two to a row, the layout's listing grid.
 *
 * `app/projects/page.tsx` does the filtering server-side; this only renders what it is given, and uses
 * GSAP Flip so that when a filter click swaps the list, cards present in both the old and the new set
 * glide to their new places while new matches fade up, instead of the grid snapping.
 *
 * That works with no click interception — the filters stay plain links — because a filter change only
 * changes the query string, never the pathname, so React reconciles this component as an update rather
 * than a remount, and the refs below survive from one filtered render to the next. Every card is a
 * direct child of one grid for the same reason: a card that moved into a different row wrapper would
 * be a new DOM node, and Flip would lose the survivor it is meant to move.
 */
export function ProjectGrid({ projects }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // The DOM has already been mutated to the new layout by the time any effect runs, so the previous
  // layout is only knowable if it was stashed one render earlier.
  const prevStateRef = useRef<FlipState | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-project-card]'))

    if (reduced) {
      prevStateRef.current = null
      isFirstRender.current = false
      return
    }

    let cancelled = false
    getGsap().then(({ gsap, Flip }) => {
      if (cancelled) return

      if (isFirstRender.current || !prevStateRef.current) {
        isFirstRender.current = false
        prevStateRef.current = Flip.getState(cards)
        return
      }

      Flip.from(prevStateRef.current, {
        targets: cards,
        duration: 0.6,
        ease: 'door',
        absolute: true,
        nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }),
      })

      prevStateRef.current = Flip.getState(cards)
    })

    return () => {
      cancelled = true
    }
  }, [projects, reduced])

  if (projects.length === 0) {
    return (
      <div className="layout-grid mt-16">
        <div className="col-span-12 md:col-span-7">
          <p className="font-heading text-h4 text-secondary max-sm:text-h4-sm">No projects match this combination yet.</p>
          <p className="mt-4 text-body text-muted">
            Every development is filed under exactly one category and one status, so some pairings are simply empty — a
            completed plot layout is never also upcoming. Clear the filters to see the whole portfolio.
          </p>
          <Button href="/projects#our-projects" className="mt-8">
            View all projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div ref={gridRef} className="layout-grid mt-14 items-start gap-y-16 max-lg:mt-10 max-lg:gap-y-12">
      {projects.map((project) => (
        <ProjectTile key={project.slug} project={project} className="col-span-12 md:col-span-6" />
      ))}
    </div>
  )
}
