'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Turns its child with the scroll — the layout's soft triangles, which rotate half a turn as their
 * section passes (a full turn on the About page).
 *
 * The reference turns them flat, about Z only. Here the same half-turn also tips the shape back
 * through X and swings it through Y, under a perspective, so it reads as a solid object turning in
 * space rather than a sticker spinning on the page. The Z travel — the part the reference specifies —
 * is unchanged: `turn` degrees across the element's time on screen, scrubbed with about a second of
 * lag (the reference smooths this interaction at 80–85).
 */
export function ScrollRotate({
  children,
  className,
  turn = 180,
  tilt = 24,
}: {
  children: React.ReactNode
  className?: string
  /** Degrees about Z across the scroll range. */
  turn?: number
  /** Peak degrees about X and Y — the 3D component. 0 gives the reference's flat spin. */
  tilt?: number
}) {
  const stage = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !stage.current || !body.current) return
    const el = body.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: stage.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
        tl.fromTo(el, { rotationZ: 0 }, { rotationZ: turn, duration: 1 }, 0)
          // Out and back through the tilt, so the shape faces the viewer at both ends of its travel.
          .fromTo(el, { rotationX: 0, rotationY: 0 }, { rotationX: tilt, rotationY: -tilt * 0.75, duration: 0.5 }, 0)
          .to(el, { rotationX: 0, rotationY: 0, duration: 0.5 }, 0.5)
        kill = () => {
          tl.scrollTrigger?.kill()
          tl.kill()
        }
      })
      .catch((err) => console.error('[ScrollRotate] scrub unavailable; shape renders still', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, turn, tilt])

  return (
    <div ref={stage} aria-hidden="true" className={cn('pointer-events-none [perspective:1400px]', className)}>
      <div ref={body} className="h-full w-full will-change-transform [transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  )
}
