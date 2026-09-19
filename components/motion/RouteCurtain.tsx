'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * The black curtain that covers every internal navigation.
 *
 * The reference does not swap routes in place — it blacks the screen out, changes the page behind
 * the black, and fades back in. That single transition is the most frequently seen piece of motion
 * on the whole site, and without it a click on the nav reads as a browser reload rather than as a
 * move inside one document.
 *
 * ## The curve, and why it is not an ease-in-out
 *
 * The reference's overlay opacity was rAF-sampled across a nav click. Reading the raw frames:
 * first movement at 45ms, exact 1.0 at 694ms, full black until ~862ms, exact 0 at 1515ms. So the
 * two ramps are ~645ms each with a ~170ms hold between them, and the values mirror each other
 * frame for frame (0.9085, 0.8754, 0.8362, 0.7842, 0.7197, 0.5511, 0.4489, 0.0986 appear in both
 * directions) — one symmetric tween, played forward then backward.
 *
 * The ramp is much flatter at the ends and much steeper in the middle than an ease-in-out. At the
 * midpoint the measured slope is ~6.8/s; a 645ms `power2.inOut` can only reach 3.1/s there. Fitting
 * the exponent against the sampled frames, with the start and end anchored to the measured ones:
 *
 *     power2.inOut  RMSE 0.081     power3.inOut  RMSE 0.036
 *     power4.inOut  RMSE 0.012     power5.inOut  RMSE 0.022
 *
 * `power4.inOut` it is. The difference is not academic: at 260ms the reference is at 0.0898, and a
 * `power2.inOut` of the same length would be at 0.275 — three times as dark. Reading the curve as
 * an ease-in-out is the intuitive mistake here, and it costs the transition its character, which is
 * that almost nothing happens for the first third and then the screen slams shut.
 *
 * ## Covering the swap in the App Router
 *
 * There is no `router.events` in this Next, and the out-phase cue has to arrive after the new route
 * has painted. So the cover is driven from the click and the reveal from the commit:
 *
 *   1. A capture-phase `click` listener on `document` claims same-origin anchor clicks with
 *      `preventDefault()`. `next/link` reads `defaultPrevented` in its own handler and stands down,
 *      so no navigation happens yet — and every other `onClick` on the link still runs, which is
 *      how the mobile sheet still closes on tap. This works without touching a single `<Link>`:
 *      `onNavigate` would have meant editing every call site.
 *   2. When the cover tween completes, `router.push()` runs. The swap therefore happens behind
 *      solid black, which is the entire point.
 *   3. `usePathname()` changing is the commit cue. Two frames later (a passive effect can run
 *      before the browser has painted) the reveal starts, delayed by whatever is left of the 170ms
 *      hold — so a prefetched route that commits in 10ms still holds the full 170ms, and a slow one
 *      reveals as soon as it lands.
 *
 * Back/forward is deliberately asymmetric. `popstate` fires *after* the browser has moved the
 * history entry, so there is no point at which a 645ms cover could run ahead of the swap — a
 * fade-to-black started there would show the visitor the new page and then hide it, which reads as
 * a bug. Instead the curtain is snapped straight to 1 in the popstate handler, before the router's
 * re-render can paint, and only the reveal is animated. A cut to black and a fade up is honest film
 * grammar, and it makes an arrival by Back feel identical to an arrival by link.
 *
 * ## Never, ever strand the visitor behind black
 *
 * A stuck opaque overlay is far worse than no transition, and this component both delays navigation
 * and hides the page, so it has three independent ways out:
 *
 *   - **It refuses to arm until GSAP has resolved.** `preventDefault()` is only ever called once
 *     `getGsap()` has handed back a real instance. If that chunk never loads, the listener no-ops
 *     and every link navigates natively, instantly, exactly as it does with JS off.
 *   - **A commit watchdog.** If the pathname has not changed 2s after the push, the reveal runs
 *     anyway. The visitor gets the old page back rather than a black screen.
 *   - **An unconditional failsafe.** Armed at the start of every cycle: at 4.5s the curtain is
 *     force-cleared and the state machine reset, whatever any callback did or did not do. The
 *     longest legitimate cycle is 650 + 2000 + 170 + 650 = 3470ms, so this can only fire on a
 *     genuine fault — a killed tween, a throttled background tab, a router that threw.
 *
 * ## Why it can sit permanently in the DOM when `LoadCurtain` must not
 *
 * `LoadCurtain` unmounts itself, on the reasoning that an invisible fixed layer over every page is
 * how a curtain becomes an unexplained dead zone. That reasoning is about hit-testing, and it does
 * not apply here: this element is `pointer-events-none` in every state, so it is not a dead zone
 * even at full black. That is the reference's behaviour too — its overlay is `pointer-events-none`
 * while fully opaque, meaning a visitor can click things they cannot see. Faithful, and the safer
 * of the two failure modes: a curtain that swallowed clicks would break the site, one that ignores
 * them merely lets an accidental click through.
 *
 * The two curtains never overlap, because this one is inert until the first navigation — nothing
 * here animates except in response to a click or a `popstate`, neither of which can happen before
 * first paint. On initial load `LoadCurtain` owns the screen alone; the pathname effect's first run
 * finds the state machine idle and does nothing.
 *
 * `z-[999999]` matches the reference, and is above the header (80), the mobile sheet (85) and
 * `LoadCurtain` (90) — anything the curtain fails to cover would flicker through the black. It is
 * also above the skip link (130); harmless, since `aria-hidden` plus `pointer-events-none` leave
 * that link focusable and operable throughout, and the only cost is that it is invisible for the
 * ~1.5s of a transition that is already committed.
 *
 * Reduced motion gets no curtain and no interception at all: `motion-reduce:hidden` removes the
 * element, and the listeners are never attached, so navigation is instant rather than delayed by
 * 650ms of animation nobody can see.
 */

