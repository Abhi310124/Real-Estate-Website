'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

// The brief's interface (`<Parallax speed={0.15} className?>{children}</Parallax>`) has
// no testid slot; extended with a passthrough of the rest of the div attributes (same
// reasoning as Reveal) so the motion lab can attach `data-testid="parallax"` for
// Ruling 8's bridge regression test.
type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  speed?: number
}

export function Parallax({ children, speed = 0.15, className, ...rest }: Props) {
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
        const tween = gsap.to(el, {
          yPercent: -speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
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
  }, [reduced, speed])

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}
