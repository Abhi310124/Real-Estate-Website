import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { HERO } from '@/lib/content/home'

/**
 * Full-bleed hero, `110svh`.
 *
 * The over-tall section is deliberate and is the whole trick behind the reference's opening: at
 * 110svh the photograph is always taller than the viewport, so the next section is already
 * encroaching as you begin to scroll and the page feels continuous rather than paged. `svh` not
 * `vh`, so mobile browser chrome cannot crop it.
 *
 * The copy sits bottom-left at body size — small, not a display line. That restraint is what makes
 * the photograph the subject. A large heading here would fight it.
 *
 * `priority` on the image because it is unambiguously the LCP element; the scrim keeps white text
 * over 4.5:1 regardless of what the photograph does behind it.
 */
export function Hero() {
  return (
    <section data-hero className="relative h-[110svh] w-full bg-secondary">
      <div className="absolute inset-0">
        <Image
          src={HERO.image}
          alt={HERO.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Gradient rather than a flat wash: the copy only needs protecting at the bottom, and a
            flat overlay would mute the sky, which is most of what the photograph is for. */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-secondary/10 to-secondary/25" />
      </div>

      {/* The copy block sits at 12svh from the bottom rather than a `vw` padding: the hero is sized
          in `svh`, so anchoring its contents in `vw` meant the button clipped off the bottom edge
          at wide-but-short viewports. Height-relative spacing inside a height-sized section. */}
      <div className="layout-grid absolute inset-x-0 bottom-[12svh] items-end text-primary max-sm:bottom-[18svh]">
        <div className="col-span-12 sm:col-span-5">
          <RuleDraw className="mb-[1.6vw] text-primary max-sm:mb-[5vw]" />
          {/* An <h1>, not a <p>, despite being set at body size. The reference's hero carries no
              visible display heading either — but a page still needs exactly one top-level
              heading, for assistive tech and for search. This statement IS the page's heading;
              an h1 is not obliged to be the largest thing on screen. The alternative, a
              visually-hidden h1 duplicating this text, would make screen readers announce the
              same sentence twice. */}
          <h1 className="text-body max-sm:text-body-sm">{HERO.copy}</h1>
        </div>

        <div className="col-start-1 col-end-13 mt-[3vw] sm:col-start-7 sm:col-end-11 sm:mt-0">
          <Button href={HERO.cta.href} tone="light" className="w-full sm:w-auto">
            {HERO.cta.label}
          </Button>
        </div>
      </div>
    </section>
  )
}
