'use client'
import { useEffect, useState } from 'react'
import { onCurtainCleared } from './loadCues'

/**
 * Full-viewport black panel that the opening resolves out of.
 *
 * The reference's is a plain opacity fade — `opacity: 1 → 0` on a `fixed inset-0` black div — not a
 * clip-path wipe or a slide, and with no counter, percentage or logo inside it: the overlay has zero
 * child nodes. It reads as the page resolving out of black rather than as a panel moving, which is
 * why it needs no choreography to work at any viewport.
 *
 * This component is deliberately only the panel. The fade itself belongs to `LoadSequence`, which
 * holds it at full opacity for ~1150ms and then tweens it `1 → 0` over 750ms on `power4.inOut`. Two
 * reasons the tween cannot live here: the frame the fade starts is the t0 the header's and hero's
 * offsets are measured from, and the wordmark is supposed to rise *through* the black while it is
 * still ~40% opaque — an overlap that only one timeline can hold. A CSS transition local to this
 * element could do neither. It also could not be held: the two-rAF flip this file used to do began
 * dissolving 168ms after first paint against the reference's 1178ms, so the whole opening played out
 * under an opaque curtain and the page was simply finished behind it.
 *
 * Details that matter more than the fade:
 *
 * 1. `pointer-events-none` from the first frame. A full-screen overlay that is even briefly
 *    interactive swallows the visitor's first click, which is the usual way this pattern breaks.
 * 2. It unmounts once faded, rather than lingering at `opacity: 0`. An invisible fixed layer over
 *    every page is how a stuck curtain later becomes an unexplained dead zone. The cue for that is
 *    sticky, so a curtain that somehow mounted after the fade had finished would unmount at once
 *    instead of sitting there black forever.
 * 3. **Reduced motion is handled in CSS, not JS.** The `motion-reduce:hidden` class removes it
 *    outright for those users. Doing this with a `matchMedia` check plus `setState` in an effect
 *    would both trip React's cascading-render rule and risk a hydration mismatch — the server
 *    cannot know the user's motion preference, so it must render the same markup either way and
 *    let the media query decide. This is also why the panel is black from the first byte of HTML
 *    rather than from a post-hydration `gsap.set`: there is no frame in which the page shows
 *    through.
 * 4. `will-change: opacity` for the whole hold, not just the fade. A full-viewport fade wants its
 *    own compositor layer, and promoting one on the frame the fade starts is the frame the fade can
 *    least afford to spend.
 */
export function LoadCurtain() {
  const [cleared, setCleared] = useState(false)

  useEffect(() => onCurtainCleared(() => setCleared(true)), [])

  if (cleared) return null

  return (
    <div
      data-load-curtain
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] bg-secondary [will-change:opacity] motion-reduce:hidden"
    />
  )
}
