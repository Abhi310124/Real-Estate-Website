import { DotOrnament } from '@/components/motion/DotOrnament'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { Button } from '@/components/ui/Button'
import { PROJECTS_FEATURE } from '@/lib/content/home'

/**
 * White chapter: a flush-aligned pair of project plates, then the founder's note set as a piece of
 * stationery rather than as a paragraph.
 *
 * ## The pair is flush-aligned, and the heights do the work
 *
 * Both cards start at the same y. All of the asymmetry is in their frames — 70vw against 40vw
 * (1008px and 576px at a 1440 viewport), written as `aspect-[115/168]` beside `aspect-[115/96]` so
 * the proportion survives a change of viewport. An earlier version pushed the second column down
 * 10vw and argued that the offset was what kept the row from reading as a stock template. The
 * reference does the opposite, and it is right: once one frame is 432px taller than the other, an
 * offset on top of that difference stops reading as composition and starts reading as a mistake in
 * the grid. Do not reintroduce a `mt` on the second column.
 *
 * Mobile is not the same proportion. A 115/168 frame at `col-span-12` is 134vw tall — half a phone
 * screen of one photograph — so both cards take the reference's own shallower mobile crops (100vw
 * and 80vw) instead of carrying their desktop aspect down.
 *
 * ## The note card's geometry is emergent, and that is the point
 *
 * The card is a 22vw x 24vw sheet held 3vw off the column's left edge, padded `px-[10%] pt-[10%]
 * pb-[8%]`, holding three things in a column: a letterhead row, six writing rules, and a line of
 * credits at the foot. Every one of those percentages resolves against the sheet's own 316.8px
 * width, which is why the sheet needs an outer box for its size and an inner box for its padding —
 * collapse them into one element and `px-[10%]` starts resolving against the 690px column instead,
 * putting the rules 69px in rather than 31.68px in.
 *
 * The rules are `h-[14%]` of a block that is *shrunk* by the flex column to whatever the letterhead
 * and the credits leave it. At the measured sizes that is 222.9px, so 14% is a 31.2px pitch and the
 * ruled area ends 16% short of the bottom. None of that is worth hard-coding: fix the pitch in
 * pixels and it stops tracking the sheet, and a sheet whose rules do not track it is a texture
 * rather than a page. What must not change is the pairing — the label wraps to two lines and that
 * two-line height is one of the three numbers the pitch is computed from.
 *
 * The letterhead label is 14.4px mono in a 35% column and it wraps to two lines on a line-height of
 * 1.0. That is deliberate and it is the reference's own treatment: a cramped two-line stamp reads as
 * something struck onto the sheet, where the same string on one comfortable line reads as a caption.
 * It is the exception to the rule that nothing at this step is allowed to wrap.
 *
 * The handwritten line on the top rule is the only run on the whole site in a human hand, the only
 * one whose tracking relaxes to zero, and the only ink anywhere off the grey ramp. All three of
 * those are what make one short line carry the whole card.
 *
 * The credits sit at 11.52px — a step *below* the 15.84px label — and are clustered inside the
 * sheet's 253px measure. Spread across the full grid at label size, as they were, they compete with
 * the letterhead above them instead of receding to the foot of a page.
 *
 * What is missing from the sheet is its paper: the reference multiplies a paper photograph into the
 * card (`mix-blend-multiply`, ~45% opacity, drawn at 200% so the grain does not tile), which is why
 * a white card on a white page reads as stock there and as six floating rules here. That needs a
 * texture asset in `public/`; the section-wide `.paper-grain` noise is not a substitute, being an
 * overlay on the whole band rather than ink multiplied into one card.
 *
 * ## Prose, and where the rules are allowed to be
 *
 * The note's own words are set at the 23.04px/1.2 body step in a `col-span-3` column. The measure is
 * half the effect: the same string at `col-span-6` wraps to three wide lines instead of five short
 * ones, and the masked line reveal then has three lines to stagger rather than five. Body step and
 * narrow measure only read right as a pair — and the reveal cannot be used on any of the
 * line-height-1.0 steps, which clip their own descenders once masked.
 *
 * There is no hairline across the note grid. The reference rules nothing in this chapter, and the
 * rule that used to be drawn in there on scroll was both invented and the loudest thing in the
 * section. The one structural rule left is the static full-bleed `border-t` above the prose row,
 * which separates copy that has no counterpart in the reference's own composition of this section.
 *
 * `relative z-10` is load-bearing, not tidiness: the black chapter below is pulled up over this one
 * and would otherwise cover the note row.
 */

const NOTE_RULES = 6

/**
 * rgb(55, 65, 81). Deliberately not a token: `lib/tokens.ts` holds the palette to equal RGB
 * channels — hue is the one thing this design does not have — and a unit test enforces it. This
 * single blue-grey run is the exception the palette is allowed exactly once.
 */
const SCRIPT_INK = 'rgb(55, 65, 81)'

