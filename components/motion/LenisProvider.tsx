'use client'
import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let lenis: import('lenis').default | undefined
    let tick: ((t: number) => void) | undefined
    let cancelled = false

    ;(async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), getGsap()])
      if (cancelled) return
      lenis = new Lenis({ lerp: 0.09 })
      lenis.on('scroll', ScrollTrigger.update)
      tick = (time: number) => lenis!.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    })()

    return () => {
      cancelled = true
      if (tick) getGsap().then(({ gsap }) => gsap.ticker.remove(tick!))
      lenis?.destroy()
    }
  }, [reduced])

  return <>{children}</>
}
