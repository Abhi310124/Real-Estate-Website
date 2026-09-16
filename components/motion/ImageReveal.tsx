'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

type Props = {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  className?: string
}

export function ImageReveal({ src, alt, sizes = '100vw', priority, className }: Props) {
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
        gsap.set(o, { clipPath: 'inset(0 0 100% 0)' })
        gsap.set(i, { scale: 1.12, willChange: 'transform' })
        const tl = gsap
          .timeline({ scrollTrigger: { trigger: o, start: 'top 85%', once: true } })
          .to(o, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.out' })
          .to(
            i,
            { scale: 1, duration: 1.4, ease: 'expo.out', onComplete: () => gsap.set(i, { willChange: 'auto' }) },
            0,
          )
        kill = () => {
          tl.scrollTrigger?.kill()
          tl.kill()
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
    <div ref={outer} data-testid="image-reveal" className={`relative overflow-hidden ${className ?? ''}`}>
      <div ref={inner} className="relative h-full w-full">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  )
}
