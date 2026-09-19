import { HeroHeaderBand } from '@/components/layout/SiteHeader'
import { HeroSlides } from '@/components/storey/HeroSlides'

/**
 * The opening: a full-bleed photographic slideshow, `110svh` tall.
 *
 * The over-tall section is deliberate and is the whole trick behind the reference's opening: at
 * 110svh the photograph is always taller than the viewport, so the next section is already
 * encroaching as you begin to scroll and the page feels continuous rather than paged. `svh` not
 * `vh`, so mobile browser chrome cannot crop it. At a 900px viewport this resolves to 990px, which
 * is exactly the height the reference's own hero was measured at — every percentage inside
 * `HeroSlides` is expressed against this box, so it has to stay 110svh.
 *
 * Three properties of this element are load-bearing for code that lives elsewhere:
 *
 *   - `data-hero` is a contract, not a hook for styling. The load sequence gates its black hold on
 *     `[data-hero] img` decoding, and the home-page journey test locates the first chapter by it.
 *   - `bg-secondary` is the opening's *second* curtain. When the full-screen curtain finishes
 *     fading there is still a beat of solid black with only the wordmark on it, because this
 *     background is opaque and the photograph above it is still at opacity 0. That beat is what
 *     makes the load read as an opening rather than a flash, and it needs no extra overlay — only
 *     this colour plus contents that arrive later than the curtain leaves.
 *   - `overflow-clip`, not `overflow-hidden`. The photograph enters at `scale(1.1)` and the
 *     inactive slides sit at `scale(1.05)`, both of which bleed past the viewport on every side;
 *     without clipping here the page grows a horizontal scrollbar. `clip` does that without
 *     creating a scroll container, which `hidden` would — and a scrollport in a section wrapping
 *     scroll-driven motion is the bug that has already cost this codebase a sticky that never
 *     sticks.
 *
 * Everything inside is one client component. That is not the usual preference here, but the hero's
 * parts cannot be split along the server/client line: the slide crossfade, the segmented progress
 * indicator, the photograph's entrance and the CTA's entrance are four views of a single clock, and
 * the indicator has to sit in the same grid row stack as the copy it belongs to. Splitting them
 * would mean either duplicating the clock or reaching across components through the DOM to share
 * it. The section element, its geometry and its contract above stay here, where they are rendered
 * on the server and cannot be affected by anything the client does.
 */
export function Hero() {
  return (
    <section data-hero className="relative h-[110svh] w-full overflow-clip bg-secondary">
      {/* An in-flow copy of the header band, which scrolls away with the hero while the FIXED header
          stays hidden over this first screen and only fades in once the hero is behind you. The
          reference runs both instances for the same reason: its own intro copy sits at the very top
          of the next chapter, so a header that were visible there would collide with it — which is
          exactly what happened here before this was mounted.

          Mounting it also arms the fixed header's hide: that gate is conditional on finding this
          band, so if this line is ever removed the fixed header reverts to being visible from the
          first frame rather than leaving the opening with no navigation at all. */}
      <HeroHeaderBand />
      <HeroSlides />
    </section>
  )
}
