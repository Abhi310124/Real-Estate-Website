'use client'
import { useEffect, useRef } from 'react'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { ImageRing3D } from '@/components/motion/ImageRing3D'
import { SplitLines } from '@/components/motion/SplitLines'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { ringItems } from '@/components/studio/ringItems'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { STUDIO_PROCESS } from '@/lib/content/studio'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * Cream chapter: five process steps travelling past a column that stays fixed, with the second image
 * ring drifting behind them.
 *
 * This is the only real pin on the site, and the longest single section on any route: the pinned
 * column is 110svh (990px at a 900px viewport) and it is held for 4,500px of scroll, which makes the
 * section about 6,100px tall — a fifth of the route. That length is the effect. A reader spends five
 * screenfuls with one image and one sentence fixed in the right-hand column while five numbered steps
 * rise past it on the left, so the steps are read AGAINST something rather than in sequence with each
 * other.
 *
 * ## The wrapper div is load-bearing and must not be flattened away
 *
 * GSAP pins by wrapping the pinned element in a `div.pin-spacer` of its own making — it inserts that
 * div into the DOM and moves the element inside it. React knows nothing about the new parent, so if
 * React is ever the one to remove the pinned element, its `removeChild` runs against a parent that no
 * longer holds the child and throws `NotFoundError`, which in this app surfaced as the whole route
 * dying with "This page couldn't load". A pin has already done exactly that here once.
 *
 * The fix is the structure below: a plain wrapper `div` that React owns and GSAP never touches, with
 * the pinned element as its only child. React's deletions then always target the wrapper (or something
 * above it), never the element GSAP reparented, and the `pin-spacer` lives harmlessly inside a box
 * React treats as having one static child. **Do not collapse these two divs into one, do not render
 * the pinned child conditionally, and do not give the wrapper a second child** — each of those puts
 * the crash back.
 *
 * The wrapper is also what carries the grid placement (`col-start-8 col-span-4`). GSAP copies size and
 * margin onto the spacer but not the grid-column classes, so pinning a direct grid item would leave
 * the spacer auto-placed in column 1 and the layout would jump by a third of the page the moment the
 * chunk resolved.
 *
 * ## The pin's own numbers
 *
 * `start: 'top top'`, `end: '+=' + 5 * innerHeight`, `pinSpacing: true`. The reference's spacer
 * measures 5,490px around a 990px child, i.e. 4,500px of pin at the 900px viewport it was measured
 * at — exactly five viewport heights, which is why the distance is expressed that way and re-evaluated
 * on refresh rather than hard-coded. `pinSpacing: true` is what makes the section grow by the pin
 * distance instead of the pinned column sliding over the content beneath it.
 *
 * `gsap.matchMedia` rather than a bare `ScrollTrigger.create`, for two reasons: the right-hand column
 * does not exist below `sm` (the layout is a single stack there, and pinning something for five
 * screens on a phone is a scroll trap, not a composition), and `matchMedia` reverts its own setup when
 * the query stops matching, so a desktop-to-mobile resize unpins cleanly instead of leaving a fixed
 * column over a stacked page. `ScrollTrigger.refresh()` after teardown because removing 4,500px of
 * pin spacing moves every trigger below this section.
 *
 * ## The ring
 *
 * `absolute top-[20vw] -left-1/2`, which is the reference's own placement for the second stage, inside
 * an `absolute inset-0 overflow-clip` layer rather than directly in the section. The layer exists
 * because the ring's eight cells are tilted 85° under a 132vw perspective and project thousands of
 * pixels outside their own box — scrollable overflow that would put a horizontal scrollbar on the
 * document. Clipping it here rather than on the section keeps the clip off the pinned column's
 * ancestry: `position: fixed` inside a clipped ancestor is a class of bug worth not inviting.
 *
 * `pointer-events-none` on that layer with `pointer-events-auto` on each ring tile (inside
 * `ImageRing3D`) is what keeps the eight links clickable while the 1647px stage does not blanket the
 * section in an invisible hit area. The content sits at `z-20` so a 40%-opacity plane crossing a
 * column can never take the type with it.
 */

/** Pin distance as a multiple of the viewport height: 5 x 900 = the measured 4,500px. */
const PIN_VIEWPORTS = 5

