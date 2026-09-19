'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Parallax } from './Parallax'
import { useReducedMotion } from './useReducedMotion'

/**
 * A photograph in a clipped frame: uncovered by a black scrim on entry, and drifting inside that
 * frame for as long as it is on screen. Two mechanics that share a frame and nothing else.
 *
 * **1. The reveal is a shutter, not a bloom.** The reference never fades or scales a photograph on
 * entry. A solid `bg-secondary` panel covering the frame goes `opacity: 1 → 0` in 250ms and the
 * photograph is simply uncovered — measured identically on 12 images across 5 sections, the same
 * sequence every time: 0.869 at 17ms, 0.640 at 50, 0.360 at 100, 0.160 at 150, 0.040 at 200, 0 at
 * 250. That series is exactly `(1 - t/250)²`, a quadratic ease-out, whose CSS form is
 * `cubic-bezier(0.5, 1, 0.89, 1)`. The treatment this replaces animated the image itself from
 * `opacity: 0` and `scale(1.05)` over 1100ms; at 4.4x the duration and on the photograph rather
 * than on a cover, it read as a slow bloom, which is a different gesture rather than a slower one.
 * A bloom asks to be watched; a shutter is over before it has been noticed, and on a page carried
 * by its photography the picture is what should hold attention, not its arrival.
 *
 * The scrim is a *sibling* of the drifting layer and paints above it, so the frame is covered while
 * the photograph is already in its scrubbed position. Uncovering and drifting stay independent.
 *
 * **2. The 1.2x oversize is one transform doing two jobs.** Every image on the reference is
 * `scale(1.2)` with `transform-origin: bottom` inside a clipped frame, and has its translateY
 * scrubbed downward from 0 to 0.2 of the frame's height — 40.2px in a 201px frame, 138 in 690,
 * 201.6 in 1008, 288 in 1440. That travel is precisely the overhang `scale(1.2)` about a bottom
 * origin puts *above* the frame, so the frame is full at both ends of the range and everywhere
 * between: at rest the photograph spans `-0.2H → H`, fully travelled it spans `0 → 1.2H`.
 *
 * The same one scale also widens the photograph to 120% of the frame about its centre — the 828px
 * render inside a 690px frame, reaching x=-49 on a left-hand card, which is why the reference's
 * photography reads as cropped plates rather than as boxed thumbnails. Worth stating plainly
 * because the horizontal 120% and the vertical 0.2H travel look like two separate requirements and
 * are not: a `w-[120%]` layer *inside* a `scale-[1.2]` one would render 993.6px in that 690px
 * frame, a 44% oversize where the reference has 20%, and a non-uniform `scaleY` would distort the
 * photograph. One uniform scale is both the measured construction and the only undistorted one.
 *
 * **Degradation inverts, and must keep inverting.** The scrim's resting state is transparent, and
 * it can only become opaque once `useReducedMotion()` has reported back — which is exactly the
 * moment JS is proven to be running and motion proven to be allowed. A dead chunk or a hydration
 * failure therefore leaves every photograph visible rather than sealed behind a black panel, the
 * same inversion the previous `opacity: 1` rest state provided. The cost is that a frame already on
 * screen at first paint is covered a frame late; the transition is suppressed in the covering
 * direction so that is an instant cover rather than a 250ms fade to black, and `LoadCurtain` is
 * still near-opaque over the whole viewport while it happens.
 *
 * `sizes` is quoted by the caller against the *frame*, so a bleeding frame wants roughly 1.2x its
 * column width to avoid asking the browser for a candidate 20% too small.
 */
type Props = React.HTMLAttributes<HTMLDivElement> & {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  /**
   * Stagger within a group, in ms. Kept because call sites pass it, but it cannot produce a
   * perceived stagger: each instance owns its own IntersectionObserver, and grouped frames sit
   * ~2000px apart, so three "staggered" expertise images actually fired 4.9 SECONDS apart. Real
   * stagger needs one trigger per block driving a timeline over that block's children, which is
   * the section components' job, not this primitive's.
   */
  delayMs?: number
  /**
   * Render the photograph at 1.2x its frame. On by default, because that is the reference's rule
   * for every image on the page. Turning it off shows the whole composition inside the frame, and
   * necessarily also stands it still: the oversize *is* the overhang the drift travels into, so
   * without it there is nothing to travel into and a scrub would only expose empty frame.
   */
  bleed?: boolean
}

export function ImageReveal({
  src,
  alt,
  sizes = '100vw',
  priority,
  delayMs = 0,
  bleed = true,
  className,
  ...rest
}: Props) {
  const frame = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [revealed, setRevealed] = useState(false)

  // `!reduced` is precisely "JS is running and motion is allowed" — the hook starts `true` on every
  // first render by design and can only turn false from its own effect. Deriving the armed state
  // from it means no second effect has to flip a flag just to say the same thing.
  const covered = !reduced && !revealed

  useEffect(() => {
    if (reduced) return
    const el = frame.current
    if (!el) return

    let timer = 0
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          observer.disconnect()
          // Applied here rather than as a CSS transition-delay so a frame already on screen at
          // load still respects its place in a sequence. Zero is the common case and skips the
          // timer entirely, so it costs no extra frame.
          if (delayMs > 0) timer = window.setTimeout(() => setRevealed(true), delayMs)
          else setRevealed(true)
          return
        }
      },
      // 0.95vh: the reference resolves to a single threshold to within ±0.017vh, and reveals at it
      // everywhere. Firing earlier — this was -10% — has the uncover half finished before the
      // frame is comfortably in view, and a threshold that differs between co-located primitives
      // desynchronises them for no designed reason.
      { rootMargin: '0px 0px -5% 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [reduced, delayMs])

  const photograph = <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />

  return (
    <div ref={frame} data-testid="image-reveal" {...rest} className={cn('relative overflow-hidden', className)}>
      {bleed ? (
        // 0.2 of this wrapper's own height, which `yPercent` resolves against its layout box —
        // the frame's height, not the scaled 1.2x of it. The frame is the trigger because this
        // wrapper is the thing being moved.
        <Parallax
          speed={0.2}
          trigger={frame}
          data-image-parallax
          className="relative h-full w-full origin-bottom scale-[1.2] motion-reduce:scale-100"
        >
          {photograph}
        </Parallax>
      ) : (
        <div className="relative h-full w-full">{photograph}</div>
      )}

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
  )
}
