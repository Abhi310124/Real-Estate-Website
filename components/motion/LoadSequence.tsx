'use client'
import { useEffect } from 'react'
import { getGsap } from './gsap'
import { releaseLoadScrollLock, requestLoadScrollLock } from './LenisProvider'
import {
  claimLoadSequence,
  emitAllLoadStages,
  emitCurtainCleared,
  emitLoadStage,
  loadSequenceActive,
} from './loadCues'

/**
 * The single clock behind the opening.
 *
 * The reference's first load is one composition of 4079ms in which 19 elements move, and its
 * character lives entirely in the offsets between them (t0 = the frame the curtain begins to fade):
 *
 *   t0+0.00  curtain   opacity 1 → 0        0.75s  power4.inOut
 *   t0+0.30  wordmark  opacity 0 → 1        1.5s   power4.out
 *   t0+1.30  scroll unlock, on the same frame as the cascade
 *   t0+1.30  hairlines opacity 0 → 1        0.5s   power2.out, stagger 0.05
 *   t0+1.302 headline  yPercent 100 → 0     0.75s  power2.out, stagger 0.06
 *   t0+1.50  nav links opacity 0 → 1        1.5s   power4.out
 *   t0+1.55  photo     opacity 0 → 1        1.35s  power4.out
 *   t0+1.55  photo     scale 1.1 → 1        1.2s   power3.out
 *   t0+1.55  CTA       opacity 0 → 1        1.0s   power4.out
 *
 * Two of those offsets are the whole opening and are the easy ones to lose. The wordmark starts at
 * t0+0.30, while the curtain is still ~40% opaque, so it rises *through* the black instead of
 * appearing once the black has gone. And because the hero keeps its own opaque background while its
 * contents sit at their from-states, the viewport stays solid black with nothing but the wordmark on
 * it for a further ~550ms after the curtain reaches 0 at t0+0.75. That 550ms beat is why the
 * reference reads as an opening rather than a flash; it needs no second overlay, only cues that
 * arrive later than the curtain does.
 *
 * Every entrance is an out-ease. `inOut` appears exactly once, on the curtain — the only thing that
 * leaves. One in-out curve used for entrances as well (which is what a single Tailwind
 * `ease-in-out` gives you) makes everything accelerate from a standstill and reads sluggish.
 *
 * **Why one timeline and a cue bus.** The beats land in the header, in the hero and on the curtain,
 * which have no common ancestor below the root layout. Timing each component from its own mount
 * would scatter the offsets across three files and make them hostage to hydration order, and the
 * 2ms between the hairlines and the headline lines is not something separate timers can hold. So
 * this component owns the clock, tweens the curtain itself, and publishes the rest through
 * `loadSequence.ts`. It renders nothing.
 *
 * **Why the hold is gated and not timed.** Before t0 the reference holds solid black for ~1150ms,
 * but not on a timer: three loads measured 912 / 1178 / 1211ms, because it is waiting on its own
 * hydration. Ours waits on the two things that would otherwise be visibly unfinished when the black
 * clears — webfonts and the hero photograph's decode — with a 1150ms floor so a warm cache cannot
 * turn the opening into a flicker, and a hard 2000ms ceiling so a cold network cannot strand a
 * visitor behind a black screen. Both are measured from first contentful paint, because that is when
 * the visitor started looking at black, not from this effect, which runs whenever hydration gets
 * round to it.
 *
 * **Why nothing here can leave the page stuck.** The lock is a real one — Lenis holds the visitor at
 * scrollY 0 for the length of the black, where before a single trackpad flick would scroll the page
 * away behind the curtain and lift it onto the middle of the document. But an unscrollable page is a
 * far worse bug than a missing animation, so the unlock has three independent routes: the timeline's
 * own cue, the catch around the whole setup, and a watchdog timer that is armed before any of it and
 * never cancelled outright, only re-armed to the timeline's real end. Every one of those routes also
 * fires every remaining cue, so no component is ever left holding a from-state for a beat that is
 * not coming.
 */

const HOLD_FLOOR_MS = 1150
const HOLD_CEILING_MS = 2000

/**
 * The watchdog's arming distance, from this effect. A legitimate sequence starts at most
 * HOLD_CEILING_MS after first paint and ends 1.55s later, so 4s clears the slowest honest run while
 * still being soon enough that a visitor who hit the pathological path is not staring at black.
 */
const WATCHDOG_MS = 4000

/** Slack added to the timeline's own duration when the watchdog is re-armed behind a running one. */
const WATCHDOG_SLACK_MS = 750

/**
 * The visitor's clock starts at first contentful paint. Falls back to "now" when the paint entry is
 * not there yet (or at all, as under jsdom), which errs toward holding the black slightly longer
 * rather than cutting it short.
 */
function firstPaintTime(): number {
  if (typeof performance.getEntriesByType !== 'function') return performance.now()
  for (const entry of performance.getEntriesByType('paint')) {
    if (entry.name === 'first-contentful-paint') return entry.startTime
  }
  return performance.now()
}

function fontsReady(): Promise<void> {
  // Guarded read: `document.fonts` is typed as always present but is absent in jsdom, and a
  // component that only ever runs in a browser is still imported by tests that do not.
  const fonts: FontFaceSet | undefined = document.fonts
  return fonts ? fonts.ready.then(() => undefined) : Promise.resolve()
}

