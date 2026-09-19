'use client'
import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

/**
 * Smooth scroll, and the one thing that can hold the page still.
 *
 * **Why `lerp: 0.17`.** Lenis eases toward the target by `lerp` of the remaining distance each
 * frame, so the value is a time constant, not a taste setting. Measured against the reference with
 * a single 600px wheel impulse sampled every frame, the reference reaches 63% of the travel in
 * ~131ms and comes to rest at ~576ms; fitting `1-(1-L)^n` at 60fps to its t63/t90/t99 gives
 * L ≈ 0.17 across 120px, 600px and 2000px impulses. At 0.09 the same impulse took 206ms to t63 and
 * 1332ms to rest — 2.3x too long, which reads as floaty rather than smooth and stretches the
 * apparent response of every scrub-linked animation on the page as well.
 *
 * **Why the instance is module state.** The load choreography has to hold the visitor at scrollY 0
 * while the curtain is up, then release on the exact frame the content cascade starts. Without that
 * hold a trackpad flick during the black hold scrolls the page away, and the curtain lifts onto the
 * middle of the page. The lock is requested by `LoadSequence` (see `requestLoadScrollLock`), which
 * mounts in the same commit as this provider but resolves its GSAP chunk later, so the request has
 * to survive arriving before the instance exists — hence a remembered intent plus an instance
 * pointer, rather than an imperative handle a caller could miss the window on.
 */

type LenisInstance = import('lenis').default

let instance: LenisInstance | undefined
let lockedForLoad = false

/**
 * Hold the page still. Safe to call before Lenis exists — the intent is remembered and applied the
 * moment the instance is constructed, which is the only way to guarantee the instance is never
 * briefly scrollable between construction and the lock.
 */
export function requestLoadScrollLock(): void {
  lockedForLoad = true
  instance?.stop()
}

/**
 * Release the hold. Idempotent and safe at any time, including before the lock was ever applied:
 * every failure path in the load sequence routes through here, because a choreography that throws
 * must never leave a visitor on a page that cannot scroll.
 */
export function releaseLoadScrollLock(): void {
  lockedForLoad = false
  instance?.start()
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let lenis: LenisInstance | undefined
    let tick: ((t: number) => void) | undefined
    let cancelled = false

    ;(async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), getGsap()])
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.17 })
      instance = lenis
      // Applied here rather than left to the caller: the lock is requested during the first commit,
      // long before this chunk resolves, so the instance has to be born stopped. Lenis adds
      // `html.lenis-stopped` itself, so there is no class of our own to manage.
      if (lockedForLoad) lenis.stop()
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    })().catch((err) => {
      // A chunk that fails to load — stale deploy, flaky network — must degrade to native
      // scrolling, not surface as an unhandled rejection. Logged rather than swallowed:
      // smooth scroll silently missing is a bug worth seeing in a console. Cleanup stays
      // correct at any failure point, because `lenis` and `tick` are each assigned only
      // after their own step succeeded. Note there is nothing to unlock on this path: with no
      // instance, no lock was ever applied and the page scrolls natively throughout.
      console.error('[LenisProvider] smooth scroll unavailable; native scrolling in effect', err)
    })

    return () => {
      cancelled = true
      if (tick) getGsap().then(({ gsap }) => gsap.ticker.remove(tick!))
      if (instance === lenis) instance = undefined
      lenis?.destroy()
    }
  }, [reduced])

  return <>{children}</>
}
