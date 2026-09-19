import Image from 'next/image'
import { Parallax } from '@/components/motion/Parallax'
import { SplitLines } from '@/components/motion/SplitLines'
import { Button } from '@/components/ui/Button'
import { STUDIO_STATEMENT } from '@/lib/content/home'

/**
 * Navy chapter, `160svh` — the page's one true display line, set over a full-bleed photograph.
 *
 * The whole section is composed on one square image. At 1440 the layer is the section's own box
 * (1440x1440) overscaled to 1728x1728, so it bleeds 144px off each side and 144px above and below
 * it; the 115.2px heading, the button and the two body columns all render on top of it. It is not a
 * strip at the foot of the section — there is no seam anywhere in this chapter, and an image that
 * stops short of the type leaves a black void that reads as a layout accident rather than as a
 * pause.
 *
 * The image is scroll-scrubbed, not held at a static offset. It travels `translateY 0 -> 288px`
 * linearly over the entire span of scroll during which the section can be on screen — 288px is
 * 0.2 of the section height, which is exactly the overhang the 1.2x overscale bought. The 144px of
 * image sitting above the section top is consumed by the first half of that travel, and by the
 * time the gap would open the section top is already off screen, so the frame is covered edge to
 * edge at every scroll position from which any of it is visible.
 *
 * Four things here are load-bearing and easy to undo:
 *
 *   - `overflow-y-clip` on the section, never `overflow-hidden`. `hidden` makes the section a
 *     scroll container, and anything `sticky` inside it then measures against a scrollport whose
 *     scrollHeight equals its clientHeight — so its offset is permanently 0 and it never pins.
 *     `clip` clips without creating a scrollport.
 *   - The overscale sits on a child of `Parallax`, not on the `Parallax` wrapper. A scrubbed
 *     element cannot also be the box its scroll range is measured from: `scale(1.2)` would grow
 *     that box by 288px and stretch the range it maps onto by the same amount, flattening the
 *     travel from 0.123 px/px to 0.110. Leaving the wrapper untransformed means it measures the
 *     section box exactly, which is why no separate `trigger` is needed here.
 *   - The default centre transform origin. `ImageReveal` scales its frames about `origin-bottom`
 *     because they are letterboxed and only have headroom below; this layer is square and has to
 *     overhang symmetrically, which is what puts its top edge 144px above the section top.
 *   - The overscale survives reduced motion. It is the crop, not the animation — dropping it would
 *     re-frame the photograph for those visitors. `Parallax` drops only the travel.
 *
 * Typography: the heading is centred in a 6-column measure starting at column 4 (690px), which is
 * what breaks it to three lines and lands its longest line at 31.4% of the viewport; given the full
 * width it breaks to two and reads as a banner rather than as a statement. It gets no `SplitLines`
 * — that mask is exactly one line box, so on a line-height-1.0 display step it would shave the
 * ascenders and descenders off permanently. The prose is what animates; the display type and the
 * button stay still, which is the reference's own division.
 */
export function StudioStatement() {
  return (
    <section
      data-studio-statement
      className="relative h-[160svh] w-full overflow-y-clip bg-secondary text-primary max-sm:h-auto max-sm:py-[18vw] sm:min-h-[100vw]"
    >
      <Parallax speed={0.2} className="absolute inset-0 z-0 overflow-y-clip">
        <div className="relative h-full w-full scale-[1.2]">
          <Image
            src={STUDIO_STATEMENT.image}
            alt={STUDIO_STATEMENT.imageAlt}
            fill
            // 120vw, not 100vw: the rendered box is 1.2x the layer it fills.
            sizes="120vw"
            // The reference grades every photograph, and grades its background plates more gently
            // than its content ones — enough saturation to stop the stock reading as flat, held
            // back to 0.9 opacity so white type over it keeps its contrast.
            className="object-cover opacity-90 saturate-[1.08]"
          />
        </div>
      </Parallax>

      <div className="layout-grid relative z-10 h-[110svh] content-center max-sm:h-auto sm:min-h-[50vw]">
        <h2 className="col-span-12 pt-[15vw] text-center text-display-xl font-display max-sm:text-display-sm-xl sm:col-span-6 sm:col-start-4">
          {STUDIO_STATEMENT.heading}
        </h2>
        {/* Centred on the page, not pinned to the left margin — the button is the section's axis. */}
        <div className="col-span-12 mt-[7vw] flex justify-center max-sm:mt-[15vw]">
          <Button href={STUDIO_STATEMENT.cta.href} tone="light" className="w-full sm:w-auto">
            {STUDIO_STATEMENT.cta.label}
          </Button>
        </div>
      </div>

      {/*
       * Two 3-column measures in the grid's right half, over the photograph. The measure is half
       * the effect: at 335px this copy wraps to five lines and four, which is what the masked
       * reveal is shaped for. Widen it and you get three long lines and the gesture disappears.
       */}
      <div className="layout-grid relative z-10 h-[50svh] content-center max-sm:mt-[12vw] max-sm:h-auto sm:min-h-[30vw]">
        <SplitLines
          text={STUDIO_STATEMENT.copy[0]}
          className="col-span-12 text-body max-sm:text-body-sm sm:col-span-3 sm:col-start-7"
        />
        <SplitLines
          text={STUDIO_STATEMENT.copy[1]}
          // The pair reads as one gesture rather than two: the second column starts a beat after
          // the first, so its lines interleave with the first column's stagger instead of racing it.
          delay={0.101}
          className="col-span-12 text-body max-sm:mt-[10vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>
    </section>
  )
}
