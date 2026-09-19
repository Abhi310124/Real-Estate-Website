'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

/**
 * Scroll-scrubbed vertical drift, mapped `start: 'top bottom'` → `end: 'bottom top'` with
 * `ease: 'none'`, so the element travels its whole amplitude over exactly the span of scroll
 * during which it could be on screen — no acceleration anywhere in that range, which is what
 * makes the drift read as depth rather than as an animation.
 *
 * **`speed` is a fraction of the element's own height, and positive means downward.** Both halves
 * of that sentence are deliberate:
 *
 *   - Expressed as `yPercent`, so one number is correct for frames of any height. The reference's
 *     amplitude tracks frame height exactly — 40.2px on a 201px frame, 138 on 690, 201.6 on 1008,
 *     288 on 1440 — which a pixel amplitude could only follow by being recomputed per call site.
 *   - Downward is the direction the reference actually moves: its translateY climbs 0 → +288 as
 *     scrollY increases, on every one of the eight frames measured. This component previously
 *     wrote `yPercent: -speed * 100`, so a positive `speed` drifted *up* — against both the sign
 *     of the axis being written and every measured instance of the gesture. Rather than leave that
 *     and make each of the dozen-plus call sites carry a minus sign to get the normal behaviour,
 *     the sign lives here: `speed={0.2}` drifts down, and the rare upward case says so with a
 *     negative number.
 *
 * `trigger` exists because a scrubbed element is often a transformed one — an image held at
 * `scale(1.2)` inside a clipped frame, say. Measuring `top bottom`/`bottom top` against a box that
 * this very tween is moving is circular; pass the static frame instead and the scroll range is
 * fixed by layout alone. Defaults to the wrapper, which is correct whenever the wrapper is
 * untransformed.
 */
// The brief's interface (`<Parallax speed={0.15} className?>{children}</Parallax>`) has
// no testid slot; extended with a passthrough of the rest of the div attributes (same
// reasoning as Reveal) so the motion lab can attach `data-testid="parallax"` for
// Ruling 8's bridge regression test.
type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  /** Travel as a fraction of this element's own height. Positive drifts downward. */
  speed?: number
  /** Untransformed element to measure the scroll range against. Defaults to this wrapper. */
  trigger?: React.RefObject<HTMLElement | null>
}

export function Parallax({ children, speed = 0.15, trigger, className, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current
    const anchor = trigger?.current ?? el
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const tween = gsap.to(el, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: anchor,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            // A scrub tween never "completes" the way a once-triggered reveal does — it
            // stays live for as long as the element can be within its trigger range, so
            // its will-change lifecycle is tied to visibility (onToggle/isActive) rather
            // than to an onComplete callback: set while it could plausibly be moving,
            // cleared the moment it can't be.
            onToggle: (self) => gsap.set(el, { willChange: self.isActive ? 'transform' : 'auto' }),
          },
        })
        kill = () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(el, { willChange: 'auto' })
        }
      })
      .catch((err) => {
        // A failed chunk load must degrade to static, unshifted content, not an
        // unhandled rejection. Degrades correctly by construction: no yPercent was ever
        // applied, so there is nothing to undo. Logged rather than swallowed — a
        // parallax that silently never runs is worth seeing in a console.
        console.error('[Parallax] scroll-linked motion unavailable; content renders unshifted', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, speed, trigger])

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}