type GsapInstance = Awaited<ReturnType<typeof getGsap>>['gsap']

/**
 * `covering` — cover tween running, navigation not yet issued.
 * `awaiting`  — screen is black, waiting for the new route to commit and paint.
 * `revealing` — reveal tween running; the new route is already on screen behind it.
 */
type Phase = 'idle' | 'covering' | 'awaiting' | 'revealing'

const COVER_S = 0.65
const REVEAL_S = 0.65
const HOLD_MS = 170
const EASE = 'power4.inOut'

/** Reveal anyway if the route has not committed by here — old page beats a black screen. */
const COMMIT_TIMEOUT_MS = 2000
/** Hard ceiling on a whole cycle. Longest legitimate path is 3470ms. */
const FAILSAFE_MS = 4500

/**
 * The URL a click should be turned into, or `null` to leave the click entirely alone.
 *
 * Everything that is not plainly an in-app route navigation is handed back to the browser:
 * modified and non-primary clicks (new tab/window), downloads — including the synthetic anchor the
 * brochure gate clicks — `target`ed and `rel="external"` links, cross-origin URLs (which is also
 * what excludes `mailto:` and `tel:`, whose origin is opaque), same-path clicks such as the
 * `#main` skip link, API routes, anything with a file extension, and anything inside
 * `[data-no-curtain]`.
 *
 * The Sanity Studio is excluded wholesale: it is a client app that routes itself and calls
 * `preventDefault()` in its own handlers, which run after this one, so intercepting there would
 * navigate twice.
 */
function navigableHref(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0) return null
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null

  const { target } = event
  if (!(target instanceof Element)) return null
  const anchor = target.closest('a[href]')
  if (!(anchor instanceof HTMLAnchorElement)) return null
  if (anchor.hasAttribute('download')) return null
  if (anchor.target !== '' && anchor.target !== '_self') return null
  if (anchor.rel.split(/\s+/).includes('external')) return null
  if (anchor.closest('[data-no-curtain]') !== null) return null

  const here = window.location
  if (here.pathname === '/admin' || here.pathname.startsWith('/admin/')) return null

  let url: URL
  try {
    url = new URL(anchor.href, here.href)
  } catch {
    return null
  }
  if (url.origin !== here.origin) return null

  const path = url.pathname
  if (path === here.pathname) return null
  if (path.startsWith('/api/')) return null
  if (path === '/admin' || path.startsWith('/admin/')) return null
  if (/\.[a-z0-9]+$/i.test(path)) return null

  return `${path}${url.search}${url.hash}`
}

