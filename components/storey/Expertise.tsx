'use client'
import { useEffect, useRef } from 'react'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { EXPERTISE } from '@/lib/content/home'

/**
 * White chapter: a heading paired with an intro, then three rows that each set a giant ghosted
 * numeral opposite a small plate.
 *
 * ## The row is TWO stacked grids, not one
 *
 *     grid A    [ title · col 1–3 ]        [ copy · col 7–11 ]
 *               ─────────── 10vw of air ───────────
 *     grid B    [ numeral · col 1–3 ]      [ plate · col 7–9 ]
 *
 * The pairing is the whole idea: the numeral answers the photograph across the grid, and the row
 * gets a second beat 10vw below its own text. Collapsing this into one grid — title with the
 * numeral stacked under it in a single left column, copy with the image under it on the right — is
 * the obvious reading of a screenshot and it throws away both diagonals; the numeral becomes a
 * caption on the title and the row becomes a feature card.
 *
 * Load-bearing widths: the title column is 3 columns (23.3vw), the copy column 5 (39.7vw), the
 * plate 3 (23.3vw) at 5:3. The copy measure is the only thing setting each row's height — four
 * lines for the first item, three for the other two — so narrowing it to 4 columns does not just
 * make the text narrower, it makes every row the same height and the list reads as a table.
 *
 * `self-start` on the plate is not cosmetic. The numeral's 216px line box sets grid B's row
 * height, and a stretched grid item takes a definite height from its row, which overrides
 * `aspect-[5/3]` and renders the photograph at 1.55:1.
 *
 * ## The numeral is monospaced, and that is structural rather than tonal
 *
 * 216px (15vw), weight 400 inherited, `hairline` (#E6E6E6). Fixed-advance means "1", "2" and "3"
 * occupy an identical box and stack in a true column; in the proportional sans the same three
 * glyphs differ in width by 33px and a numbered series stops reading as a series. It is barely
 * there on purpose — a watermark, not a label; at `muted` it would compete with the title. And it
 * is `aria-hidden`: ordinal decoration, where a screen reader announcing "one" before each heading
 * adds nothing the list order does not already carry.
 *
 * ## The rules are borders, and they are static
 *
 * `border-t border-edge` at 1px on the row wrapper, deliberately OUTSIDE `layout-grid`: the grid
 * carries the page margin as `padding-inline`, so a rule placed inside it is inset 20px at each
 * end and stops short of both viewport edges. A real border is also why this is 1px: the
 * `.in-out-line` utility resolves to `max(0.1vw, 1px)` — 1.44px here — and that thickness belongs
 * to the link underline it was measured from, not to a structural rule. They do not animate: there
 * is no draw-on-enter hairline anywhere on the reference, and a 300ms sweep here made the loudest
 * gesture in the chapter a line rather than the photography.
 *
 * ## The scroll-linked lift, and why it is hand-rolled
 *
 * Each row is scrubbed `translateY 0 → 10vw` (144px at 1440) across exactly its own height, from
 * its top reaching the viewport top to its bottom reaching it, `ease: 'none'`; simultaneously a
 * black scrim over the row scrubs `opacity 0 → 0.4` over the identical range. Sampled mid-row the
 * two ramps are dead linear against scroll (a 571px row lifts 24.5px and dims to 0.068 at 97px of
 * travel, 62.3px and 0.173 at 247px), then both clamp. Together they make the list read as a
 * stack: a row slows and darkens while the next rides up over it.
 *
 * Three details hold it up:
 *
 *   - `Parallax` cannot express this. Its amplitude is a fraction of the element's own height,
 *     where the measured travel is a constant 144px on all three rows regardless of height; and it
 *     maps `top bottom → bottom top`, a range one viewport longer, so the row would drift for the
 *     whole time it is on screen instead of only while it is leaving. Either mismatch alone would
 *     be worth fixing at the call site; both together make it the wrong primitive.
 *   - `bg-primary` on the row is what makes the overlap legible. The next row is later in the DOM
 *     and paints over the descending one, so an opaque row is what turns the lift into occlusion
 *     rather than two sets of text sliding through each other.
 *   - The `li` is the ScrollTrigger, not the row. This timeline displaces the row, and measuring
 *     `top top`/`bottom top` against a box the tween is moving is circular.
 *
 * The scrim's terminal opacity is 0.4. Per-row figures an order of magnitude smaller also exist,
 * and they are the same tween sampled before its ramp finished, not a different destination.
 *
 * ## Stagger, or the absence of one
 *
 * There is no row-level stagger, deliberately. `SplitLines` and `ImageReveal` each own their own
 * trigger and their own tween, so a timeline here cannot reach either; and the reference animates
 * nothing else in a row — its titles and numerals enter static. Handing those two primitives a
 * `delayMs` is worse than handing them nothing, because each owns its own observer and they sit a
 * couple of hundred pixels apart, so the declared offset only ever expressed itself as the scroll
 * distance between them. The stagger that is actually visible is the 60ms per line inside each
 * paragraph, and `SplitLines` owns that.
 *
 * The section has no internal padding: the heading is flush with its top edge and the last row
 * with its bottom. Rhythm comes from `mt-[3vw]` against the black chapter above and the 20vw gap
 * between the heading row and the list. `overflow-y-clip` — clip, never `hidden`, which would make
 * the section a scroll container — absorbs the last row's 144px of overhang.
 */

