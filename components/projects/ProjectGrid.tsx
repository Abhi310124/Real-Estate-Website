'use client'
import { useEffect, useRef } from 'react'
import { ProjectCard } from './ProjectCard'
import { Button } from '@/components/ui/Button'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { getGsap } from '@/components/motion/gsap'
import type { ProjectSummary } from '@/lib/data/types'

type Props = { projects: ProjectSummary[] }

// Structural type pulled straight off the dynamically-imported module's own declared return
// type, rather than importing a named `FlipState` type that may or may not actually be exported
// under that name — `typeof import(...)` in a type position is erased at compile time, so this
// costs nothing at runtime and does not defeat getGsap()'s lazy-loading of the real module.
type FlipState = ReturnType<typeof import('gsap/Flip').Flip.getState>

/**
 * Client wrapper around the filtered grid. `app/projects/page.tsx` does the actual
 * category/status filtering server-side (see that file for why) — this component only ever
 * renders whatever `projects` it is given and uses GSAP Flip so that when a filter click swaps
 * that array for a different one, cards that appear in both the old and new result sets animate
 * to their new positions instead of the grid just snapping.
 *
 * This works with zero click/navigation interception — FilterBar stays a plain set of
 * server-rendered `<Link>`s — because React reconciles this component as an *update*, never a
 * remount, across a filter change: PageTransition.tsx (the client component every route's
 * {children} pass through) keys nothing off `useSearchParams()`, only off `usePathname()`, and
 * `/projects?category=x` -> `/projects?category=y` never changes the pathname, so `{children}`
 * never leaves the fixed slot PageTransition always renders it in. That is what lets the refs
 * below survive from one filtered render to the next.
 *
 * Layout: two columns of five on the twelve-column grid (cols 1–5 and 8–12, so the middle column
 * stays empty and the pair reads as two plates rather than a table), **vertically staggered** —
 * odd-indexed cards drop by 10vw, the same device JournalPreview uses on the home page, which
 * makes the eye travel diagonally down the listing instead of scanning rows. The stagger is a
 * `sm:mt` on odd cards rather than two hand-built columns, so it survives any number of results;
 * it is dropped below `sm`, where a single column makes an offset read as inconsistent spacing.
 */
export function ProjectGrid({ projects }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // React's commit for a given render has already mutated the DOM to *that render's* new
  // layout by the time any effect for that render runs (true even of useLayoutEffect) — so
  // "the previous layout" is only knowable if something stashed it one render earlier. This
  // pair of refs is exactly that stash: written at the end of one render's effect, read at the
  // start of the next.
  const prevStateRef = useRef<FlipState | null>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-project-card]'))

    if (reduced) {
      // Skip Flip entirely under reduced motion — the grid just re-renders. Drop any stashed
      // snapshot too, so toggling reduced motion back off mid-session can't suddenly animate a
      // diff against a now-stale layout it never saw settle.
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

      // `targets: cards` is deliberate, not decorative — GSAP's own Flip docs warn that
      // omitting it and letting Flip.from() default to the elements captured in `state` means
      // newly-rendered instances (any card that has just started matching the filter) are
      // invisible to it. Passing the live, post-render set lets Flip diff old vs. new itself:
      // elements in both fire the normal position/size tween; elements only in `cards` (new
      // matches) have no prior state to interpolate from, so Flip routes them through
      // `onEnter` instead, which is where the "fade and rise" happens.
      //
      // Elements only in the *old* snapshot (cards that stopped matching) intentionally get no
      // exit tween: React has already removed them from the DOM before this effect ever runs
      // (their removal was part of the same commit that added the new cards), so there is no
      // live element left to animate without keeping "logically removed" cards mounted an extra
      // tick.
      Flip.from(prevStateRef.current, {
        targets: cards,
        duration: 0.5,
        ease: 'power2.out',
        absolute: true,
        nested: true,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }),
      })

      prevStateRef.current = Flip.getState(cards)
    })

    return () => {
      cancelled = true
    }
  }, [projects, reduced])

  // The count is the listing's only piece of chrome, set as stamped mono metadata above the rule
  // the way the reference labels a section. Zero-padded and tabular so it does not reflow the line
  // as the filters change it, and rendered in the empty branch too — "00 Projects" above the
  // explanation is itself part of the explanation.
  const count = projects.length
  const header = (
    <div className="layout-grid mt-[5vw] max-sm:mt-[12vw]">
      <RuleDraw className="col-span-12 text-edge" />
      <p
        data-project-count={count}
        className="tnum col-span-12 mt-[1.2vw] font-mono text-mono uppercase text-muted max-sm:mt-[4vw] max-sm:text-mono-sm"
      >
        {String(count).padStart(2, '0')} {count === 1 ? 'Project' : 'Projects'}
      </p>
    </div>
  )

  if (count === 0) {
    return (
      <>
        {header}
        <div className="layout-grid mt-[4vw] max-sm:mt-[10vw]">
          <div className="col-span-12 sm:col-span-6">
            <p className="text-lead font-display max-sm:text-lead-sm">
              No projects match this combination yet.
            </p>
            <p className="mt-[1.5vw] text-body text-muted max-sm:mt-[5vw] max-sm:text-body-sm">
              Every development is filed under exactly one category and one status, so some pairings
              are simply empty — a completed plot layout is never also upcoming. Clear the filters to
              see the whole portfolio.
            </p>
            <div className="mt-[2.5vw] max-sm:mt-[8vw]">
              <Button href="/projects" tone="dark" className="max-sm:w-full">
                View all projects
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      <div
        ref={gridRef}
        className="layout-grid mt-[6vw] gap-y-[10vw] max-sm:mt-[10vw] max-sm:gap-y-[16vw]"
      >
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            className={
              i % 2 === 1
                ? 'col-span-12 sm:col-span-5 sm:col-start-8 sm:mt-[10vw]'
                : 'col-span-12 sm:col-span-5'
            }
          />
        ))}
      </div>
    </>
  )
}
