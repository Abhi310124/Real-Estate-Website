'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

// Extends the brief's `{ src, alt, sizes?, priority?, className? }` with a passthrough for the
// rest of the standard div attributes, matching Reveal/Parallax/SplitWords. The hardcoded
// `data-testid="image-reveal"` below stays as the *default* — it is spread over by `rest`, so a
// caller can name each instance. Two ImageReveals in one gallery would otherwise make
// `page.locator('[data-testid="image-reveal"]')` resolve to two elements and trip Playwright's
// strict mode.
type Props = React.HTMLAttributes<HTMLDivElement> & {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
}

export function ImageReveal({ src, alt, sizes = '100vw', priority, className, ...rest }: Props) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !outer.current || !inner.current) return
    const o = outer.current
    const i = inner.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        // The outer element is the clip-path target and gets its own will-change hint: it was
        // the one animated element in this batch with no hint at all, while the inner scale
        // target had one. Hinted on trigger and cleared on completion, same lifecycle as every
        // other primitive here.
        gsap.set(o, { clipPath: 'inset(0 0 100% 0)', willChange: 'clip-path' })
        gsap.set(i, { scale: 1.12, willChange: 'transform' })
        const tl = gsap
          .timeline({ scrollTrigger: { trigger: o, start: 'top 85%', once: true } })
          .to(o, {
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.4,
            ease: 'expo.out',
            onComplete: () => gsap.set(o, { willChange: 'auto' }),
          })
          .to(
            i,
            { scale: 1, duration: 1.4, ease: 'expo.out', onComplete: () => gsap.set(i, { willChange: 'auto' }) },
            0,
          )
        kill = () => {
          tl.scrollTrigger?.kill()
          tl.kill()
          // Killed mid-flight (a reduced-motion flip re-runs this effect while both elements
          // stay mounted) must not strand will-change on a live element — same reasoning as
          // Parallax's and Marquee's cleanup.
          gsap.set([o, i], { willChange: 'auto' })
        }
      })
      .catch((err) => {
        // A failed chunk load must degrade to the fully unclipped, unscaled image, not
        // an unhandled rejection. This degrades correctly by construction: neither
        // gsap.set() above ran, so the image was never clipped or scaled in the first
        // place. Logged rather than swallowed — a reveal that silently never runs is
        // worth seeing in a console.
        console.error('[ImageReveal] reveal unavailable; image renders fully visible and unclipped', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <div
      ref={outer}
      data-testid="image-reveal"
      {...rest}
      className={`relative overflow-hidden ${className ?? ''}`}
    >
      <div ref={inner} className="relative h-full w-full">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  )
}
