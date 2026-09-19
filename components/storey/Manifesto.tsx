import { ImageRing3D, type RingItem } from '@/components/motion/ImageRing3D'
import { SplitLines } from '@/components/motion/SplitLines'
import { MANIFESTO, RING_IMAGES } from '@/lib/content/home'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * Black manifesto chapter carrying the 3D image ring — the reference's signature moment.
 *
 * What the ring actually looks like: the images are **not** upright thumbnails on a tilted carousel.
 * They are steeply foreshortened parallelograms scattered widely across the black field, each
 * inheriting its cell's rotation, and greyed to 0.4 so they read as a receding constellation rather
 * than as a gallery. A first pass here counter-rotated them upright, which looked tidier and was
 * wrong.
 *
 * ## The ring renders at full size, off-centre, half below the section
 *
 * The stage is 114.4vw — 1647px at 1440 — and it is NOT scaled down. Its centre is anchored at
 * (`left-1/2` + `-translate-x-3/4`, `bottom-0` + `translate-y-1/2`), which at any width puts it at
 * 21.4% of the viewport across and exactly on the section's bottom edge. So the left flank bleeds
 * off screen, the bottom half hangs below the section, and what a visitor sees is one quadrant of a
 * very large ellipse sweeping up through the black.
 *
 * An earlier version scaled the stage to 0.62 and centred it, reasoning that a 1647px ellipse is
 * wider than the viewport and would lose both flanks. Losing the left flank is the design: at 0.62
 * every image is 62% of its measured size, the arc never leaves the viewport, and each degree of the
 * scrub moves an image 8.9px instead of 14.4px, so the same rotation reads as a slow shuffle rather
 * than a sweep. Scale and anchor are load-bearing together — restoring one without the other puts
 * the arc in the wrong part of the frame.
 *
 * The clip is `overflow-clip`, and the value matters more than the axis:
 *
 *   - `clip` rather than `hidden`. `hidden` makes the section its own scrollport, and a scrollport is
 *     precisely what stops the preview card below from ever sticking — the card would pin against
 *     the section's own non-scrolling box instead of the document and simply never move. `clip`
 *     clips without scrolling, which is the whole reason the reference uses it here.
 *   - Both axes, because the horizontal bleed is real and large. The stage's own box only ever
 *     overflows to the LEFT (its right edge lands at 0.5W − 0.858W + 1.144W = 0.786W) and negative
 *     inline-start overflow is not scrollable in LTR — but the eight cells inside it are tilted 85°
 *     under a 132vw perspective, and a near-edge-on plane projects far outside the box it lives in:
 *     the posed layer measures 2155px wide and the scrollable overflow reaches several thousand
 *     pixels to the RIGHT, which is scrollable. The reference absorbs that with a single
 *     `overflow-x-clip` on its app root; we have no such wrapper, and clipping x here is
 *     pixel-identical because the section is full-bleed — both clip at the viewport's own edges.
 *
 * Neither `clip` axis creates a scroll container, so the sticky card still pins against the
 * document: measured at viewportTop 572 through ~750px of scroll, which is the reference's own pin.
 *
 * `preserve-3d` is destroyed by any ancestor that establishes a containing block, so the clip sits
 * on the SECTION, two levels above the 3D stage. Putting it on the stage's own parent would flatten
 * the ring.
 *
 * ## The copy lives in the right half, in two narrow columns
 *
 * Columns 7-9 and 10-12, 335px each at 1440, six short lines each. Columns 1-6 hold no copy at all:
 * the left half is the void the ring turns in. One wide paragraph across columns 1-7 is the obvious
 * arrangement and it is wrong twice over — it fills the ring's own side of the grid, and at 56vw the
 * same 160 characters wrap to three near-full-width lines instead of six short ones, which is most
 * of the difference between this page's prose and the reference's.
 *
 * The measure is what produces the line count, so the `col-span-3` and the line split are one fix:
 * `SplitLines` masks whatever lines the browser actually laid out, and at seven columns it would
 * faithfully animate three wide ones. The second column runs 0.101s behind the first — the two
 * blocks are not one group with a shared stagger.
 *
 * ## The gradient dissolves the bottom seam, not the top
 *
 * `bottom-0 h-[40%]` — the section's lower 432px at a 900px viewport, fading to black at the edge
 * where the white Expertise chapter begins, so the ring dies into the join instead of being cut off
 * at it. Anchoring it to the top instead darkens downward from the hero seam, which is black on
 * black and needs no help, and leaves the seam that does need help hard. It sits above the ring
 * (`z-10`) because it has to dim the lower arc, and it must stay `pointer-events-none` or it
 * swallows every click meant for the ring images beneath it.
 */
