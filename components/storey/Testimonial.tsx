import { ImageRing3D, type RingItem } from '@/components/motion/ImageRing3D'
import { Parallax } from '@/components/motion/Parallax'
import { SplitLines } from '@/components/motion/SplitLines'
import { PROJECTS_FEATURE, RING_IMAGES, TESTIMONIALS } from '@/lib/content/home'
import { TestimonialCarousel } from './TestimonialCarousel'

/**
 * Navy chapter: a four-slide client carousel in the left half, two paragraphs of supporting prose in
 * the right, a ghosted 3D ring behind both, and the whole band drifting a quarter of its own height
 * as it passes.
 *
 * ## The quote is body copy, not a pull-quote
 *
 * 23.04px at weight 400 on 27.648px leading, in a 336px measure — four or five short lines, the same
 * step and the same column width as every other piece of prose on the page. Set as a 100px display
 * line across nine columns, which is the obvious way to build a testimonial, it becomes the loudest
 * thing on the site and stops belonging to the same design as the sections around it. The reference
 * whispers here. Everything else in the chapter is arranged around that decision: a quiet quote can
 * share its half of the grid with a photograph, a portrait and a progress indicator, where a display
 * line has to have the row to itself.
 *
 * ## Band geometry, and why the height is load-bearing twice
 *
 * `-mt-[25%]` is -360px at 1440, pulling the black band up over the white projects chapter. That
 * chapter keeps `relative z-10`, so it paints over the overlap: the seam reads as the white block
 * eating 360px into the top of the black one, not as black spilling onto white. Both sites are built
 * that way round.
 *
 * `py-[30%]` is a symmetric 432px top and bottom, and it is what makes the band 1,565px tall. That
 * number is used twice: once as this chapter's share of the document's rhythm, and once as the
 * amplitude of the drift below, which is a quarter of the band's own height. Asymmetric padding — a
 * short 144px above and 374px below — puts the quote near the top of a block 383px too short and
 * quietly cuts the drift from 391px to 296px.
 *
 * ## Why the band and the section are two elements
 *
 * The band is the element that moves: `translateY 0 → +0.25 × its own height`, linear, over exactly
 * the span of scroll during which it can be on screen, then held. Because its layout box does not
 * move, the black slab ends up overlapping the chapter below by 391px, and that overlap is where the
 * drift reads from.
 *
 * The outer `<section>` exists to stay still, and it does two jobs from there. It holds the chapter's
 * flow height while the paint drifts, which is the whole mechanic. And it is what the ring measures
 * its rotation against: `ImageRing3D` takes its trigger from `closest('section')`, and a 114.4vw
 * tilted stage has no box worth measuring, so it needs an ancestor whose box means something.
 *
 * The drift measures the band itself, which is safe for one specific reason: ScrollTrigger reverts its
 * own animation to progress 0 before it takes measurements, so the box it reads is the undrifted one.
 * That does not extend to a *static* transform — an element held at `scale(1.2)`, like the carousel's
 * photograph, has to be given an untransformed `trigger` explicitly, and is.
 *
 * **Neither of them is positioned, and that is not an omission.** A `position: relative` anywhere on
 * this subtree lifts the whole band above every later in-flow block on the page, and the journal
 * chapter below is one: the black would then paint over the top of the journal at full drift instead
 * of sliding underneath it. Left unpositioned, the band paints in tree order, so the journal's own
 * background covers the overlap while the projects chapter above — which holds `relative z-10` for
 * exactly this reason — covers the 360px the negative margin claims. Those are the two relationships
 * the reference has, and it gets them from having a `relative` journal rather than an unpositioned
 * band. Nothing here needs positioning to work: `will-change-transform` on the band already makes it
 * a containing block for the ring and a stacking context for the `z-10`/`z-0` pair inside it.
 *
 * `overflow-y-clip`, never `overflow-hidden`: `clip` clips without creating a scrollport, so the ring
 * and the drifting band are trimmed at the band's edges without turning the chapter into a scroll
 * container.
 *
 * ## The right half is not empty
 *
 * Columns 7-9 and 10-12, 335px each, six lines and five, pulled 72px above the left column's top edge
 * so the prose starts higher than the photograph beside it. These two paragraphs are the reference's
 * process copy, and this band — not the projects chapter — is where it sits: that chapter carries no
 * body prose at all, only its note card. They are keyed under `PROJECTS_FEATURE` in the content module
 * for historical reasons rather than because they belong to that section.
 *
 * ## The ghosted ring
 *
 * A second 114.4vw stage, the same one the manifesto turns, at a quarter opacity and anchored so its
 * centre sits three quarters of a viewport left of the middle and 45% of its own height below the
 * band's base. The opacity lives on a wrapper and does NOT flatten the ring: the stage inside carries
 * its own `perspective`, which establishes a fresh 3D rendering context for everything below it, so an
 * ancestor being composited as a group never reaches the cells' transforms. The same is true of the
 * band's clip and its drift.
 *
 * `inert` matters more than it looks. The ring's cells are links, and eight of them ghosted behind a
 * quote are eight tab stops and eight click targets a visitor cannot see. `inert` removes them from
 * both the focus order and hit testing, which is also what makes `aria-hidden` safe to pair with it.
 *
 * Nothing straddles the seam at the foot of this chapter any more. That plate had no counterpart on
 * the reference, whose only photographs here are the four carousel slides and the portraits inside
 * them; a half-section-tall image bridging into the journal chapter was competing with the drift for
 * the same job and winning.
 *
 * NOTE: all four quotes are placeholders pending real, attributable client references — see the
 * comment in `lib/content/home.ts`. Each is attributed to initials and a locality rather than an
 * invented name, and the line the design gives to a company renders the word PLACEHOLDER on the page,
 * so the unverified state is visible to anyone looking at the site rather than buried in a comment.
 */
