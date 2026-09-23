'use client'
import { useEffect, useState } from 'react'
import { onCurtainCleared } from './loadCues'

/**
 * The opening panel: a full-viewport navy sheet carrying a percentage counter, the brand line, and a
 * 2px progress rule — which then slides off to the right, uncovering a page that is already composed
 * underneath it.
 *
 * Measured off the layout this site follows, frame by frame at 1440×900:
 *
 *   counter      0 → 100%, beside the brand line, over ~1.8s
 *   progress     a 2px rule inset 80px each side, translateX(−100%) → 0 over 2.0s, inOutExpo
 *   hold         the rule fades (0.3s), then the counter and line (0.5s)
 *   wipe         the whole panel translateX(0) → 100% over 1.2s, inOutExpo, ending ~4.4s after load
 *
 * The wipe is the character of it. The page does not fade up out of black — it is revealed by a
 * sheet being drawn off it sideways, like a cover pulled from a model, and the content is at rest
 * the moment it is uncovered. So nothing on the first screen runs an entrance of its own.
 *
 * This component is only the markup. The clock — and every way it can fail safe — is `LoadSequence`.
 *
 * Invariants worth protecting:
 *
 * 1. `pointer-events-none` from the first byte. A full-screen overlay that is even briefly
 *    interactive swallows the visitor's first click.
 * 2. It unmounts once the wipe ends rather than parking off-screen. The cue is sticky, so a panel
 *    that mounts after the sequence finished unmounts immediately instead of covering the page.
 * 3. Reduced motion removes it in CSS (`motion-reduce:hidden`), before hydration, with no JS branch —
 *    the server cannot know the preference, so it must render the same markup either way.
 * 4. With scripting OFF it is hidden by a `<noscript>` rule in the root layout. Without that, a
 *    visitor with JavaScript disabled saw nothing but this navy sheet, forever.
 */
export function LoadCurtain() {
  const [cleared, setCleared] = useState(false)

  useEffect(() => onCurtainCleared(() => setCleared(true)), [])

  if (cleared) return null

  return (
    <div
      data-load-curtain
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999998] overflow-hidden bg-secondary text-primary [will-change:transform] motion-reduce:hidden"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
        <span data-load-counter className="font-sans text-small tabular-nums">
          0%
        </span>
        <p data-load-line className="mt-3 font-heading text-h3 max-sm:text-h3-sm">
          <span className="text-accent">Redefining</span> Real Estate Excellence
        </p>
      </div>
      {/* The rule sits a line below the brand line and runs the full width inside an 80px margin —
          it is the timeline of the load, not an underline for the words. */}
      <div className="absolute inset-x-[80px] top-[calc(50%+36px)] h-[2px] overflow-hidden max-sm:inset-x-5">
        <div data-load-progress className="h-full w-full -translate-x-full bg-primary" />
      </div>
    </div>
  )
}
