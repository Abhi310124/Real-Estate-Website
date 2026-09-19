'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { SplitLines } from '@/components/motion/SplitLines'
import { Parallax } from '@/components/motion/Parallax'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * The client half of the testimonial: four slides on a ten-second cycle, where a slide is a
 * photograph, a portrait, a quote and an attribution that all change together.
 *
 * ## Why this is a carousel at all
 *
 * The reference's testimonial is the busiest block on its page — four crossfading plates, four
 * progress hairlines counting down, and the quote re-entering through its line masks each time.
 * Built as one still quote it is the quietest block on ours, and four hairlines over a single quote
 * would have nothing to indicate. The cycle is the section's structure, not decoration on top of it.
 *
 * ## Geometry
 *
 *   frame        `col-span-6` → 690px at 1440, `aspect-[16/12]` → 517.5px tall
 *   photograph   828 x 621, which is that frame at the uniform 1.2 bleed every image here carries
 *   inactive     `scale-[1.05] opacity-0` — the state a slide rests in before and after its turn
 *   hairlines    3px tracks at 30% white, the live one `w-1/2` and the other three `w-1/6`
 *   portrait     65.5px square: two thirds of a 98.3px cell in a nested 3-column grid, flush right
 *   attribution  15.84px sans over 15.84px mono at -10% tracking, the pair held at 50% opacity
 *
 * The portrait is graded `grayscale`, which is the reference's grade for every avatar under ~80px: at
 * that size a colour photograph of a room reads as a smudge, and desaturating it turns it into a mark
 * beside a name instead.
 *
 * ## The crossfade is asymmetric on purpose
 *
 * Incoming: `opacity 0 → 1` with `scale(1.05) → scale(1)` over 1000ms `power5.out`. Outgoing:
 * `opacity → 0` over 350ms `power2.in`. Both are measured, and the asymmetry is what keeps the frame
 * full — `power5.out` is already at 0.47 after 100ms and 0.88 after 300ms, so an outgoing layer
 * leaving on a slow-starting curve is still nearly opaque underneath while the incoming one rises.
 * Fade both out symmetrically, or clear the outgoing layer up front, and the black frame shows
 * through the crossover, which is the one thing a crossfade between two photographs must not do.
 *
 * Every non-live layer is tweened out, not only the one that was showing: layers already at
 * `opacity: 0` are unaffected, and it removes a previous-index to track that a rapid manual selection
 * could desynchronise.
 *
 * ## The hairlines carry two different pieces of information
 *
 * Which slide is live is the *width* — `w-1/2` against three `w-1/6`. How much of its ten seconds has
 * gone is the *fill*, `scaleX(0) → scaleX(1)` from a left origin, `ease: 'none'` over 10.0s. The
 * linearity is the whole point: an eased fill misreports the time remaining, and the reference's own
 * fill is dead straight at 1e-4 per millisecond.
 *
 * Clicking a hairline selects its slide and stops the rotation for good; the live bar is then drawn
 * full rather than filling, because a bar still counting down to an advance that is never coming is a
 * lie about the state of the component. Copy that replaces itself every ten seconds with no way to
 * halt it is the accessibility failure this pattern always ships with, and a visitor who has taken
 * hold of the controls has said what they want.
 *
 * ## The shutter is not the crossfade
 *
 * A solid `bg-secondary` panel over the frame goes `opacity: 1 → 0` in 250ms the first time the frame
 * is seen, on the quadratic ease-out `ImageReveal` documents. That is the section's entry; the
 * crossfade is what happens forever afterwards. `ImageReveal` itself cannot be reused for it — that
 * component renders exactly one photograph and explicitly forbids fading or scaling it, which is
 * precisely the mechanic a crossfade needs, and four of them stacked in one frame would mean four
 * scrims and four independent parallaxes.
 *
 * Its degradation contract is copied exactly, because that is the part that matters: the scrim rests
 * transparent and can only become opaque once `useReducedMotion()` has answered, which is the moment
 * motion is proven both available and allowed. A dead chunk therefore leaves the photograph visible
 * rather than sealed behind a black panel.
 *
 * ## What a visitor sees when none of this runs
 *
 * Slide one, complete, out of the server HTML. The other three are held back by classes rather than by
 * script, the interval only starts once motion is confirmed, and under `prefers-reduced-motion` the
 * live hairline is drawn rather than filling, so the indicator still reads as "one of four". The
 * hairlines stay clickable in that state, which is how a reduced-motion visitor reaches the other
 * three quotes at all.
 *
 * ## Two details that are load-bearing
 *
 * `leading-[1.2]` on the name and the company. Their step is line-height 1.0, where the line box is
 * narrower than the ink, and a masked reveal on it would shave the descender off "Apartment" for
 * good. At 1.2 the mask is 19px — which is what the reference's own attribution masks measure — and
 * the glyphs clear its edges with room to spare.
 *
 * `min-h` on the quote, reserving the tallest of the four. Four quotes of different lengths sharing
 * one grid cell would otherwise re-lay out the section every ten seconds: a layout shift scored
 * against the page, and a visible jump in everything below it.
 */

