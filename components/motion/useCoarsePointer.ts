'use client'
import { useEffect, useState } from 'react'

/**
 * Same contract as `useReducedMotion()`: starts `true` — the safe value, since assuming a
 * coarse (touch) pointer is what keeps pointer-only enhancements (pinch-zoom gating, the
 * pinned horizontal showcase, the magnetic cursor) off until a client-side media query has
 * actually confirmed otherwise, which keeps SSR and first client paint agreeing. Syncs
 * against `matchMedia('(pointer: coarse)')` in an effect, with a live `change` listener so a
 * device that gains or loses a coarse pointer mid-session (a detached tablet keyboard, a
 * desktop switching to touch emulation) re-decides rather than sticking with a stale guess.
 *
 * Extracted out of `HorizontalShowcase`, which used to keep a private copy of exactly this
 * hook to pick its pinned-vs-scroll-snap fallback. `MasterPlan` (gating pinch-to-zoom) and
 * `MagneticCursor` (the inverse — mount only on a fine pointer) both consume this same one
 * instead of each keeping a third and fourth copy.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return coarse
}
