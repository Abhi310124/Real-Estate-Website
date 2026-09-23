'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * A photograph whose covering block drops away as it scrolls into view — the layout's card-image
 * entrance: a tinted block the full size of the frame, translated straight down out of it on the
 * `reveal` curve (cubic-bezier(0.8, 0, 0.4, 1)).
 *
 * The reference drops its block in 300ms and does nothing else. Here the photograph also settles from
 * a slight push (1.08 → 1) on the slower `zoom` curve under the block as it goes, so the frame arrives
 * with some depth instead of simply being uncovered. The block's own timing is the reference's.
 *
 * `zoom` adds the layout's hover push — scale 1.1 over 1000ms on the `zoom` curve — read off the
 * nearest `.group`, so the whole card is the hover target, not just the photograph.
 *
 * Renders uncovered: the block only covers the frame once script has confirmed it is about to
 * animate it off again. The image is a `fill` image, so the frame needs its own size or aspect — or
 * pass `fill` to have the frame itself fill its positioned parent.
 */
export function RevealImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  preload = false,
  zoom = false,
  fill = false,
}: {
  src: string
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  /** For the one frame that is the page's LCP element. */
  preload?: boolean
  zoom?: boolean
  /** Make the frame `absolute inset-0` inside a positioned, sized parent instead of `relative`. */
  fill?: boolean
}) {
  const frame = useRef<HTMLDivElement>(null)
  const block = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !frame.current || !block.current) return
    const el = frame.current
    const cover = block.current
    const img = el.querySelector('img')
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          // Hand the transform back to CSS so the hover push can run on it.
          onComplete: () => {
            if (img) gsap.set(img, { clearProps: 'transform' })
          },
        })
        // Explicit `y: 0` alongside the percentage: the block's resting class is `translate-y-full`,
        // which GSAP would otherwise read back as a pixel offset and fold into the tween.
        tl.fromTo(cover, { y: 0, yPercent: 0 }, { yPercent: 100, duration: 0.3, ease: 'reveal' }, 0)
        if (img) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.2, ease: 'zoom' }, 0)
        kill = () => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(cover, { clearProps: 'transform' })
          if (img) gsap.set(img, { clearProps: 'transform' })
        }
      })
      .catch((err) => console.error('[RevealImage] reveal unavailable; image renders uncovered', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <div ref={frame} className={cn(fill ? 'absolute inset-0' : 'relative', 'overflow-clip', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={cn(
          'object-cover',
          zoom && 'transition-transform duration-1000 ease-zoom group-hover:scale-110 motion-reduce:transition-none',
          imgClassName
        )}
      />
      <div ref={block} aria-hidden="true" className="pointer-events-none absolute inset-0 translate-y-full bg-tint" />
    </div>
  )
}
