'use client'
import { useEffect } from 'react'
import { getGsap } from './gsap'
import { releaseLoadScrollLock, requestLoadScrollLock } from './LenisProvider'
import { claimLoadSequence, emitAllLoadStages, emitCurtainCleared, loadSequenceActive } from './loadCues'

/**
 * The single clock behind the opening.
 *
 * Two phases, measured off the layout this site follows:
 *
 *   phase 1  counter 0 → 100% (1.5s, linear) and a 2px rule sliding in (2.0s, expo.inOut); the rule fades
 *            (0.3s), then the counter and brand line (0.5s)                         — full opening only
 *   phase 2  the panel slides off to the right, translateX 0 → 100%, expo.inOut: 1.2s after the full
 *            opening, 1.5s as the quick wipe on every other load
 *
 * **Phase 1 starts at once; phase 2 is what waits.** The panel covers the page, so nothing needs to be
 * ready before the counter runs — waiting there would only stretch a sequence that is already four
 * seconds long. What must be ready is the page at the moment it is uncovered: fonts, and the hero
 * photograph decoded. So the wipe is gated on those (with a ceiling, so a cold network can never
 * strand a visitor behind the panel), and the quick wipe carries a short floor so a warm cache does
 * not turn the reveal into a flicker.
 *
 * **Nothing on the first screen animates in.** The page is composed underneath the panel and is at
 * rest the moment it is uncovered; the wipe IS the entrance. Every cue is therefore fired on the frame
 * the wipe starts, so any component that waits on one is already in its final state when it appears.
 *
 * **Why nothing here can leave the page stuck.** Scroll is held from the first byte (a class the
 * server renders on <html>) and released as the wipe begins. An unscrollable page is a far worse bug
 * than a missing animation, so the release has three independent routes: the wipe's own cue, the catch
 * around the whole setup, and a watchdog armed before any of it and only ever re-armed to the real
 * end. Every one of them also fires every cue and clears the panel.
 */

/** The latest the wipe may wait for fonts and the hero photograph, measured from first paint. */
const HOLD_CEILING_MS = 2800

/**
 * The shortest time the quick panel may stay up. Without a floor a warm cache would start the wipe
 * on the first frame, and a 1.5s slide that begins before the eye has registered the panel reads as
 * a flicker rather than a reveal.
 */
const WIPE_FLOOR_MS = 350

/**
 * The watchdog's arming distance, from this effect. The full opening is ~2.8s of counter and rule
 * plus a 1.2s wipe; 7s clears the slowest honest run while still being soon enough that a visitor
 * who hit the pathological path is not left looking at a navy screen.
 */
const WATCHDOG_MS = 7000

/** sessionStorage key marking that this tab has already been shown the full opening. */
const OPENED_KEY = 'bkr-opening-played'

/**
 * Whether this load gets the full opening — counter, rule and all — or only the panel wipe.
 *
 * Full on the first home-page load of a session, and nowhere else. That is where the layout this site
 * follows plays it, and it is where the counter means something: it is the first thing a new visitor
 * sees. On every other page, and on a return to the home page, the four-second sequence would be
 * ceremony the visitor has already watched.
 *
 * Claiming it here marks the session as it is read, so a reload does not replay it. Storage is
 * wrapped because Safari's private mode and some embedded browsers throw on access; the fallback is
 * the quick wipe, never the full sequence, since the worst outcome of this check is a long opening
 * repeated on every page.
 */
function claimFullOpening(): boolean {
  if (window.location.pathname !== '/') return false
  try {
    if (window.sessionStorage.getItem(OPENED_KEY)) return false
    window.sessionStorage.setItem(OPENED_KEY, '1')
    return true
  } catch {
    return false
  }
}

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
      const { gsap } = await gsapReady
      if (cancelled || settled) return

      const curtain = document.querySelector<HTMLElement>('[data-load-curtain]')
      if (!curtain) {
        revealEverything()
        return
      }
      const counter = curtain.querySelector<HTMLElement>('[data-load-counter]')
      const line = curtain.querySelector<HTMLElement>('[data-load-line]')
      const progress = curtain.querySelector<HTMLElement>('[data-load-progress]')
      const full = claimFullOpening()

      // ── Phase 1: the counter and the rule. Starts at once — the panel covers the page, so there
      // is nothing yet to be ready FOR, and waiting here only lengthens a sequence that is already
      // four seconds long. ─────────────────────────────────────────────────────────────────────────
      const intro = gsap.timeline()
      if (full) {
        const tally = { v: 0 }
        intro
          // Linear over 1.5s: the layout counts with counterUp2 at its defaults, which steps evenly
          // through the range every 16ms rather than easing into it.
          .to(tally, {
            v: 100,
            duration: 1.5,
            ease: 'none',
            onUpdate: () => {
              if (counter) counter.textContent = `${Math.round(tally.v)}%`
            },
          }, 0)
          // fromTo, not to: the rule's rest state is Tailwind's `-translate-x-full`, which GSAP would
          // read back as a pixel offset rather than a percentage and then tween in the wrong unit.
          .fromTo(progress, { xPercent: -100, x: 0 }, { xPercent: 0, duration: 2.0, ease: 'expo.inOut' }, 0)
          .to(progress, { opacity: 0, duration: 0.3 }, 2.0)
          .to([counter, line], { opacity: 0, duration: 0.5 }, 2.3)
      } else {
        // A repeat visit, or any page other than the home page: the panel alone, which is what the
        // layout itself does off the home page. Four seconds of counter on every navigation would be
        // a theatre the visitor has already sat through.
        gsap.set([counter, line, progress], { opacity: 0 })
      }

      kill = () => intro.kill()

      // ── Phase 2: the wipe, gated on the page actually being ready to be seen. This is where the
      // floor and ceiling now apply — the moment of uncovering, not the moment of loading. ─────────
      await Promise.all([
        new Promise<void>((resolve) => intro.eventCallback('onComplete', () => resolve())),
        Promise.race([Promise.all([fontsReady(), heroImageDecoded()]), until(HOLD_CEILING_MS)]),
        until(full ? 0 : WIPE_FLOOR_MS),
      ])
      if (cancelled || settled) return

      const wipe = gsap.timeline()
      wipe
        // Released as the sheet starts to move: the visitor gets the page the instant it begins to
        // appear, rather than watching it slide into view and then finding it will not scroll.
        .call(releaseLoadScrollLock, undefined, 0)
        .call(emitAllLoadStages, undefined, 0)
        .to(curtain, { xPercent: 100, duration: full ? 1.2 : 1.5, ease: 'expo.inOut', onComplete: emitCurtainCleared }, 0)

      window.clearTimeout(watchdog)
      watchdog = window.setTimeout(
        () => {
          if (!cancelled) revealEverything()
        },
        wipe.duration() * 1000 + WATCHDOG_SLACK_MS
      )

      kill = () => {
        intro.kill()
        wipe.kill()
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
