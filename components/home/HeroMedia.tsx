'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { getGsap } from '@/components/motion/gsap'
import { loadSequenceActive, onLoadStage } from '@/components/motion/loadCues'
import { Thread } from '@/components/motion/Thread'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { useReducedMotion } from '@/components/motion/useReducedMotion'

/**
 * The hero photograph: the right half of the opening screen, with the gradient seam down its inner
 * edge and the project in focus labelled on a card floating above it.
 *
 * Two pieces of 3D, layered so they never fight over one transform:
 *
 * - **The settle** (outer element). The page is composed under the loading panel and uncovered by its
 *   wipe; as the wipe begins, this half swings in from a few degrees open about its inner edge and
 *   comes forward out of depth, so the photograph arrives as an object rather than a flat rectangle.
 *   Keyed to the load sequence's `media` cue, which fires on the wipe's first frame; with no sequence
 *   (a client-side navigation) it stays at rest.
 * - **The tilt** (inner element). After that it follows the pointer by a few degrees, and the seam and
 *   the card sit at their own depths (`translateZ`), so they separate from the photograph as it turns.
 *
 * The image is the page's LCP element and `LoadSequence` gates the wipe on its decode (it looks for
 * `[data-hero] img`), so it is preloaded and it is the first image in the section.
 */
export function HeroMedia({
  src,
  alt,
  eyebrow,
  caption,
}: {
  src: string
  alt: string
  /** The small line on the floating card — the project's locality. */
  eyebrow: string
  /** The card's main line — category and status. */
  caption: string
}) {
  const settle = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !settle.current || !loadSequenceActive()) return
    const el = settle.current
    let off: (() => void) | undefined
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        gsap.set(el, { rotationY: -14, z: -120, transformOrigin: '0% 50%' })
        off = onLoadStage('media', () => {
          const t = gsap.to(el, {
            rotationY: 0,
            z: 0,
            duration: 1.9,
            ease: 'expo.out',
            onComplete: () => gsap.set(el, { clearProps: 'transform' }),
          })
          kill = () => {
            t.kill()
            gsap.set(el, { clearProps: 'transform' })
          }
        })
      })
      .catch((err) => console.error('[HeroMedia] settle unavailable; photograph renders at rest', err))

    return () => {
      cancelled = true
      off?.()
      kill?.()
    }
  }, [reduced])

  return (
    <div className="h-full w-full [perspective:1800px]">
      <div ref={settle} className="h-full w-full [transform-style:preserve-3d]">
        <Tilt3D className="h-full w-full" max={4} perspective={1600}>
          <div className="absolute inset-y-0 left-2 right-0 overflow-clip max-lg:left-0 max-lg:rounded-card">
            <Image src={src} alt={alt} fill preload sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
          </div>
          <Thread className="absolute inset-y-0 left-0 [transform:translateZ(28px)] max-lg:hidden" />
          <div className="absolute bottom-[20%] left-12 rounded-card bg-primary/95 px-5 py-4 shadow-[0_24px_48px_-24px_rgba(10,26,47,0.5)] [transform:translateZ(70px)] max-lg:bottom-5 max-lg:left-5 max-lg:px-4 max-lg:py-3">
            <p className="text-caption text-muted">{eyebrow}</p>
            <p className="font-heading text-body text-secondary">{caption}</p>
          </div>
        </Tilt3D>
      </div>
    </div>
  )
}
