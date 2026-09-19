import { SplitLines } from '@/components/motion/SplitLines'
import { CORE_PRINCIPLES } from '@/lib/content/studio'

/**
 * Navy chapter: four numbered principles as ruled rows.
 *
 * ## The row is two stacked grids, and the numeral is in the second one
 *
 *     grid A    [ title · col 1–3 ]        [ copy · col 7–9 ]
 *     grid B    [ numeral · col 1–3 ]
 *
 * Lifted from `components/storey/Expertise.tsx`, because it is the reference's own anatomy for a
 * numbered series and it appears here with one thing removed: there is no photograph opposite the
 * numeral. That absence is what makes this chapter different from the Expertise one rather than a
 * second copy of it — the row is mostly empty black with a 216px ghost numeral in the left column,
 * and it is the only chapter on the route that carries no imagery at all.
 *
 * ## The row heights are the copy lengths
 *
 * Measured at 411.7 / 384 / 384 / 411.7px. Everything else in a row is a constant — 20px of top
 * padding, a 31.68px title, a 14.4px gap and the 216px numeral — so the 27.7px that separates a long
 * row from a short one is exactly one line of 23.04px/1.2 body copy. The content file therefore
 * writes four, three, three and four lines, and levelling the four blocks to a uniform length would
 * collapse the whole sequence into a table. `min-h-[100svh]` on the section is the reference's own
 * floor and does nothing at this content length; it exists so the chapter cannot collapse if the copy
 * is ever cut.
 *
 * ## The rules are borders, they are `#293648`, and they are static
 *
 * `border-t` on the row wrapper, deliberately OUTSIDE `layout-grid`: the grid carries the page margin
 * as `padding-inline`, so a rule placed inside it stops 20px short of both viewport edges. #293648 is
 * the measured value and is specific to the dark chapters — it is a rule that reads as drawn on black
 * rather than as the white `edge` grey knocked back, and `border-primary/20` would resolve to a
 * translucent white that changes value with whatever is painted behind it. They do not animate: there
 * is no draw-on-enter hairline anywhere on the reference, and a 300ms sweep in a chapter this quiet
 * becomes the loudest thing in it.
 *
 * ## What is and is not revealed
 *
 * Only the copy. The titles are at `lead` and the numerals at `numeral`, both line-height-1.0 steps
 * whose ascenders and descenders a line mask would clip away permanently — which is the same
 * constraint the reference works under, and why it animates prose and never a display step. The
 * numeral is `aria-hidden`: it is ordinal decoration, and a screen reader announcing "one" before
 * each heading adds nothing the list order already carries.
 */

/** Measured on the reference's dark rows. Not a palette token — it exists only on black bands. */
const DARK_RULE = 'border-t border-[#293648]'

export function CorePrinciples() {
  return (
    <section
      data-studio-principles
      className="w-full min-h-[100svh] bg-secondary py-[var(--gutter)] text-primary max-sm:py-[10vw]"
    >
      <div className="layout-grid">
        <p className="col-span-12 font-mono text-mono uppercase text-primary/60 max-sm:text-mono-sm">
          {CORE_PRINCIPLES.eyebrow}
        </p>

        <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-8">
          {CORE_PRINCIPLES.heading}
        </h2>
      </div>

      <ul className="mt-[10vw] max-sm:mt-[14vw]">
        {CORE_PRINCIPLES.items.map((item) => (
          <li key={item.n} className={`flex w-full flex-col gap-[1vw] ${DARK_RULE} max-sm:gap-[6vw]`}>
            <div className="layout-grid pt-[var(--gutter)]">
              <h3 className="col-span-12 text-lead max-sm:text-lead-sm sm:col-span-3">{item.title}</h3>
              <SplitLines
                text={item.copy}
                className="col-span-12 mt-[6vw] text-body max-sm:text-body-sm sm:col-span-3 sm:col-start-7 sm:mt-0"
              />
            </div>

            <div className="layout-grid pb-[4vw] max-sm:pb-[8vw]">
              <span
                aria-hidden="true"
                className="col-span-12 font-mono text-numeral text-primary/15 sm:col-span-3"
              >
                {item.n}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
