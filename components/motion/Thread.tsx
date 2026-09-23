'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * The gradient thread: an 8px window onto a gradient track three times its own height, scrubbed with
 * the page, so the brand colours run along it as the visitor scrolls.
 *
 * It is the layout's connective device — the seam down the hero photograph's inner edge, and the rule
 * that drops through the introduction into the frame below it. The track repeats the full cycle of
 * the palette once per window height (cream → navy → cream → orange), so whatever stretch the window
 * shows is always a gradient with colour in it, never a stretch of cream that vanishes on the page;
 * the scrub moves it by about a window's height across the element's time on screen (`from`/`to` are
 * yPercent of the track).
 *
 * Reduced motion keeps the thread and stops the flow: it is a still gradient rule.
 */
export function Thread({ className, from = -8, to = -40 }: { className?: string; from?: number; to?: number }) {
  const windowRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !windowRef.current || !trackRef.current) return
    const win = windowRef.current
    const track = trackRef.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const t = gsap.fromTo(
          track,
          { yPercent: from },
          {
            yPercent: to,
            ease: 'none',
            // 0.9s of lag ≈ the reference's smoothing of 90 on this interaction.
            scrollTrigger: { trigger: win, start: 'top bottom', end: 'bottom top', scrub: 0.9 },
          }
        )
        kill = () => {
          t.scrollTrigger?.kill()
          t.kill()
        }
      })
      .catch((err) => console.error('[Thread] scrub unavailable; thread renders still', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, from, to])

  return (
    <div ref={windowRef} aria-hidden="true" className={cn('pointer-events-none w-2 overflow-clip', className)}>
      <div
        ref={trackRef}
        className="bg-thread h-[300%] w-full will-change-transform"
        // The resting frame is the scrub's start, so the thread is already in position before the
        // chunk arrives rather than jumping into it.
        style={{ transform: `translateY(${from}%)` }}
      />
    </div>
  )
}
