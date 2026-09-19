import { ImageRing3D } from '@/components/motion/ImageRing3D'
import { SplitLines } from '@/components/motion/SplitLines'
import { ringItems } from '@/components/studio/ringItems'
import { STUDIO_HERO } from '@/lib/content/studio'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The route's opening: 170svh of black carrying the 3D image ring, with the title block at the top
 * of it.
 *
 * ## Why this band is black
 *
 * The reference's /studio opens on `bg-secondary text-primary` — the same ink as the home hero — and
 * every band after it alternates from there. This page used to open white, which put the whole route
 * one step out of phase from the first screen: each chapter landed on the colour the chapter before
 * it should have had, and the route read as a different page rather than as a shorter one.
 *
 * The consequence to know about is the header. `SiteHeader` resolves its ink by sampling the painted
 * stack under the wordmark on every scroll, so it inverts to white here on its own — but its
 * `firstPaintInk()` fallback is keyed to the route name and still returns dark ink for `/studio`,
 * which costs one frame of black-on-black before hydration. Fixing that means adding this route to
 * that function, which is not in this file.
 *
 * There is no photograph in this band and that is the point: the ring *is* the imagery, the same way
 * it is on the home page's manifesto chapter, and a full-bleed frame underneath it would give the
 * eight tilted planes nothing to be legible against.
 *
 * ## The clip is both axes even though the reference only clips one
 *
 * The reference writes `overflow-y-clip` here. Ours is `overflow-clip`, and the extra axis is not
 * tidiness: the ring's eight cells are tilted 85° under a 132vw perspective, so the posed layer
 * measures far wider than its own box and its scrollable overflow reaches thousands of pixels to the
 * RIGHT, which is scrollable and would put a horizontal scrollbar on the document. The reference
 * absorbs that with an `overflow-x-clip` on its app root; we have no such wrapper, so the section
 * does it. `clip` and never `hidden` — `hidden` makes the band its own scrollport.
 *
 * The clip sits on the SECTION, two levels above the 3D stage. `preserve-3d` is flattened by an
 * ancestor that establishes a containing block, and by an overflow on the element carrying it, so the
 * distance is deliberate. Same construction as `components/storey/Manifesto.tsx`, for the same
 * reason.
 *
 * ## The ring's anchor
 *
 * `left-1/2 bottom-0 -translate-x-3/4 translate-y-1/2`, unscaled, on a `w-fit h-fit` box so the
 * percentage translates resolve against the stage's own 114.4vw (1647px) square rather than against
 * the section. That centres the ring at 21.4% of the viewport across and on the band's bottom edge,
 * so its lower half is clipped away and what is visible is one quadrant of a very large ellipse
 * sweeping up through the black. The scale is load-bearing with the anchor: shrinking the stage to
 * fit the viewport also shrinks every degree of the scrub, and the same rotation then reads as a
 * shuffle rather than a sweep.
 *
 * ## `mode="load"` on the prose
 *
 * `LoadSequence` is mounted in the root layout, so it claims the load on interior routes too. This
 * block is on screen at first paint, which means a scroll trigger here fires on frame one and the
 * reveal plays out underneath the curtain — the cue is the only thing that survives the curtain. The
 * heading is NOT revealed: `SplitLines` masks exactly the line box, and `display-lg` is a
 * line-height-1.0 step whose descenders would be clipped away for good.
 */
export function StudioHero({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section
      data-studio-hero
      className="relative h-[170svh] w-full overflow-clip bg-secondary text-primary max-sm:h-[140svh]"
    >
      {/* Raw mono markup rather than `<Eyebrow>` on every dark chapter of this route. Eyebrow's own
          colour is `text-muted` (#3D3D3D) and `cn()` is a plain join with no tailwind-merge, so a
          colour passed through `className` does not reliably win the cascade — it would be a
          coin-flip between white and near-black type on black. Same markup, minus the gamble. */}
      <div className="layout-grid relative z-10 items-start pt-[9vw] max-sm:pt-[30vw]">
        <p className="col-span-12 font-mono text-mono uppercase text-primary/60 max-sm:text-mono-sm">
          {STUDIO_HERO.eyebrow}
        </p>

        <h1 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-7">
          {STUDIO_HERO.title}
        </h1>

        {/* Columns 10-12: a 23.3vw measure, which is what turns 177 characters into six short lines
            instead of two wide ones. The split and the measure are one fix — at `col-span-6`
            SplitLines would faithfully mask three banners.
            2.5vw drops the first line clear of the heading's cap line rather than aligning the two
            columns' tops, which is the same offset the home page's own heading rows use. */}
        <SplitLines
          text={STUDIO_HERO.copy}
          mode="load"
          className="col-span-12 mt-[2.5vw] text-body max-sm:mt-[10vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>

      <div className="absolute bottom-0 left-1/2 h-fit w-fit -translate-x-3/4 translate-y-1/2">
        <ImageRing3D items={ringItems(projects)} />
      </div>
    </section>
  )
}
