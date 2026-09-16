'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/brand/LogoMark'
import { COLORS } from '@/lib/tokens'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

const INTRO_STORAGE_KEY = 'bkr-intro'

// clip-path waypoints. All three are "inset(top right bottom left)": BELOW is a zero-height
// sliver pinned to the true bottom edge (invisible); COVERING is the full viewport; LIFTED is
// that same zero-height sliver but pinned to the top instead — reached by animating the
// *bottom* edge up to meet it, i.e. the curtain continuing to rise off-screen. Both transitions
// (BELOW -> COVERING, COVERING -> LIFTED) are therefore the same upward-sweep motion.
const BELOW = 'inset(100% 0 0 0)'
const COVERING = 'inset(0)'
const LIFTED = 'inset(0 0 100% 0)'

type Props = { children: React.ReactNode }

// Signature moment 2 of 3. A navy curtain carrying the BKR mark wipes up to cover a route
// change, the route changes behind it, then it wipes away. On the very first load of a
// session only, the mark's own outline draws itself (stroke-dashoffset) before that first lift.
//
// Ruling 9 ("never brick the site"): [data-curtain] is `pointer-events-none` unconditionally —
// idle or mid-animation, intro or plain route wipe — so it can never intercept a click. Real
// <Link> elements do the actual navigating; this component only decorates whatever change
// already happened. Every GSAP-dependent step below has a `.catch()` that logs and leaves the
// curtain in its safe, invisible LIFTED state — the same "degrade to inert" shape LenisProvider
// uses for smooth scroll.
//
// clip-path is never driven by a React-computed `style` value tied to state that can change
// more than once (e.g. `showIntro`): once true, `showIntro` stays true for the rest of the
// page's life, so if the resting `style` prop were a function of it, every later re-render
// (every route change re-renders this component, since it reads usePathname()) would make
// React re-assert "covering" over whatever GSAP had actually settled on, fighting the very
// animation this component exists to run. The JSX below sets a single, permanently-constant
// default (LIFTED — the safe, invisible state) and never touches clip-path declaratively again;
// every other value is applied imperatively, in effects, so nothing but this component's own
// animation code ever writes it after mount.
export function PageTransition({ children }: Props) {
  const reduced = useReducedMotion()
  const pathname = usePathname()

  const curtainRef = useRef<HTMLDivElement>(null)
  const markWrapRef = useRef<HTMLDivElement>(null)
  const prevPathname = useRef(pathname)
  const introDecided = useRef(false)
  const introActive = useRef(false)
  const activeTimeline = useRef<{ kill: () => void } | null>(null)

  const [showIntro, setShowIntro] = useState(false)

  // Decide, once, whether this session has already seen the intro. The flag is written the
  // instant the decision is made — not deferred until the animation finishes — so a second,
  // independent page load racing right behind this one (the "plays once per session" test
  // navigates again immediately after the first) always sees it already set. The setState
  // is pushed into a microtask rather than called synchronously in the effect body itself:
  // sessionStorage is an external system with no render-time-safe read (there is nothing to
  // read on the server), so the read+write happens here, on mount, exactly once — but
  // react-hooks/set-state-in-effect wants the actual re-render trigger to come from a
  // callback, not the effect's own top-level synchronous flow. A microtask still resolves
  // long before either the test's next assertion or the next page's own script runs.
  useEffect(() => {
    if (introDecided.current || reduced) return
    introDecided.current = true
    if (window.sessionStorage.getItem(INTRO_STORAGE_KEY) === null) {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
      queueMicrotask(() => setShowIntro(true))
    }
  }, [reduced])

  // First-load intro: draw the mark's outline, then lift the curtain.
  useEffect(() => {
    if (reduced || !showIntro) return
    const curtain = curtainRef.current
    const wrap = markWrapRef.current
    if (!curtain || !wrap) return

    const paths = Array.from(wrap.querySelectorAll<SVGPathElement>('[data-mark-path]'))
    if (paths.length === 0) return

    introActive.current = true

    // Plain DOM, synchronous, no GSAP import required yet: make the curtain solid and the
    // mark an invisible outline immediately, so there is no frame where the raw page or the
    // mark's normal solid fill can flash before the draw starts. LogoMark's fill is a JSX
    // presentation attribute; inline style (set here) takes precedence over it, and
    // `clearProps` below can hand control back to it later.
    curtain.style.clipPath = COVERING
    const lengths = paths.map((p) => p.getTotalLength())
    paths.forEach((p, i) => {
      p.style.fill = 'transparent'
      p.style.stroke = COLORS.ivory
      p.style.strokeWidth = '1.5'
      p.style.strokeDasharray = String(lengths[i])
      p.style.strokeDashoffset = String(lengths[i])
    })

    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        activeTimeline.current?.kill()
        gsap.set(curtain, { willChange: 'clip-path' })
        const tl = gsap.timeline({
          onComplete: () => {
            introActive.current = false
            gsap.set(curtain, { willChange: 'auto' })
            // Hand the mark back to LogoMark's own fill/no-stroke presentation attributes for
            // every ordinary route wipe from here on — the drawn-outline look is this intro's
            // alone.
            gsap.set(paths, { clearProps: 'fill,stroke,strokeWidth,strokeDasharray,strokeDashoffset' })
          },
        })
        activeTimeline.current = tl
        tl.to(paths, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.08 }).to(
          curtain,
          { clipPath: LIFTED, duration: 0.55, ease: 'power3.inOut' }
        )
      })
      .catch((err) => {
        console.error('[PageTransition] intro animation unavailable; curtain left lifted', err)
        introActive.current = false
        if (cancelled) return
        curtain.style.willChange = 'auto'
        curtain.style.clipPath = LIFTED
        paths.forEach((p) => {
          p.style.fill = ''
          p.style.stroke = ''
          p.style.strokeWidth = ''
          p.style.strokeDasharray = ''
          p.style.strokeDashoffset = ''
        })
      })

    return () => {
      cancelled = true
      activeTimeline.current?.kill()
      activeTimeline.current = null
    }
  }, [reduced, showIntro])

  // Route changes: wipe the curtain up to cover, then away again. `prevPathname` starts equal
  // to the pathname at mount, so only a genuine client-side navigation (a change after mount)
  // trips this — never the initial render. Deferred while the intro is still playing: the
  // intro's own lift already reveals whatever route is current by the time it finishes, and
  // racing it here would only cancel it mid-draw for no visible benefit (curtain is
  // pointer-events-none throughout either way, so navigation itself is never at risk).
  useEffect(() => {
    if (reduced) return
    if (prevPathname.current === pathname) return
    if (introActive.current) return
    prevPathname.current = pathname
    const curtain = curtainRef.current
    if (!curtain) return

    // Instant, synchronous, no GSAP import required yet — the wipe must already be covering
    // whatever it is about to reveal-then-hide before the animated tween can even start.
    curtain.style.clipPath = BELOW
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        activeTimeline.current?.kill()
        gsap.set(curtain, { willChange: 'clip-path' })
        const tl = gsap.timeline({ onComplete: () => gsap.set(curtain, { willChange: 'auto' }) })
        activeTimeline.current = tl
        tl.to(curtain, { clipPath: COVERING, duration: 0.55, ease: 'power3.inOut' }).to(curtain, {
          clipPath: LIFTED,
          duration: 0.55,
          ease: 'power3.inOut',
        })
      })
      .catch((err) => {
        console.error('[PageTransition] route wipe unavailable; curtain left lifted', err)
        if (!cancelled) curtain.style.clipPath = LIFTED
      })

    return () => {
      cancelled = true
    }
  }, [pathname, reduced])

  // Reduced motion: no curtain, no intro, nothing decorative at all — content mounts at its
  // final state immediately. All hooks above still ran (rules of hooks), each already guarded
  // internally on `reduced`.
  //
  // IMPORTANT: this used to be an early `if (reduced) return <>{children}</>` followed by a
  // differently-shaped fallthrough `return <>{curtain}{children}</>`. `useReducedMotion()`
  // always starts `true` on the very first render (frozen contract) and flips to `false`
  // shortly after mount via an effect, so *every* normal page load passed through exactly
  // that transition. Because React reconciles Fragment children positionally (no keys),
  // `{children}` moved from index 0 (reduced=true, sole child) to index 1 (reduced=false,
  // second child, after the curtain) — a shape change the reconciler cannot tell apart from
  // "different content," so it unmounted and remounted the entire page subtree moments after
  // every mount. That is a real, user-visible bug (lost effects, lost scroll/focus, restarted
  // animations), not just a test artifact — it surfaced in the e2e suite as elements going
  // stale mid-action ("Element is not attached to the DOM") and computed styles reading as
  // empty strings on a just-replaced node.
  //
  // Fix: a single, unconditionally-executed return with a *fixed* two-slot shape. Slot 0 is
  // the curtain, rendered as `false` (no DOM at all) instead of omitted when reduced; slot 1
  // is always `{children}`. `{children}` never changes position, so React reconciles it as
  // an update in place — never a remount — regardless of how `reduced` moves.
  return (
    <>
      {!reduced && (
        <div
          data-curtain
          ref={curtainRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-navy-800"
          style={{ clipPath: LIFTED }}
        >
          <div ref={markWrapRef} {...(showIntro ? { 'data-intro': '' } : {})}>
            {/* Width, not height — see the note in Logo.tsx. */}
            <LogoMark color={COLORS.ivory} className="h-auto w-48 shrink-0" />
          </div>
        </div>
      )}
      {children}
    </>
  )
}
