'use client'
import { useEffect, useRef } from 'react'
import { useCoarsePointer } from './useCoarsePointer'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

const DOT_EASE = { duration: 0.12, ease: 'power3.out' }
const RING_EASE = { duration: 0.35, ease: 'power3.out' }
const RING_SCALE_EASE = { duration: 0.3, ease: 'power2.out' }
const REST_SCALE = 1
const HOVER_SCALE = 1.8

/**
 * Signature moment 3b of 3 — a small orange dot and a larger ring that lerp toward the pointer
 * via `gsap.quickTo`, morphing to name whatever `[data-cursor]` value ("view" | "drag" | "zoom")
 * sits under it. Ruling 1: the native OS cursor is never touched anywhere in this file —
 * `[data-cursor-root]` is a purely additive decoration at `pointer-events: none`, so a GSAP load
 * failure degrades to "no extra cursor," never to "no cursor at all."
 *
 * Ruling 2: rather than a second, independent `matchMedia('(pointer: fine)')` check, "fine
 * pointer" is derived as the negation of the already-shared `useCoarsePointer()`. That hook
 * starts `true` (assume touch) on both the server and the first client paint, so this component
 * mounts nothing until an effect confirms an actual fine, motion-unreduced pointer — matching
 * every other motion primitive's "safe value first" contract instead of introducing a new one.
 */
export function MagneticCursor() {
  const coarsePointer = useCoarsePointer()
  const reduced = useReducedMotion()
  const active = !coarsePointer && !reduced

  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!active) return
    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return

    let cancelled = false
    let dotX: ((value: number) => void) | undefined
    let dotY: ((value: number) => void) | undefined
    let ringX: ((value: number) => void) | undefined
    let ringY: ((value: number) => void) | undefined
    let ringScale: ((value: number) => void) | undefined

    const onPointerMove = (e: PointerEvent) => {
      dotX?.(e.clientX)
      dotY?.(e.clientY)
      ringX?.(e.clientX)
      ringY?.(e.clientY)
    }

    // Delegated on window rather than per-target: `pointerover` bubbles, so one listener sees
    // every hover-target change site-wide. `closest()` starts at `event.target` itself and walks
    // up — exactly the brief's "walk up from event.target for the nearest [data-cursor]
    // ancestor" — and naturally resolves to nothing (clearing the label, resting the ring) once
    // the pointer leaves every element that declares one.
    const onPointerOver = (e: PointerEvent) => {
      const target = e.target as Element | null
      const host = target?.closest?.('[data-cursor]') as HTMLElement | null
      const value = host?.getAttribute('data-cursor') ?? ''
      label.textContent = value
      ringScale?.(value ? HOVER_SCALE : REST_SCALE)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerover', onPointerOver)

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        // `xPercent/yPercent` self-centre the dot/ring on their own box once; `x`/`y` (animated
        // below, in raw viewport pixels via quickTo) then land that centred box exactly on the
        // pointer. Seeding `x`/`y` at the viewport's centre here — rather than leaving them at
        // their implicit 0,0 default — means the very first paint sits mid-screen instead of
        // flashing in the top-left corner before any real pointer event has arrived.
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 })
        dotX = gsap.quickTo(dot, 'x', DOT_EASE)
        dotY = gsap.quickTo(dot, 'y', DOT_EASE)
        ringX = gsap.quickTo(ring, 'x', RING_EASE)
        ringY = gsap.quickTo(ring, 'y', RING_EASE)
        ringScale = gsap.quickTo(ring, 'scale', RING_SCALE_EASE)
      })
      .catch((err) => {
        // Degrade to a static, centred decoration rather than an unhandled rejection — matches
        // LenisProvider's and every Task-9-onward motion primitive's `.catch()` convention.
        console.error('[MagneticCursor] pointer-following animation unavailable; cursor stays put', err)
      })

    return () => {
      cancelled = true
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
    }
  }, [active])

  if (!active) return null

  return (
    <div data-cursor-root aria-hidden="true" className="pointer-events-none fixed inset-0 z-[120]">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-full border border-orange/70"
      >
        <span ref={labelRef} data-cursor-label className="eyebrow text-[9px] text-orange" />
      </div>
      <div ref={dotRef} className="absolute left-0 top-0 h-2 w-2 rounded-full bg-orange" />
    </div>
  )
}