export function ProjectsFeature() {
  const [left, right] = PROJECTS_FEATURE.pair
  const { note } = PROJECTS_FEATURE

  return (
    <section
      data-projects-feature
      className="relative z-10 w-full bg-primary py-[var(--margin)] text-secondary"
    >
      {/* `gap-y` only bites on the mobile stack — at `sm` both cards share one row, which is the
          whole point of them. */}
      <div className="layout-grid gap-y-[8vw]">
        <div className="col-span-12 sm:col-span-6">
          <ImageReveal
            src={left.src}
            alt={left.alt}
            // 58vw, not 48: the frame renders its photograph at 1.2x to bleed past the clip, so a
            // hint quoted against the column asks the browser for a candidate 20% too small.
            sizes="(min-width: 640px) 58vw, 110vw"
            data-testid="feature-image-1"
            className="aspect-[115/168] w-full [&_img]:saturate-[1.12] max-sm:aspect-auto max-sm:h-[100vw]"
          />
          <div className="mt-[1.4vw] max-sm:mt-[5vw]">
            <Button href={left.href} tone="dark">
              {left.label}
            </Button>
          </div>
        </div>

        <div className="col-span-12 sm:col-span-6">
          <ImageReveal
            src={right.src}
            alt={right.alt}
            sizes="(min-width: 640px) 58vw, 110vw"
            data-testid="feature-image-2"
            className="aspect-[115/96] w-full [&_img]:saturate-[1.12] max-sm:aspect-auto max-sm:h-[80vw]"
          />
          <div className="mt-[1.4vw] max-sm:mt-[5vw]">
            <Button href={right.href} tone="dark">
              {right.label}
            </Button>
          </div>
        </div>
      </div>

      {/* 30vw. The chapter break inside this section is bigger than the gap between most sections,
          which is what lets the note read as a separate thought rather than as a caption to the
          pair above it. */}
      <div className="layout-grid mt-[30vw]">
        <div className="col-span-12 h-fit sm:col-span-6">
          <div className="ml-[3vw] h-[24vw] w-[22vw] max-sm:ml-0 max-sm:h-[80vw] max-sm:w-full">
            {/* Inner box carries the padding so the percentages resolve against the sheet's own
                width. `justify-between` states the intent — letterhead at the head, credits at the
                foot — even though the ruled block filling the middle already produces it. */}
            <div className="relative flex h-full w-full flex-col justify-between bg-primary px-[10%] pb-[8%] pt-[10%] text-muted">
              <div className="mb-[10%] flex items-center justify-between">
                <p className="w-[35%] font-mono text-mono-note uppercase max-sm:text-mono-sm">
                  {note.eyebrow}
                </p>
                <div className="flex items-center gap-[0.5vw] max-sm:gap-[2vw]">
                  {/* The one small run on the page at weight 500: a letterhead wordmark, not a
                      label. */}
                  <span className="text-label-md font-display max-sm:text-label-sm">BKR</span>
                  <DotOrnament size="md" />
                </div>
              </div>

              {/* `h-full` is what makes the rules possible, not tidiness: it gives this block a
                  100%-of-the-sheet flex basis which the column then shrinks to whatever the
                  letterhead and credits leave, and only a definite height lets the rows resolve
                  their own 14%. Drop it and every row collapses to nothing. */}
              <div className="h-full w-full">
                {Array.from({ length: NOTE_RULES }, (_, i) => (
                  <div
                    key={i}
                    className="flex h-[14%] w-full items-end whitespace-nowrap border-b border-muted"
                  >
                    {i === 0 ? (
                      <span className="font-script text-script max-sm:text-[5vw]" style={{ color: SCRIPT_INK }}>
                        {note.script}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <ul className="flex w-full justify-between font-mono text-mono-xs uppercase max-sm:text-mono-sm">
                {note.monoLabels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-12 max-sm:mt-[8vw] sm:col-span-6">
          {/* The one image on the site at 2x saturation. It sits opposite a sheet of paper with
              nothing but six rules on it, and carries the whole right half of the grid alone. */}
          <ImageReveal
            src={note.pairedImage.src}
            alt={note.pairedImage.alt}
            sizes="(min-width: 640px) 58vw, 110vw"
            data-testid="feature-image-3"
            className="aspect-[3/2] w-full [&_img]:saturate-[1.3]"
          />
        </div>
      </div>

      {/* The two `PROJECTS_FEATURE.process` paragraphs are NOT rendered here, even though they are
          keyed under this section's name. Two independent measurements of the reference describe the
          same pair of columns — one calls the block "process" and reports 150 and 145 characters, the
          other calls it the testimonial's right half and reports 6 and 5 rendered lines in columns
          7-9 and 10-12. Those are the same two paragraphs seen twice, and they live in the black
          band below this one. Rendering them in both places printed them twice on the page. */}
      <div className="layout-grid mt-[6vw] border-t border-edge pt-[2vw] max-sm:mt-[14vw] max-sm:pt-[8vw]">
        <div className="col-span-12 sm:col-span-3">
          <SplitLines text={note.body} className="text-body max-sm:text-body-sm" />
          <p className="mt-[2vw] text-label text-muted max-sm:mt-[6vw] max-sm:text-label-sm">
            {note.signature}
          </p>
        </div>
      </div>
    </section>
  )
}
