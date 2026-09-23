'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * A rule in the brand gradient that draws itself out from the left as it comes into view — 2000ms on
 * an in-out quint, the layout's divider between a page's feature and its listing.
 *
 * Drawn with `scaleX` from a left origin rather than by animating `width`, which would re-lay-out the
 * row on every frame for two seconds. Renders drawn; only script collapses it, just before drawing it.
 */
export function GradientRule({ className }: { className?: string }) {
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
          { scaleX: 0 },
          { scaleX: 1, duration: 2, ease: 'power4.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }
        )
        kill = () => {
          t.scrollTrigger?.kill()
          t.kill()
          gsap.set(el, { clearProps: 'transform' })
        }
      })
      .catch((err) => console.error('[GradientRule] draw unavailable; rule renders drawn', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return <div ref={ref} aria-hidden="true" className={cn('bg-brand-x h-[3px] w-full origin-left rounded-full', className)} />
}