export function StudioProcess({ projects }: { projects: ProjectSummary[] }) {
  const pinned = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const column = pinned.current
    if (reduced || !column) return

    let cancelled = false
    let kill: (() => void) | undefined

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return

        const media = gsap.matchMedia()
        media.add('(min-width: 640px)', () => {
          const trigger = ScrollTrigger.create({
            trigger: column,
            start: 'top top',
            // Function-based so a resize re-reads the viewport rather than keeping a distance
            // computed from the width before last.
            end: () => `+=${window.innerHeight * PIN_VIEWPORTS}`,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
          })
          return () => trigger.kill()
        })

        kill = () => {
          // `revert()` runs the cleanup above and restores the DOM GSAP rearranged, which is what
          // puts the pinned column back inside the wrapper before React can be asked to touch it.
          media.revert()
          ScrollTrigger.refresh()
        }
      })
      .catch((err) => {
        // Degrades to exactly the markup below: the column sits in flow at its natural height and
        // the section is ~4,500px shorter. Nothing was hidden or displaced before the chunk resolved,
        // so there is nothing to undo — but the route's longest chapter silently losing its structure
        // is worth seeing in a console.
        console.error('[StudioProcess] column pin unavailable; the section renders unpinned', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <section
      data-studio-process
      className="relative z-10 w-full bg-primary py-[calc(var(--gutter)*4)] pb-[40vw] text-secondary"
    >
      {/* Not `aria-hidden`, despite being decorative in intent: the eight tiles inside are links, and
          a focusable control inside an aria-hidden container is both a WCAG 4.1.2 failure and an axe
          violation. It is `pointer-events-none` instead, with the tiles restoring their own
          `pointer-events-auto`, so the 1647px stage cannot blanket the section in a hit area while the
          eight links stay operable by pointer and by keyboard alike. */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-clip">
        <div className="absolute -left-1/2 top-[20vw] h-fit w-fit">
          <ImageRing3D items={ringItems(projects)} />
        </div>
      </div>

      <div className="layout-grid relative z-20 items-start">
        <Eyebrow className="col-span-12">{STUDIO_PROCESS.eyebrow}</Eyebrow>

        <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-7">
          {STUDIO_PROCESS.heading}
        </h2>

        <SplitLines
          text={STUDIO_PROCESS.intro}
          className="col-span-12 mt-[2.5vw] text-body text-muted max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>

      <div className="layout-grid relative z-20 mt-[10vw] items-start max-sm:mt-[14vw]">
        {/* Columns 1-5, the moving half of the section. The 40vw pitch is what spends the pin: five
            steps at ~218px each plus four 576px gaps is 3,394px of column, and adding the 900px of
            viewport the last step has to travel through puts the left half's exhaustion within 200px
            of the pin's 4,500px release. At a tighter pitch the steps finish a screen early and the
            reader watches a still frame; at a looser one the column releases mid-step. */}
        <ol className="col-span-12 sm:col-span-5">
          {STUDIO_PROCESS.steps.map((step, i) => (
            <li
              key={step.n}
              className={`border-t border-edge pt-[var(--gutter)] ${i === 0 ? '' : 'mt-[40vw] max-sm:mt-[20vw]'}`}
            >
              <span aria-hidden="true" className="block font-mono text-mono-lg text-muted max-sm:text-lead-sm">
                {step.n}
              </span>
              <h3 className="mt-[2vw] text-lead max-sm:mt-[6vw] max-sm:text-lead-sm">{step.title}</h3>
              <SplitLines
                text={step.copy}
                className="mt-[1.6vw] text-body text-muted max-sm:mt-[5vw] max-sm:text-body-sm"
              />
            </li>
          ))}
        </ol>

        {/* THE WRAPPER. React owns this div; GSAP inserts its `pin-spacer` inside it and reparents
            the single child below into that spacer. See the note at the top of this file before
            changing anything about these two elements. */}
        <div className="col-span-12 mt-[20vw] sm:col-span-4 sm:col-start-8 sm:mt-0">
          <div ref={pinned} data-studio-pin className="h-[110svh] w-full max-sm:h-auto">
            {/* Its scrubbed 1.2x drift is measured against this frame's own flow position, which the
                pin does not tell it about — so the photograph completes its 0.2H travel inside the
                first third of the pin and then holds for the rest of it. That is the right outcome
                here rather than a bug to work around: for most of the pin the fixed column is the one
                still thing on a moving page, and the plate arriving at its resting crop and staying
                there is what makes it read as settled. Turning the bleed off would stand it still from
                the start and also give up the 1.2x oversize every image on the reference carries. */}
            <ImageReveal
              src={STUDIO_PROCESS.pinned.image.src}
              alt={STUDIO_PROCESS.pinned.image.alt}
              sizes="(min-width: 640px) 38vw, 110vw"
              data-testid="studio-process-image"
              className="aspect-[4/5] w-full [&_img]:saturate-[1.12]"
            />
            <p className="mt-[1.6vw] font-mono text-mono uppercase text-muted max-sm:mt-[5vw] max-sm:text-mono-sm">
              {STUDIO_PROCESS.pinned.caption}
            </p>
            <SplitLines
              text={STUDIO_PROCESS.pinned.copy}
              className="mt-[1vw] text-body max-sm:mt-[4vw] max-sm:text-body-sm"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