export function Manifesto({ projects }: { projects: ProjectSummary[] }) {
  const items: RingItem[] = RING_IMAGES.map((img, i) => {
    const project = projects[i % Math.max(projects.length, 1)]
    return {
      src: img.src,
      alt: img.alt,
      href: project ? `/projects/${project.slug}` : '/projects',
      label: project ? `View ${project.title}` : 'View projects',
    }
  })

  return (
    <section
      data-manifesto
      // Marks the end of the page's chrome-free opening. The fixed header stays hidden until this
      // section's bottom clears the top of the viewport, because this chapter's copy sits at the
      // very top of it, in the same right-hand columns the nav occupies — a header visible here
      // lands directly on the words. The reference does the same thing for the same reason.
      data-header-reveal
      className="relative flex h-[120svh] w-full flex-col overflow-clip bg-secondary text-primary max-sm:h-[140svh]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[40%] bg-gradient-to-b from-transparent to-secondary"
      />

      {/*
       * No vertical padding above `sm`: the copy's only offset from the section's top edge is the
       * columns' own `mt-[2vw]`, which is what keeps it high enough that the ring's upper arc has
       * the rest of the section to itself. The `z-10` is ours rather than the reference's — it holds
       * the prose above the ring so a 40%-opacity plane crossing the column cannot take the text
       * with it.
       */}
      <div className="layout-grid relative z-10 max-sm:py-[10vw]">
        <SplitLines
          text={MANIFESTO.copy[0]}
          className="col-span-12 mt-[2vw] text-body max-sm:text-body-sm sm:col-span-3 sm:col-start-7"
        />
        <SplitLines
          text={MANIFESTO.copy[1]}
          delay={0.101}
          className="col-span-12 mt-[2vw] text-body max-sm:mt-[10vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>

      {/* `w-fit h-fit` so the percentage translates resolve against the stage's own 114.4vw box:
          -3/4 of 1647.36 is -1235.52px and +1/2 is +823.68px, which is the whole anchor. */}
      <div className="absolute bottom-0 left-1/2 h-fit w-fit -translate-x-3/4 translate-y-1/2">
        <ImageRing3D items={items} />
      </div>

      {/*
       * The preview card: a small sheet of paper pinned over the black field, captioning the ring
       * and telling the visitor the scattered shapes are interactive at all.
       *
       * `sticky bottom-0` + `mt-auto` on the flex-column section, NOT `absolute`. `mt-auto` parks it
       * on the section's bottom edge and sticky then holds it at the foot of the viewport for
       * `sectionHeight − 328px` ≈ 750px of scroll, so the card and the turning ring coexist for most
       * of the chapter. Absolute positioning looks identical at rest and then scrolls the card away
       * in a single screenful, which severs it from the ring it is labelling.
       *
       * 328px total: 20px above the sheet, a 20vw sheet, 20px below it. Hidden below `sm` — the
       * label promises a hover, which a touch screen cannot offer.
       *
       * `pointer-events-none` on the wrapper so the caption never blocks the ring behind it.
       */}
      <div className="pointer-events-none sticky inset-x-0 bottom-0 z-10 mt-auto max-sm:hidden">
        <div className="layout-grid">
          <div className="col-span-3 col-start-10 mb-[var(--gutter)]">
            <div className="mt-[var(--gutter)] flex h-[20vw] w-full flex-col bg-offwhite">
              {/*
               * Asymmetric interior: 0.8vw at the sides and top, 1.2vw below the frame. The extra
               * 5.76px is what stops the caption sitting tight under the picture. Together with the
               * 1.46:1 frame (312 x 214 at 1440) and the caption row it fills the 20vw sheet
               * exactly, which is why the frame carries an aspect ratio rather than a height.
               */}
              <div className="px-[0.8vw] pb-[1.2vw] pt-[0.8vw]">
                <div className="relative aspect-[1.46/1] w-full overflow-hidden bg-secondary">
                  {/* A miniature of the same constellation — the reference previews the ring inside
                      the frame too, over a live project thumbnail. `scrub={false}` because that
                      miniature holds at a constant angle while the full-size ring turns. */}
                  <div className="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.14]">
                    <ImageRing3D items={items} scrub={false} />
                  </div>
                </div>
              </div>
              {/*
               * Bare centred text with a text-decoration underline 7.2px clear of the baseline — no
               * fill of its own, no rule drawn as a border. The ~36px it ends up inset from the
               * sheet's left edge is the consequence of centring roughly 264px of tracked-in mono in
               * a 335px column, not a padding: set the inset explicitly and it stops tracking the
               * text's own width.
               *
               * Black on paper, so the sheet's fill is load-bearing for legibility. The reference's
               * sheet is #FEFEFE carrying a paper texture as a `mix-blend-multiply` layer, which
               * lands it around this value once multiplied; `offwhite` stands in for that until the
               * texture asset exists. Flat white would read as a hole cut in the black.
               */}
              <p className="mb-[2vw] mt-auto text-center font-mono text-mono uppercase text-secondary underline underline-offset-[0.5vw] max-sm:text-mono-sm">
                {MANIFESTO.ringLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
