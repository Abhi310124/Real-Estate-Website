'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Rule } from '@/components/ui/Rule'
import { Button } from '@/components/ui/Button'
import { SplitWords } from '@/components/motion/SplitWords'
import { Parallax } from '@/components/motion/Parallax'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { getGsap } from '@/components/motion/gsap'
import type { SiteSettings } from '@/lib/data'

type Props = { settings: SiteSettings }

// Ruling 4: the hero background is a raw next/image with priority+fill, not ImageReveal —
// ImageReveal starts its clip-path at zero visible height and only reveals once its own
// ScrollTrigger fires, which would race (and likely fail) the "hero image is a priority
// LCP candidate" test's very first, above-the-fold paint. A priority+fill image has no
// such gate.
//
// Ruling 10: Parallax's yPercent is relative to *its own* (wrapper) element's height, and
// its ScrollTrigger range (`top bottom` .. `bottom top`, scrubbed) is already
// half-elapsed the moment a full-viewport-tall hero sitting at the very top of the page
// first paints — the range's notional start would require the page to have scrolled to
// y = -100svh, which never happens, so at first paint the tween is already at 50% of its
// travel (~14% of the wrapper's own height, at speed 0.28), before the user has scrolled a
// single pixel. A wrapper sized exactly to the section has no spare pixels to absorb that
// shift and shows a gap at its own bottom edge on first paint.
//
// A first attempt overscanned by 25% top+bottom (`-inset-y-[25%]`, wrapper 150% as tall as
// the section) on the reasoning above alone. Measured empirically with Playwright
// (evaluating the wrapper's and section's real bounding rects across a scroll sweep — see
// the Task 10 report) that 25% was NOT enough: the gap is worst not at first paint but
// right as the section finishes scrolling out of view, because growing the wrapper also
// grows the *travel distance* (yPercent is relative to the wrapper's own, now-larger,
// height), which eats into the added overscan. Working the exact scrub-range algebra for a
// wrapper overscanned by fraction f each side (height Hw = Hs·(1+2f)) sitting at the very
// top of the page (document offset 0), with Hs ≈ viewport height (min-h-[100svh]):
//
//   progress at the critical point (section's bottom edge reaching the viewport's top,
//   i.e. the last moment the section is visible at all):
//     p_crit = (Hs(1+f) + Hv) / (Hs(1+2f) + Hv)
//   bottom margin at that point, as a fraction of Hs:
//     f − speed · p_crit · (1+2f)
//
// which must stay ≥ 0. At speed 0.28 with Hs≈Hv, f=0.25 gives a margin of roughly −13%
// (a real, growing gap from ~1/3 of the way down the hero onward, confirmed visually — the
// section's own bg-navy-800 showing through underneath, not a blank/white tear, but a real
// seam) while f=0.6 gives a comfortable +10% margin (~90px on a ~900px viewport) at that
// same critical point. Re-verified empirically after raising the overscan to 60%: the
// wrapper's bottom edge stays below the section's bottom edge across the full scroll sweep
// (see the Task 10 report for the before/after measurements and screenshots). The added
// height on the *top* side buys nothing (that edge is never at risk — shifting up only ever
// helps the top margin) but is kept symmetric for simplicity, at the minor cost of somewhat
// more horizontal object-cover cropping of the background image's sides.
const IMAGE_OVERSCAN_CLASS = 'absolute inset-x-0 -inset-y-[60%]'

export function Hero({ settings }: Props) {
  const reduced = useReducedMotion()
  const kenBurnsRef = useRef<HTMLDivElement>(null)

  // 20s ken-burns scale, skipped entirely under reduced motion. Targets an inner wrapper
  // around the image (not the Parallax div itself) so this scale composes cleanly with
  // Parallax's own scroll-linked translateY, the same outer/inner split ImageReveal uses
  // for its own clip-path + scale pair.
  useEffect(() => {
    if (reduced || !kenBurnsRef.current) return
    const el = kenBurnsRef.current
    let cancelled = false
    let kill: (() => void) | undefined

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        gsap.set(el, { scale: 1, willChange: 'transform' })
        const tween = gsap.to(el, {
          scale: 1.08,
          duration: 20,
          ease: 'none',
          onComplete: () => gsap.set(el, { willChange: 'auto' }),
        })
        kill = () => {
          tween.kill()
          gsap.set(el, { willChange: 'auto' })
        }
      })
      .catch((err) => {
        // A failed chunk load must degrade to a static, unscaled background, not an
        // unhandled rejection — same pattern as every other motion primitive here.
        console.error('[Hero] ken-burns unavailable; background renders static', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <section data-hero className="relative flex min-h-[100svh] items-end overflow-hidden bg-navy-800">
      <Parallax speed={0.28} aria-hidden="true" className={IMAGE_OVERSCAN_CLASS}>
        <div ref={kenBurnsRef} className="relative h-full w-full">
          <Image
            src="/hero/home-hero.png"
            alt="Stylised night skyline over a Hyderabad growth corridor, rendered in BKR INFRA's navy and champagne palette"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Parallax>

      {/* Navy scrim: white text over it clears 4.5:1 regardless of what sits underneath. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-navy-900/20"
      />

      {/* pb-16, not pb-28: the section is `items-end`, so this content box is bottom-pinned and
          growing `pt` cannot lower its top edge — the box just grows upward by the same amount
          and the eyebrow stays put. Shrinking the bottom padding is what actually moves the top
          edge down, and it needed to: at pb-28 the eyebrow rendered underneath the fixed
          header and the hamburger icon was drawn on top of it. Verified by measuring both
          rects, not by eye. */}
      <Parallax speed={0.12} className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6">
        <Eyebrow className="text-champagne">REDEFINING REAL ESTATE EXCELLENCE</Eyebrow>
        <SplitWords
          as="h1"
          className="mt-6 font-display-expanded text-display-xl text-white"
          text={settings.tagline}
        />
        <Rule className="mt-6" />
        <p className="mt-6 max-w-xl text-body-lg text-white">
          BKR INFRA develops open plots, villas, apartments and independent houses across
          Hyderabad&apos;s fastest-growing corridors — engineered, designed and delivered
          without compromise.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/projects">View Projects</Button>
          <Button href="/contact" variant="outline" tone="white">
            Enquire Now
          </Button>
        </div>
      </Parallax>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/60 p-1 motion-safe:animate-bounce">
          <span className="h-2 w-1 rounded-full bg-white/80" />
        </div>
      </div>
    </section>
  )
}