/** Row lift, as a fraction of viewport width: 10vw, i.e. 144px at the 1440 the site was measured at. */
const LIFT_VW = 0.1
/** Terminal opacity of the per-row dimming scrim. */
const SCRIM_OPACITY = 0.4

export function Expertise() {
  const list = useRef<HTMLUListElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = list.current
    if (reduced || !root) return

    let cancelled = false
    let kill: (() => void) | undefined

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const disposers: Array<() => void> = []

        for (const trigger of Array.from(root.querySelectorAll<HTMLElement>('[data-expertise-row]'))) {
          const lift = trigger.querySelector<HTMLElement>('[data-expertise-lift]')
          const scrim = trigger.querySelector<HTMLElement>('[data-expertise-scrim]')
          if (!lift || !scrim) continue

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              // The travel is read off the viewport width, so a resize has to re-evaluate it
              // rather than keep scrubbing to a length from the width before last.
              invalidateOnRefresh: true,
              // A scrub tween never completes the way a once-triggered reveal does; it stays live
              // for as long as the row is inside its range, so the will-change lifecycle follows
              // that range rather than an onComplete.
              onToggle: (self) => {
                gsap.set(lift, { willChange: self.isActive ? 'transform' : 'auto' })
                gsap.set(scrim, { willChange: self.isActive ? 'opacity' : 'auto' })
              },
            },
          })
          tl.fromTo(lift, { y: 0 }, { y: () => window.innerWidth * LIFT_VW, ease: 'none', duration: 1 }, 0)
          tl.fromTo(scrim, { opacity: 0 }, { opacity: SCRIM_OPACITY, ease: 'none', duration: 1 }, 0)

          disposers.push(() => {
            tl.scrollTrigger?.kill()
            tl.kill()
            gsap.set(lift, { clearProps: 'transform,willChange' })
            gsap.set(scrim, { clearProps: 'opacity,willChange' })
          })
        }

        kill = () => {
          for (const dispose of disposers) dispose()
        }
      })
      .catch((err) => {
        // Degrades to exactly the markup below: rows in flow, scrims transparent. Nothing was
        // hidden or displaced before the chunk resolved, so there is nothing to undo — but a
        // chapter-defining scrub that silently stops running is worth seeing in a console.
        console.error('[Expertise] row lift unavailable; rows render static and undimmed', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <section data-expertise className="relative mt-[3vw] w-full overflow-y-clip bg-primary text-secondary">
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          {EXPERTISE.title}
        </h2>

        {/* 2.5vw (36px) drops the first line clear of the heading's cap line instead of aligning
            the two columns' tops. Four lines in a 4-column measure is what the copy is written to;
            given 5 or 6 columns it collapses to three wide lines and stops reading as a column. */}
        <SplitLines
          text={EXPERTISE.intro}
          className="col-span-12 mt-[2.5vw] text-body max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-4 sm:col-start-9"
        />
      </div>

      <ul ref={list} className="mt-[20vw]">
        {EXPERTISE.items.map((item, i) => (
          <li key={item.n} data-expertise-row>
            <div
              data-expertise-lift
              className="relative flex w-full flex-col gap-[10vw] border-t border-edge bg-primary"
            >
              <div className="layout-grid pt-[var(--gutter)]">
                <h3 className="col-span-12 text-lead max-sm:text-lead-sm sm:col-span-3">{item.title}</h3>
                <SplitLines
                  text={item.copy}
                  className="col-span-12 mt-[6vw] text-body max-sm:text-body-sm sm:col-span-5 sm:col-start-7 sm:mt-0"
                />
              </div>

              <div className="layout-grid pb-[4vw] pt-[var(--gutter)] max-sm:pb-[8vw]">
                <span
                  aria-hidden="true"
                  className="col-span-12 font-mono text-numeral text-hairline sm:col-span-3"
                >
                  {item.n}
                </span>
                <ImageReveal
                  src={item.image}
                  alt={item.alt}
                  sizes="(min-width: 640px) 30vw, 100vw"
                  data-testid={`expertise-image-${i + 1}`}
                  className="col-span-12 mt-[6vw] aspect-[5/3] w-full self-start saturate-[1.12] sm:col-span-3 sm:col-start-7 sm:mt-0"
                />
              </div>

              <div
                data-expertise-scrim
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 bg-secondary opacity-0"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
