'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { getGsap } from './gsap'
import { useCoarsePointer } from './useCoarsePointer'
import { useReducedMotion } from './useReducedMotion'

/**
 * Tips its content toward the pointer in perspective — a few degrees either way, eased, settling
 * flat again when the pointer leaves.
 *
 * Children that should float at a different depth take a `translateZ` of their own (for example
 * `[transform:translateZ(40px)]`); the body keeps `preserve-3d`, so those layers separate as the
 * surface turns, which is what makes the tilt read as depth rather than as a skew.
 *
 * Fine pointers only, and never under reduced motion: on touch there is no hover position to follow,
 * and a surface that jumps to wherever a finger lands reads as a glitch.
 */
export function Tilt3D({
  children,
  className,
  bodyClassName,
  max = 5,
  perspective = 1200,
}: {
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  /** Peak rotation in degrees at the element's edges. */
  max?: number
  perspective?: number
}) {
  const stage = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()

  useEffect(() => {
    if (reduced || coarse || !stage.current || !body.current) return
    const el = stage.current
    const surface = body.current
    let detach: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const toX = gsap.quickTo(surface, 'rotationX', { duration: 0.9, ease: 'power3.out' })
        const toY = gsap.quickTo(surface, 'rotationY', { duration: 0.9, ease: 'power3.out' })
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const x = ((e.clientX - r.left) / r.width) * 2 - 1
          const y = ((e.clientY - r.top) / r.height) * 2 - 1
          toY(x * max)
          toX(-y * max)
        }
        const onLeave = () => {
          toX(0)
          toY(0)
        }
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerleave', onLeave)
        detach = () => {
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerleave', onLeave)
          gsap.killTweensOf(surface)
          gsap.set(surface, { clearProps: 'transform' })
        }
      })
      .catch((err) => console.error('[Tilt3D] tilt unavailable; content renders flat', err))

    return () => {
      cancelled = true
      detach?.()
    }
  }, [reduced, coarse, max])

  return (
    <div ref={stage} className={className} style={{ perspective: `${perspective}px` }}>
      <div ref={body} className={cn('h-full w-full [transform-style:preserve-3d]', bodyClassName)}>
        {children}
      </div>
    </div>
  )
}