/**
 * Resolves when the hero photograph is decoded and would paint in the frame the curtain clears.
 * `decode()` rather than the `load` event, because a loaded-but-undecoded image still costs a frame
 * on the way in, and that frame lands exactly where the visitor is looking. Missing hero, missing
 * `decode()`, or a failed image all resolve rather than reject: the gate exists to improve the
 * opening, never to hold it up.
 */
function heroImageDecoded(): Promise<void> {
  const img = document.querySelector<HTMLImageElement>('[data-hero] img')
  if (!img) return Promise.resolve()
  if (typeof img.decode === 'function') return img.decode().catch(() => undefined)
  if (img.complete) return Promise.resolve()
  return new Promise<void>((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true })
    img.addEventListener('error', () => resolve(), { once: true })
  })
}

export function LoadSequence() {
  // Claimed in render, not in the effect below. `loadSequenceActive()` is how every other component
  // decides between waiting for a cue and falling back to its own scroll trigger, and one that makes
  // that choice during its first render must not see `false` and give up on a sequence that is about
  // to run — React's documented shape for one-time application setup. Safe to promise this early
  // because the promise is kept on every path: reduced motion, a failed chunk and the watchdog all
  // fire every stage.
  //
  // Client only. Module state in a server render is shared by every request that process handles, so
  // claiming there would outlive the page it belongs to and answer for the next visitor as well.
  if (typeof window !== 'undefined' && !loadSequenceActive()) claimLoadSequence()

  useEffect(() => {
    let cancelled = false
    let settled = false
    let kill: (() => void) | undefined
    const sleepTimers: number[] = []

    /**
     * The end state of every path that is not the choreography: scrolling restored, every cue
     * spent, content in its final visible state.
     */
    const revealEverything = () => {
      settled = true
      releaseLoadScrollLock()
      emitAllLoadStages()
      emitCurtainCleared()
    }

    // matchMedia here rather than `useReducedMotion()`. That hook reports `true` on its first render
    // by design, so an effect keyed on it cannot tell a real preference from the first paint: it has
    // to no-op on the first pass, and a genuine reduced-motion visitor — whose second pass never
    // arrives — would be left with cues that never fire. The hook's contract exists to keep a first
    // paint safe, and this component renders nothing; the curtain goes on honouring the preference
    // in CSS, where it is honoured before hydration too.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealEverything()
      return
    }

    requestLoadScrollLock()

    let watchdog = window.setTimeout(() => {
      if (!cancelled) revealEverything()
    }, WATCHDOG_MS)

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        if (ms <= 0) {
          resolve()
          return
        }
        sleepTimers.push(window.setTimeout(resolve, ms))
      })

    const paint = firstPaintTime()
    const until = (ms: number) => sleep(paint + ms - performance.now())

    const gsapReady = getGsap()

    ;(async () => {
      await Promise.race([
        Promise.all([gsapReady, fontsReady(), heroImageDecoded()]),
        until(HOLD_CEILING_MS),
      ])
      await until(HOLD_FLOOR_MS)
      const { gsap } = await gsapReady
      if (cancelled || settled) return

      const curtain = document.querySelector<HTMLElement>('[data-load-curtain]')
      const tl = gsap.timeline()

      if (curtain) {
        // Tweened from here rather than left as a CSS transition on the curtain itself: it is the
        // t0 every other offset is measured against, and a transition on another element cannot be
        // in the same timeline as the cues that overlap it. power4.inOut compresses the perceived
        // movement into a ~370ms middle band with long flat shoulders — the reference sits
        // resolutely black, then clears decisively.
        tl.to(curtain, { opacity: 0, duration: 0.75, ease: 'power4.inOut', onComplete: emitCurtainCleared }, 0)
      } else {
        emitCurtainCleared()
      }

      tl.call(() => emitLoadStage('wordmark'), undefined, 0.3)
        // Unlocked on the same frame the cascade starts, exactly as measured — the visitor is
        // released into a page that has just begun to move rather than one that is still black.
        .call(releaseLoadScrollLock, undefined, 1.3)
        .call(() => emitLoadStage('rules'), undefined, 1.3)
        .call(() => emitLoadStage('text'), undefined, 1.302)
        .call(() => emitLoadStage('nav'), undefined, 1.5)
        .call(() => emitLoadStage('media'), undefined, 1.55)
        .call(() => emitLoadStage('cta'), undefined, 1.55)

      // Re-armed rather than cancelled: the timeline is now the thing that unlocks scrolling, so the
      // net has to outlive it, but it must no longer be able to cut a legitimate fade short.
      window.clearTimeout(watchdog)
      watchdog = window.setTimeout(
        () => {
          if (!cancelled) revealEverything()
        },
        tl.duration() * 1000 + WATCHDOG_SLACK_MS
      )

      kill = () => {
        tl.kill()
      }
    })().catch((err) => {
      // A failed GSAP chunk must degrade to visible, unanimated content — never to a page held
      // behind a curtain that will not lift. Logged rather than swallowed: an opening that silently
      // stopped happening is worth seeing in a console.
      console.error('[LoadSequence] load choreography unavailable; content renders in its final state', err)
      if (!cancelled) revealEverything()
    })

    return () => {
      cancelled = true
      window.clearTimeout(watchdog)
      for (const id of sleepTimers) window.clearTimeout(id)
      kill?.()
      // A sequence torn down mid-flight must not take the visitor's ability to scroll with it.
      releaseLoadScrollLock()
    }
  }, [])

  return null
}
