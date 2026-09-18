'use client'
import { useEffect, useState } from 'react'

/**
 * Full-viewport black panel that fades out on first paint.
 *
 * The reference's is a plain opacity fade — `opacity: 1 → 0` on a `fixed inset-0` black div — not a
 * clip-path wipe or a slide. It reads as the page resolving out of black rather than as a panel
 * moving, which is why it needs no choreography to work at any viewport.
 *
 * Details that matter more than the fade:
 *
 * 1. `pointer-events-none` from the first frame. A full-screen overlay that is even briefly
 *    interactive swallows the visitor's first click, which is the usual way this pattern breaks.
 * 2. It unmounts once faded, rather than lingering at `opacity: 0`. An invisible fixed layer over
 *    every page is how a stuck curtain later becomes an unexplained dead zone.
 * 3. **Reduced motion is handled in CSS, not JS.** The `motion-reduce:hidden` class removes it
 *    outright for those users. Doing this with a `matchMedia` check plus `setState` in an effect
 *    would both trip React's cascading-render rule and risk a hydration mismatch — the server
 *    cannot know the user's motion preference, so it must render the same markup either way and
 *    let the media query decide.
 */
export function LoadCurtain() {
  const [lifted, setLifted] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // Two frames, not one. A single rAF can land in the same paint as the initial render, so the
    // browser never observes the `opacity: 1` state and skips the transition entirely — the
    // curtain would pop rather than fade.
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setLifted(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])

  if (gone) return null

  return (
    <div
      data-load-curtain
      data-lifted={lifted ? 'true' : 'false'}
      aria-hidden="true"
      onTransitionEnd={() => setGone(true)}
      style={{ opacity: lifted ? 0 : 1 }}
      className="pointer-events-none fixed inset-0 z-[90] bg-secondary transition-opacity duration-[900ms] ease-in-out motion-reduce:hidden motion-reduce:transition-none"
    />
  )
}
