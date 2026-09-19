'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

// Extends the brief's `{ children, delay?, className? }` with a passthrough for the
// rest of the standard div attributes (React.HTMLAttributes), so a caller can attach
// `data-testid`, `aria-*`, etc. without this component needing to know about every
// attribute name in advance. The motion lab relies on this to give its Reveal instance
// a `data-testid="reveal"` — the brief's interface has no testid slot at all, and
// without one Step 5's harness would have nothing stable to select in tests.
type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  delay?: number
}

export function Reveal({ children, delay = 0, className, ...rest }: Props) {
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
        gsap.set(el, { opacity: 0, y: 28, willChange: 'transform, opacity' })
        const t = gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          // `top 95%` is the one enter threshold used by every reveal primitive here, and it is the
          // reference's: a 15px-step probe of two unrelated sections put its trigger band at
          // 0.938–0.957 of viewport height. An earlier threshold is a false economy — the element
          // starts moving 45–72px sooner, so it is already half settled by the time it is
          // comfortably on screen, and co-located elements on differing thresholds desynchronise
          // for no designed reason.
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
          onComplete: () => gsap.set(el, { willChange: 'auto' }),
        })
        kill = () => {
          t.scrollTrigger?.kill()
          t.kill()
        }
      })
      .catch((err) => {
        // A chunk that fails to load must degrade to fully visible, unanimated content,
        // not an unhandled rejection. This degrades correctly by construction: the
        // gsap.set(..., { opacity: 0 }) above never ran, so the element was never hidden
        // in the first place. Logged rather than swallowed — a reveal that silently
        // never runs is worth seeing in a console.
        console.error('[Reveal] reveal unavailable; content renders at its natural, visible state', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, delay])

  // Renders opaque by default; only JS hides it, and only once motion is confirmed allowed.
  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}
