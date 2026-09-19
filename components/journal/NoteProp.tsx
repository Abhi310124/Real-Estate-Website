import { DotOrnament } from '@/components/motion/DotOrnament'

/**
 * A sheet of headed notepaper dropped into the listing between its first and second rows of cards.
 *
 * It is a prop, in the theatrical sense: it carries no information the page needs and it is not a
 * control. What it does is interrupt a uniform grid of photographs with one small, off-grid,
 * hand-marked object, which is the only thing standing between a listing page and a contact sheet.
 * The reference uses the same device on three routes.
 *
 * ## The geometry is all in the outer pair of boxes
 *
 * 22vw x 24vw (316.8 x 345.6px at 1440), held at `ml-[65vw]` — 936px from the viewport's left edge,
 * not from a column edge. That is deliberate and it is why this sits OUTSIDE `.layout-grid`: the grid
 * carries the page margin as `padding-inline`, so a prop placed inside it would snap to a column and
 * stop reading as something dropped onto the page. 65vw lands it deep into the right half, clear of
 * the left card's title and overlapping nothing horizontally.
 *
 * `-mb-[5vw]` (72px) is what makes it a prop rather than a band: the card's bottom 72px hang over the
 * row below, so the two overlap. `relative z-20` is what resolves that overlap the right way round —
 * a positive z-index paints above every `z-index: auto` positioned box later in the document, which
 * is what the following row's `ImageReveal` frames are. Drop the z-index and the next photograph
 * paints over the card.
 *
 * `w-fit h-fit` on the outer box keeps it out of the vertical rhythm's way (it contributes exactly
 * its own height plus the negative margin, nothing else), and `pointer-events-none` means the 87vw
 * box it technically occupies never intercepts a click aimed at a card underneath it. Hidden below
 * `sm`, where 22vw is 86px and there is no room beside the single-column stack for anything to be
 * dropped into.
 *
 * ## Inside, the construction is `components/storey/ProjectsFeature.tsx`'s note card
 *
 * Deliberately the same, down to the percentages: letterhead row, six writing rules at `h-[14%]` of
 * whatever the flex column leaves them, a handwritten line on the top rule, and a row of stamps at
 * the foot. Two boxes rather than one, because `px-[10%]` has to resolve against the sheet's own
 * 316.8px width — collapse them and the padding starts resolving against whatever the sheet is
 * sitting in. The two cards being physically identical is the point: it is one piece of stationery
 * appearing twice, and a second construction with slightly different margins would read as two.
 *
 * What both cards are still missing is their paper. The reference multiplies a paper photograph into
 * the sheet (`mix-blend-multiply`, drawn at 200% so the grain does not tile) — here that is the two
 * images the measured card carries and ours does not — which is what makes a white card on a white
 * page read as stock rather than as six floating rules. It needs a texture asset in `public/`.
 *
 * Because the sheet is `hidden` below `sm` none of its type steps carry a `max-sm:` pair: there is no
 * small-screen rendering for one to describe, and writing them anyway states a breakpoint behaviour
 * this component does not have.
 *
 * The copy is local rather than imported from `lib/content/home.ts`, because only the letterhead is
 * shared: the handwritten line here is the practice's own short phrase, where the home page's is the
 * Managing Director opening a note. Both are authored voice about how the company works and neither
 * states a fact. Worth consolidating into one content module along with the card itself.
 */

/**
 * rgb(55, 65, 81), duplicated from `components/storey/ProjectsFeature.tsx` rather than shared,
 * because that file is the one that explains it and neither exports it. `lib/tokens.ts` holds the
 * palette to equal RGB channels — a unit test enforces it — and the handwritten line is the single
 * run of ink the design allows off that ramp. If the card is ever extracted, this goes with it.
 */
const SCRIPT_INK = 'rgb(55, 65, 81)'

/** Six, as on the home page's sheet: the pitch below is a percentage of what six rows have to share. */
const NOTE_RULES = 6

const NOTE = {
  eyebrow: 'A note from BKR INFRA',
  /**
   * 28 characters on one line, in the handwriting face, on the top rule. It has to be short enough
   * never to wrap — the face has no tracking of its own to give back — and it has to sound said
   * rather than written. A practice's standing phrase, not a claim about a project.
   */
  script: 'Calm plans, honest material.',
  /**
   * Two stamps, not three. The reference's third slot carries a wordmark; ours would have to carry
   * either an invented figure or a domain, and a stamp is the last place to put something unverified.
   */
  monoLabels: ['ST / BKR', 'Thank you'],
} as const

export function NoteProp() {
  return (
    <div className="pointer-events-none relative z-20 hidden h-fit w-fit sm:block">
      <div className="relative -mb-[5vw] ml-[65vw] h-[24vw] w-[22vw]">
        <div className="relative flex h-full w-full flex-col justify-between bg-primary px-[10%] pb-[8%] pt-[10%] text-muted">
          <div className="mb-[10%] flex items-center justify-between">
            {/* 14.4px mono in a 35% column, wrapping to two lines on a line-height of 1.0. That is
                the one run at this step allowed to wrap: a cramped two-line stamp reads as something
                struck onto the sheet, where the same string on one comfortable line reads as a
                caption. */}
            <p className="w-[35%] font-mono text-mono-note uppercase">
              {NOTE.eyebrow}
            </p>
            <div className="flex items-center gap-[0.5vw]">
              {/* The one small run on the site at weight 500 — a letterhead wordmark, not a label. */}
              <span className="text-label-md font-display">BKR</span>
              <DotOrnament size="md" />
            </div>
          </div>

          {/* `h-full` is load-bearing: it gives this block a 100%-of-the-sheet flex basis that the
              column then shrinks to whatever the letterhead and the stamps leave, and only a definite
              height lets the rows resolve their own 14%. Without it every rule collapses to nothing. */}
          <div className="h-full w-full">
            {Array.from({ length: NOTE_RULES }, (_, i) => (
              <div
                key={i}
                className="flex h-[14%] w-full items-end whitespace-nowrap border-b border-muted"
              >
                {i === 0 ? (
                  <span className="font-script text-script" style={{ color: SCRIPT_INK }}>
                    {NOTE.script}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <ul className="flex w-full justify-between font-mono text-mono-xs uppercase">
            {NOTE.monoLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