export type TestimonialSlide = {
  readonly quote: string
  readonly attribution: string
  readonly company: string
  readonly portrait: string
  readonly portraitAlt: string
  readonly image: string
  readonly imageAlt: string
}

/** Measured interval between caption swaps: 9916ms and 10085ms across three observed cycles. */
const ADVANCE_MS = 10000
/** Seconds. The fill spans the whole interval, so these two are the same number by definition. */
const FILL_SECONDS = 10
const IN_SECONDS = 1
const IN_EASE = 'power5.out'
const OUT_SECONDS = 0.35
const OUT_EASE = 'power2.in'
/** The measured offset between the two attribution lines' masks. */
const COMPANY_DELAY_SECONDS = 0.049

function present<T extends HTMLElement>(nodes: Array<T | null>): T[] {
  return nodes.filter((node): node is T => node !== null)
}

export function TestimonialCarousel({ slides }: { slides: readonly TestimonialSlide[] }) {
  const [index, setIndex] = useState(0)
  const [rotating, setRotating] = useState(true)
  const [seen, setSeen] = useState(false)
  const reduced = useReducedMotion()

  const frame = useRef<HTMLDivElement>(null)
  const plates = useRef<Array<HTMLDivElement | null>>([])
  const portraits = useRef<Array<HTMLDivElement | null>>([])
  const fills = useRef<Array<HTMLSpanElement | null>>([])

  // `!reduced` is exactly "JS is running and motion is allowed", so the cover is armed by the same
  // fact that arms everything else here rather than by a second flag of its own.
  const covered = !reduced && !seen

  useEffect(() => {
    if (reduced) return
    const el = frame.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.disconnect()
          setSeen(true)
          return
        }
      },
      // The single 0.95vh threshold every entry animation on the page shares.
      { rootMargin: '0px 0px -5% 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  useEffect(() => {
    if (reduced || !rotating) return
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), ADVANCE_MS)
    return () => window.clearInterval(timer)
  }, [reduced, rotating, slides.length])

  useEffect(() => {
    if (reduced) return

    let cancelled = false
    let kill: (() => void) | undefined

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return

        const tweens: Array<ReturnType<typeof gsap.to>> = []

        slides.forEach((_, i) => {
          const layers = present([plates.current[i], portraits.current[i]])
          if (layers.length === 0) return
          tweens.push(
            i === index
              ? gsap.to(layers, {
                  opacity: 1,
                  scale: 1,
                  duration: IN_SECONDS,
                  ease: IN_EASE,
                  overwrite: 'auto',
                })
              : gsap.to(layers, {
                  opacity: 0,
                  scale: 1.05,
                  duration: OUT_SECONDS,
                  ease: OUT_EASE,
                  overwrite: 'auto',
                })
          )
        })

        // Every fill back to empty, then the live one counts out its ten seconds. Resetting all four
        // rather than only the one just vacated is what stops a manual jump backwards from leaving a
        // stale bar sitting full.
        const bars = present(fills.current)
        if (bars.length > 0) gsap.set(bars, { scaleX: 0 })
        const live = fills.current[index]
        if (live && rotating) {
          tweens.push(gsap.to(live, { scaleX: 1, duration: FILL_SECONDS, ease: 'none', overwrite: 'auto' }))
        } else if (live) {
          // Rotation stopped. A bar that keeps filling would be counting down to an advance that is
          // never coming, so the live one is simply drawn — width says which slide, fill says it is
          // the one being shown.
          gsap.set(live, { scaleX: 1 })
        }

        kill = () => tweens.forEach((tween) => tween.kill())
      })
      .catch((err) => {
        // Degrades to the CSS resting state: slide one visible, the rest held back by their own
        // classes, the hairlines empty. Nothing was hidden by script, so there is nothing to undo.
        console.error('[TestimonialCarousel] slide motion unavailable; first slide renders static', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [index, reduced, rotating, slides])

  if (slides.length === 0) return null
  const active = slides[index]

  const select = (i: number) => {
    setIndex(i)
    setRotating(false)
  }

  return (
    <div data-testimonial-carousel className="w-full">
      {/* 690 x 517.5 at 1440. `bg-secondary` beneath the plates so the frame is black rather than
          transparent for the 250ms the shutter takes to clear. */}
      <div ref={frame} className="relative aspect-[16/12] w-full overflow-hidden bg-secondary">
        <Parallax
          speed={0.2}
          trigger={frame}
          className="relative h-full w-full origin-bottom scale-[1.2] motion-reduce:scale-100"
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              ref={(node) => {
                plates.current[i] = node
              }}
              // A slide nobody can see should not be described to anybody either: three extra alt
              // texts in the accessibility tree announce a photograph that is not on screen.
              aria-hidden={i !== index}
              // Keyed off `index` rather than off `i > 0` so that selecting a slide with no motion
              // available still shows that slide's photograph. Once GSAP has run it writes inline
              // styles over these, which is why the two cannot fight.
              className={cn('absolute inset-0 h-full w-full', i !== index && 'scale-[1.05] opacity-0')}
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                // 58vw, not 48: the plate renders at 1.2x the column, so a hint quoted against the
                // column asks the browser for a candidate 20% too small.
                sizes="(min-width: 640px) 58vw, 110vw"
                className="object-cover saturate-[1.12]"
              />
            </div>
          ))}
        </Parallax>

        <div
          data-image-scrim
          aria-hidden="true"
          style={{ opacity: covered ? 1 : 0 }}
          className={cn(
            'pointer-events-none absolute inset-0 z-10 bg-secondary motion-reduce:hidden',
            covered ? 'transition-none' : 'transition-opacity duration-[250ms] ease-[cubic-bezier(0.5,1,0.89,1)]'
          )}
        />
      </div>

      {/* The tracks sit in their own 20px-padded row directly under the frame, so the hairlines read
          as a scale beneath the photograph rather than as a border on it. */}
      <div data-testimonial-progress className="flex w-full gap-[var(--gutter)]">
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            onClick={() => select(i)}
            aria-label={`Show testimonial ${i + 1} of ${slides.length}`}
            aria-current={i === index}
            className={cn(
              'cursor-pointer py-[var(--gutter)]',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
              i === index ? 'w-1/2' : 'w-1/6'
            )}
          >
            <span className="block h-[3px] w-full bg-primary/30">
              <span
                ref={(node) => {
                  fills.current[i] = node
                }}
                className={cn(
                  'block h-full w-full origin-left scale-x-0 bg-primary',
                  i === index && 'motion-reduce:scale-x-100'
                )}
              />
            </span>
          </button>
        ))}
      </div>

      {/* `items-end` bottom-aligns the quote with the attribution beside it; the attribution then opts
          out with `self-start` so its portrait hangs from the top of the row instead.

          Below `sm` the quote takes the whole row and the attribution drops beneath it. The reference
          keeps both at three of six columns there, which works on its grid because its own columns
          halve on small screens; held at half of a 390px screen our 125-character quote wraps to
          eleven lines of eleven characters. */}
      <figure className="grid grid-cols-6 items-end gap-[var(--gutter)]">
        <SplitLines
          as="blockquote"
          text={active.quote}
          // Five lines of the 23.04px/27.648px step, reserved so a shorter quote cannot pull the
          // section up around itself mid-cycle.
          className="col-span-6 min-h-[9.6vw] text-body max-sm:min-h-[31.2vw] max-sm:text-body-sm sm:col-span-3"
        />

        <figcaption className="col-span-6 self-start max-sm:mt-[6vw] sm:col-span-3">
          <div className="grid grid-cols-3 gap-[var(--gutter)]">
            <div className="col-span-1 flex justify-end">
              {/* Two thirds of the cell, flush right: 65.5px at 1440. Full width of the cell below
                  `sm`, where the cell is small enough already. */}
              <div className="relative aspect-square w-full overflow-hidden bg-secondary sm:w-2/3">
                {slides.map((slide, i) => (
                  <div
                    key={i}
                    ref={(node) => {
                      portraits.current[i] = node
                    }}
                    aria-hidden={i !== index}
                    className={cn('absolute inset-0 h-full w-full', i !== index && 'scale-[1.05] opacity-0')}
                  >
                    <Image
                      src={slide.portrait}
                      alt={slide.portraitAlt}
                      fill
                      sizes="(min-width: 640px) 5vw, 30vw"
                      className="object-cover grayscale"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-[0.25vw] opacity-50">
              <SplitLines
                as="span"
                text={active.attribution}
                className="block text-label leading-[1.2] max-sm:text-label-sm"
              />
              <SplitLines
                as="span"
                text={active.company}
                delay={COMPANY_DELAY_SECONDS}
                className="block font-mono text-mono leading-[1.2] max-sm:text-mono-sm"
              />
            </div>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}
