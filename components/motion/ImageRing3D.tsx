'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * The tilted 3D ring of project images, rotating as you scroll — the reference's signature moment.
 *
 * ## Geometry (measured off the live reference at 1440×900)
 *
 *   stage     114.4vw square, `perspective: 132vw`
 *   pose      `rotate3d(0.27, -1.005, 1.5, 85deg)` — STATIC tilt, never animates
 *   rotator   `rotate(Z)` where Z is scroll-scrubbed — this is the animation
 *   cells     8 full-size layers, each `rotate(45deg × i)`
 *   items     13.2vw × 11.12vw, `left-1/2 -translate-x-1/2`, `bottom: calc(50% + 44vw)`
 *   rest      `opacity: 0.4`, brightening on hover
 *
 * Two nested wrappers, and the split is the whole trick: the outer one holds the fixed tilt that
 * gives the ring its lean, and the inner one spins flat inside it. Rotating a single combined
 * transform instead would make the ring tumble rather than turn.
 *
 * ## The rotation
 *
 * Scroll-scrubbed, linear, **0° → 100°**, from the section's top entering the viewport bottom to its
 * bottom reaching the viewport bottom, then held. Sampled every 250px on the reference it is
 * dead straight at 0.0505°/px:
 *
 *   y=900 → 40.91°   y=1150 → 53.54°   y=1400 → 66.16°
 *   y=1650 → 78.79°  y=1900 → 91.41°   y≥2150 → 100° (clamped)
 *
 * Extrapolating that line backwards lands 0° at y=90, which is exactly where the section's top
 * crosses the viewport bottom, and 100° at y=2070, exactly the section's bottom edge. Hence
 * `start: 'top bottom'`, `end: 'bottom bottom'`, `ease: 'none'`.
 *
 * An earlier version of this file claimed the ring was static. That was a measurement error, not a
 * design decision: there are FOUR `preserve-3d` elements on the reference (two rings, each with a
 * pose wrapper and a rotator), and probing only the first one found the static pose and stopped
 * there. Worth stating plainly so nobody re-derives the wrong conclusion from the same shortcut.
 *
 * ## Fragility
 *
 * `preserve-3d` is destroyed by any ancestor that establishes a containing block — an
 * `overflow: hidden`, a `filter`, or its own `transform`. If the ring ever renders flat, that is the
 * cause, and it will be a parent, not this file. The clip on the manifesto section is deliberately
 * two levels up for exactly this reason.
 */

const RING_RADIUS = '44vw'
const STAGE = '114.4vw'
const PERSPECTIVE = '132vw'
const ITEM_W = '13.2vw'
const ITEM_H = '11.12vw'
const CELL_COUNT = 8

/** The measured static tilt. Not animated — the rotator inside it is. */
const POSE = 'rotate3d(0.27, -1.005, 1.5, 85deg)'

/** Measured sweep, in degrees, across the trigger's scroll range. */
const ROTATION_FROM = 0
const ROTATION_TO = 100

export type RingItem = { href: string; src: string; alt: string; label: string }

export function ImageRing3D({
  items,
  className,
  scrub = true,
}: {
  items: RingItem[]
  className?: string
  /** The reference's preview-card miniature holds still while the full-size ring turns. */
  scrub?: boolean
}) {
  const [active, setActive] = useState<number | null>(null)
  const rotator = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!scrub || reduced) return
    const el = rotator.current
    if (!el) return

    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return

        // The section is the trigger, not the ring: the ring is 114.4vw tall and scaled, so its own
        // box bears no useful relationship to the scroll distance the rotation is mapped against.
        const trigger = el.closest('section') ?? el

        const tween = gsap.fromTo(
          el,
          { rotate: ROTATION_FROM },
          {
            rotate: ROTATION_TO,
            // Linear, because the measured samples are linear. An eased scrub would be smoother in
            // isolation and wrong here — it would not track the reference at any midpoint.
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top bottom',
              // `bottom top`, not `bottom bottom`. The reference's sweep spans 1980px at a 900px
              // viewport — 0° at scrollY 90 (section top crossing the viewport bottom) through 100°
              // at scrollY 2070, which is the section's bottom edge reaching the viewport TOP, i.e.
              // the section having fully passed through. `bottom bottom` ends 900px earlier and made
              // the ring turn 1.83× too fast: measured 0.0926°/px against the reference's 0.0505.
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        )

        kill = () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          // Leaving a rotation and a will-change hint on a detached node is how a scroll-linked
          // tween turns into a phantom layer after a route change.
          gsap.set(el, { clearProps: 'transform,willChange' })
          ScrollTrigger.refresh()
        }
      })
      .catch((err) => {
        // Degrades correctly by construction: nothing above ran, so the rotator keeps the static
        // resting angle set inline below and the ring is still a composed, legible arrangement.
        console.error('[ImageRing3D] scroll-linked rotation unavailable; ring renders static', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [scrub, reduced])

  // Always render exactly 8 cells so the ring is never lopsided; if fewer images are supplied they
  // repeat around it. A ring with a visible gap looks broken rather than sparse.
  const cells = Array.from({ length: CELL_COUNT }, (_, i) => items[i % items.length])

  // Resting angle. Mid-sweep rather than 0° so that a reduced-motion visitor, or anyone whose GSAP
  // chunk failed, still sees the ring as a composed arrangement rather than at one extreme of a
  // rotation they will never see move.
  const restAngle = scrub && !reduced ? ROTATION_FROM : (ROTATION_FROM + ROTATION_TO) / 2

  return (
    <div className={cn('relative', className)} style={{ width: STAGE, height: STAGE, perspective: PERSPECTIVE }}>
      {/* Pose: the fixed tilt. */}
      <div className="size-full" style={{ transformStyle: 'preserve-3d', transform: POSE }}>
        {/* Rotator: spins flat inside the tilt. `transform-origin` stays at the default centre,
            which on a 114.4vw square is the stage centre — the same 823.677px the reference reports
            at 1440. */}
        <div
          ref={rotator}
          data-ring-rotator
          className="size-full"
          style={{ transformStyle: 'preserve-3d', transform: `rotate(${restAngle}deg)` }}
        >
          {cells.map((item, i) => (
            <div
              key={i}
              // pointer-events-none on the cell, auto on the item: the cell is a full 114vw square,
              // so leaving it interactive would blanket the section in an invisible hit area and
              // steal every click meant for the copy underneath.
              className="pointer-events-none absolute inset-0"
              style={{ transform: `rotate(${(360 / CELL_COUNT) * i}deg)` }}
            >
              <Link
                href={item.href}
                aria-label={item.label}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn(
                  'pointer-events-auto absolute left-1/2 block -translate-x-1/2 overflow-hidden',
                  'transition-opacity duration-300 ease-in-out motion-reduce:transition-none',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
                )}
                style={{
                  width: ITEM_W,
                  height: ITEM_H,
                  bottom: `calc(50% + ${RING_RADIUS})`,
                  opacity: active === i ? 1 : 0.4,
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  // Small on screen (13.2vw) — a wide `sizes` here would fetch a 2400px file for a
                  // ~190px box, eight times over, and dominate the page's transfer budget.
                  sizes="15vw"
                  className="object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