export function Testimonial() {
  const [supportA, supportB] = PROJECTS_FEATURE.process

  // The ring is decorative here, so every cell points at the projects index rather than at a
  // specific project: this section is given no project data, and `inert` means the hrefs are never
  // reachable in any case.
  const ringItems: RingItem[] = RING_IMAGES.map((image) => ({
    src: image.src,
    alt: image.alt,
    href: '/projects',
    label: 'View projects',
  }))

  return (
    <section className="-mt-[25%] w-full">
      <Parallax
        speed={0.25}
        data-testimonial
        // Unpositioned on purpose — see the note on painting order above; adding `relative` here puts
        // the black over the journal chapter at full drift.
        className="w-full overflow-y-clip bg-secondary py-[30%] text-primary will-change-transform"
      >
        <div className="layout-grid relative z-10">
          {/* 50vw of clearance below the carousel on the mobile stack, where the right-hand prose
              follows it instead of sitting beside it. */}
          <div className="col-span-12 max-sm:mb-[50vw] sm:col-span-6">
            <TestimonialCarousel slides={TESTIMONIALS} />
          </div>

          <div className="col-span-12 -mt-[5vw] sm:col-span-6">
            <div className="grid grid-cols-6 gap-[var(--gutter)]">
              <SplitLines
                text={supportA}
                className="col-span-6 text-body max-sm:text-body-sm sm:col-span-3"
              />
              {/* The second of a side-by-side pair runs 101ms behind the first — the measured offset
                  between two columns entering on one trigger. */}
              <SplitLines
                text={supportB}
                delay={0.101}
                className="col-span-6 text-body max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-3"
              />
            </div>
          </div>
        </div>

        {/* `w-fit h-fit` so the percentage translates resolve against the stage's own 114.4vw box:
            -3/4 of 1647.36px is -1235.52px across, and +45% is +741.3px down. */}
        <div
          inert
          aria-hidden="true"
          className="absolute bottom-0 left-1/2 z-0 h-fit w-fit -translate-x-3/4 opacity-25 sm:translate-y-[45%]"
        >
          <ImageRing3D items={ringItems} />
        </div>
      </Parallax>
    </section>
  )
}
