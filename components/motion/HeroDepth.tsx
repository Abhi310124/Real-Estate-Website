'use client'
import { useEffect, useRef } from 'react'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * Pushes a full-bleed photograph back into depth as its section scrolls away: the image eases from
 * rest to a slight zoom and sinks a little slower than the page, so the copy over it lifts off the
 * picture instead of sliding away glued to it. Scrubbed, never timed; renders at rest.
 */
export function HeroDepth({ children, className }: { children: React.ReactNode; className?: string }) {
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
        const t = gsap.fromTo(
          el,
          { scale: 1, yPercent: 0 },
          {
            scale: 1.08,
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top top', end: 'bottom top', scrub: 0.6 },
          }
        )
        kill = () => {
          t.scrollTrigger?.kill()
          t.kill()
          gsap.set(el, { clearProps: 'transform' })
        }
      })
      .catch((err) => console.error('[HeroDepth] depth unavailable; photograph renders at rest', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
