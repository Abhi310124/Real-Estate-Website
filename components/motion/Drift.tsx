'use client'
import { useEffect, useRef } from 'react'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Scrubs its content vertically as it crosses the viewport — the layout's introduction statement,
 * which rises from 3rem below its resting line to 3px above it over the first 80% of its time on
 * screen, then holds, with about 0.8s of smoothing.
 *
 * Renders at rest (y = 0). The scrub only begins once script has confirmed motion is allowed, and it
 * is a small travel, so the pre-script frame and the scrubbed frame are never far apart.
 */
export function Drift({
  children,
  className,
  from = 48,
  to = -3,
  until = 0.8,
}: {
  children: React.ReactNode
  className?: string
  /** Start offset in px. */
  from?: number
  /** End offset in px. */
  to?: number
  /** Fraction of the scroll range by which `to` is reached; the rest holds. */
  until?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        })
        tl.fromTo(el, { y: from }, { y: to, duration: until }).to(el, { y: to, duration: 1 - until })
        kill = () => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(el, { clearProps: 'transform' })
        }
      })
      .catch((err) => console.error('[Drift] scrub unavailable; content renders at rest', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, from, to, until])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