export function RouteCurtain() {
  const router = useRouter()
  const pathname = usePathname()
  const reduced = useReducedMotion()

  const elRef = useRef<HTMLDivElement | null>(null)
  const gsapRef = useRef<GsapInstance | null>(null)
  const phaseRef = useRef<Phase>('idle')
  const hrefRef = useRef<string | null>(null)
  const committedRef = useRef(false)
  const coveredAtRef = useRef(0)
  const lastPathRef = useRef<string | null>(null)
  const watchdogRef = useRef<number | null>(null)
  const failsafeRef = useRef<number | null>(null)
  const framesRef = useRef<number[]>([])

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  /** Back to the resting state: nothing pending, nothing scheduled, opacity back to the class. */
  const reset = useCallback(() => {
    clearWatchdog()
    if (failsafeRef.current !== null) {
      window.clearTimeout(failsafeRef.current)
      failsafeRef.current = null
    }
    for (const frame of framesRef.current) cancelAnimationFrame(frame)
    framesRef.current = []
    phaseRef.current = 'idle'
    hrefRef.current = null
    committedRef.current = false

    const el = elRef.current
    const gsap = gsapRef.current
    if (el !== null) {
      if (gsap !== null) {
        gsap.killTweensOf(el)
        // Drop the inline opacity rather than setting it to 0, so the element goes back to being
        // governed by its `opacity-0` class and nothing here is left asserting a value.
        gsap.set(el, { clearProps: 'opacity' })
      }
      el.dataset.phase = 'idle'
    }
  }, [clearWatchdog])

  const armFailsafe = useCallback(() => {
    if (failsafeRef.current !== null) window.clearTimeout(failsafeRef.current)
    failsafeRef.current = window.setTimeout(() => {
      failsafeRef.current = null
      reset()
    }, FAILSAFE_MS)
  }, [reset])

  /** Fade back out, holding whatever remains of the 170ms the reference sits at full black. */
  const reveal = useCallback(() => {
    if (phaseRef.current !== 'awaiting') return
    clearWatchdog()

    const el = elRef.current
    const gsap = gsapRef.current
    if (el === null || gsap === null) {
      reset()
      return
    }

    phaseRef.current = 'revealing'
    el.dataset.phase = 'revealing'
    gsap.to(el, {
      opacity: 0,
      duration: REVEAL_S,
      delay: Math.max(0, HOLD_MS - (performance.now() - coveredAtRef.current)) / 1000,
      ease: EASE,
      onComplete: reset,
    })
  }, [clearWatchdog, reset])

  /** The new route has committed. Give it two frames to paint before lifting the black. */
  const onCommit = useCallback(() => {
    const phase = phaseRef.current
    if (phase === 'idle' || phase === 'revealing') return
    committedRef.current = true
    if (phase !== 'awaiting') return

    const outer = requestAnimationFrame(() => {
      framesRef.current.push(requestAnimationFrame(reveal))
    })
    framesRef.current.push(outer)
  }, [reveal])

  /** Screen is black. Issue the navigation the click was holding back. */
  const onCovered = useCallback(() => {
    const el = elRef.current
    if (el === null) {
      reset()
      return
    }

    phaseRef.current = 'awaiting'
    el.dataset.phase = 'awaiting'
    coveredAtRef.current = performance.now()

    const href = hrefRef.current
    if (!committedRef.current) {
      if (href === null) {
        reset()
        return
      }
      try {
        router.push(href)
      } catch {
        // A router that refuses the push must not cost the visitor the page they can still see.
        reset()
        return
      }
    }

    if (committedRef.current) reveal()
    else watchdogRef.current = window.setTimeout(reveal, COMMIT_TIMEOUT_MS)
  }, [reset, reveal, router])

  // Warm GSAP up and arm the listeners. The click listener is attached immediately but no-ops
  // until `gsapRef` is populated, so a chunk that never arrives leaves native navigation intact
  // rather than swallowing clicks — the same "visible and working by default" contract the rest of
  // the motion layer keeps.
  useEffect(() => {
    if (reduced) return

    let live = true
    getGsap()
      .then(({ gsap }) => {
        if (live) gsapRef.current = gsap
      })
      .catch((err) => {
        // Worth seeing in a console: navigation still works, it just stops being covered.
        console.error('[RouteCurtain] page transitions unavailable; navigating uncovered', err)
      })

    const onClick = (event: MouseEvent) => {
      const el = elRef.current
      const gsap = gsapRef.current
      if (el === null || gsap === null) return

      const href = navigableHref(event)
      if (href === null) return
      event.preventDefault()

      // A navigation already in flight wins. The screen is black or nearly so, the visitor is
      // clicking blind, and re-aiming a half-played cycle is exactly where stuck curtains live.
      if (phaseRef.current === 'covering' || phaseRef.current === 'awaiting') return

      // From `revealing` the tween eases out of wherever it currently is, so an immediate second
      // navigation darkens again from grey rather than snapping back to transparent.
      gsap.killTweensOf(el)
      clearWatchdog()
      armFailsafe()
      hrefRef.current = href
      committedRef.current = false
      phaseRef.current = 'covering'
      el.dataset.phase = 'covering'
      gsap.to(el, { opacity: 1, duration: COVER_S, ease: EASE, onComplete: onCovered })
    }

    const onPopState = () => {
      const el = elRef.current
      const gsap = gsapRef.current
      if (el === null || gsap === null) return
      // A pop that only moved the hash or the query has no page swap to hide.
      if (window.location.pathname === lastPathRef.current) return
      if (phaseRef.current === 'covering' || phaseRef.current === 'awaiting') return

      gsap.killTweensOf(el)
      clearWatchdog()
      armFailsafe()
      hrefRef.current = null
      committedRef.current = false
      phaseRef.current = 'awaiting'
      el.dataset.phase = 'awaiting'
      coveredAtRef.current = performance.now()
      gsap.set(el, { opacity: 1 })
      watchdogRef.current = window.setTimeout(reveal, COMMIT_TIMEOUT_MS)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)

    return () => {
      live = false
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
      reset()
      gsapRef.current = null
    }
  }, [reduced, armFailsafe, clearWatchdog, onCovered, reset, reveal])

  // `usePathname` changing is the only reliable signal in this router that the new route has been
  // committed to the DOM. On first run there is nothing in flight, so this just records where we
  // are for the popstate comparison.
  useEffect(() => {
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname
    onCommit()
  }, [pathname, onCommit])

  return (
    <div
      ref={elRef}
      data-route-curtain
      // Rendered once by React and mutated imperatively from the tween callbacks thereafter. The
      // prop never changes between renders, so React never writes it again and never fights the
      // phase the state machine has set. Keeping the phase out of React state also keeps a
      // navigation from re-rendering anything.
      data-phase="idle"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999999] bg-secondary opacity-0 motion-reduce:hidden"
    />
  )
}
