'use client'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * The hairline that draws itself in — the most frequently used motion on the reference, used to
 * separate every block and to underline the hero copy.
 *
 * The transition itself lives in `.in-out-line` in `app/globals.css` (300ms,
 * `cubic-bezier(0.4, 0, 0.2, 1)`, `transform-origin: right`) so that reduced-motion users get the
 * line already drawn from a plain media query, with no JS involved. This component's only job is
 * to flip `data-drawn` when the rule enters the viewport.
 *
 * `transform-origin: right` is worth preserving deliberately: the line grows right-to-left,
 * against the reading direction. Drawn left-to-right it reads as text being underlined; drawn
 * from the right it reads as a drafting gesture, which is the register the whole design is in.
 *
 * IntersectionObserver rather than a scroll listener or ScrollTrigger — it is a one-shot enter
 * trigger with no scroll-linked progress, and it needs to keep working when motion is reduced and
 * GSAP is never loaded.
 */
export function RuleDraw({ className, delayMs = 0 }: { className?: string; delayMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || drawn) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          // Stagger is applied here rather than as a CSS transition-delay so that a rule which
          // is already on screen at load still respects its place in a sequence.
          const t = window.setTimeout(() => setDrawn(true), delayMs)
          observer.disconnect()
          return () => window.clearTimeout(t)
        }
      },
      // Fires a little before the rule reaches the fold, so the draw is already underway by the
      // time it is comfortably in view rather than starting at the very edge of the screen.
      { rootMargin: '0px 0px -12% 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [drawn, delayMs])

  return <span ref={ref} data-drawn={drawn ? 'true' : 'false'} className={cn('in-out-line block', className)} />
}
