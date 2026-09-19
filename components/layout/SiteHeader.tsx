'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LogoMark } from '@/components/brand/LogoMark'
import { getGsap } from '@/components/motion/gsap'
import { loadSequenceActive, onLoadStage, type LoadStage } from '@/components/motion/loadCues'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { SiteSettings } from '@/lib/data/types'
import { relativeLuminance } from '@/lib/tokens'

/**
 * The header band, and the two things about it that are not obvious: there are TWO of it, and its
 * ink is decided by what is painted behind it rather than by which page you are on.
 *
 * ## Geometry
 *
 * `fixed left-0 top-[1.5vw] w-full h-auto` with NO vertical padding, and the inner grid set
 * `items-start`. The band is 41.27px tall and that height belongs to the Contact button, not to the
 * header: the wordmark and the button share a top edge at y=21.6, and the nav links centre inside
 * the button's height at y=33.6. Padding on the header would break all three relationships at once
 * — it pushes the band down, makes it 75px tall, and `items-center` then floats the links 3.7px
 * above where they belong. If the Contact button's own padding changes, the band's height and the
 * links' baseline follow it, which is the intent.
 *
 * The row is two `col-span-6` blocks, not three. The second one starts at grid column 7 (x=730 at
 * 1440) and is `flex justify-between`, so the three links hang off the grid's midpoint and Contact
 * is pushed to the far right. Centring the nav instead — the obvious reading of "nav in the middle"
 * — lands the first link a whole column too far left and destroys the alignment with the column-7
 * edge that the sections below it are all built on. Inter-link spacing is `pr-[1vw]` (14.4px) on
 * each link rather than a gap on the parent: the padding is inside the link's own box, which is
 * what makes the hover underline stop at the end of the word instead of running into the next one.
 *
 * ## Ink, and why it is not a route decision
 *
 * The page alternates black and cream chapters, so a fixed ink makes the header disappear over half
 * of them — white on white for three of the home page's bands. An earlier version here decided ink
 * once per route from the first screen's colour, on the argument that sampling the scroll position
 * would put white ink on a white page at scroll 0. That argument is wrong in both directions: the
 * first screen's colour says nothing about the eleventh, and sampling has no such failure if you
 * sample what is actually painted.
 *
 * So the ink is sampled, with `transition-colors duration-500 ease-in-out` so the flip reads as the
 * band crossing an edge rather than as a repaint.
 *
 * What it samples is deliberate. The obvious implementation tags each dark section with an
 * attribute and watches those boxes — and that is subtly broken, because several sections here
 * paint through a scroll-scrubbed transform: a section box can still be under the band while the
 * black it paints has already been carried hundreds of pixels down the page, and the header then
 * confidently sets black ink over black. Hit-testing the painted stack at the exact points where
 * the ink sits cannot make that mistake, and it needs no cooperation from any section, so a section
 * that is re-ordered or re-coloured can never leave a stale attribute behind.
 *
 * Its one blind spot is a `pointer-events: none` layer: hit testing skips those, so a decorative
 * full-bleed overlay marked that way is invisible to this sampler and the layer beneath it decides.
 * Nothing on the site paints an opaque tone that way today (scrims carry a gradient, which counts).
 *
 * ## Two instances
 *
 * Over the OPENING there is no fixed header at all. A copy of the band rides inside the hero and
 * scrolls away with it, and the fixed one is held hidden until the opening's bottom edge leaves the
 * top of the viewport, then fades in over 500ms and is fully reversible on the way back. That is the
 * reference's own construction — it ships two instances too — and it is what stops the header from
 * sitting on the opening photograph and, more importantly, off the top of the chapter after it,
 * whose copy occupies the same columns the nav does.
 *
 * The opening is NOT just the hero. A page says how far it runs with `data-header-reveal`, and the
 * hero is the fallback for pages that do not. The header asking "where does the opening end" rather
 * than naming a section keeps the two from having to know about each other.
 *
 * `HeroHeaderBand` is the copy, exported for the hero to mount. Two properties keep the hand-off
 * safe: the copy starts hidden and stays hidden unless this component confirms it exists, and this
 * header only hides itself once it has FOUND the copy in the DOM. So a page with no copy — every
 * interior route, or a hero that has not mounted one — keeps a visible fixed header from y=0 rather
 * than a headerless first screen.
 *
 * Hidden means `visibility: hidden`, not opacity alone. The reference leaves its hidden header at
 * `opacity: 0; pointer-events: none`, which keeps an invisible nav in the tab order and in the
 * accessibility tree; a focusable control the visitor cannot see is a WCAG 2.4.11 failure and it also
 * puts two "Main" navs in the tree at once. Visibility solves both, and it is the reason exactly one
 * band is ever perceivable. It also matters here specifically because this element is
 * `pointer-events-none` with `pointer-events-auto` children: opacity 0 alone would leave three
 * invisible but clickable nav links lying over the hero.
 *
 * ## Load entrance
 *
 * The wordmark block and the links block are two separate beats 1200ms apart — wordmark at t0+0.30,
 * while the curtain is still ~40% opaque so the identity rises THROUGH the black, and the links at
 * t0+1.50. Both are the same tween (opacity, 1.5s, `power4.out`); the separation is the whole
 * effect. Driven from the load cues rather than from mount, because mount order is a hydration
 * detail and these offsets are measured against the curtain.
 */

const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/studio', label: 'Studio' },
  { href: '/journal', label: 'Journal' },
]

/*
 * The hand-off between the hero-local band and the fixed one is a 500ms cubic-out cross-fade — the
 * measured ramp fits 1-(1-t/500)^3 to within 0.01, so an out-ease rather than the in-out the rest of
 * this file's colour transitions use. It is expressed as Tailwind classes on both elements rather
 * than as constants for a tween, because nothing about a binary visibility swap needs a timeline.
 */

/** The entrance: one identical tween on both blocks, fired 1200ms apart by the cue bus. */
const ENTRANCE_S = 1.5
const ENTRANCE_EASE = 'power4.out'

/**
 * A backstop, not a mechanism — the load sequence promises every cue on every path it can fail
 * down. But this hook is the one holding the band at opacity 0, so it does not delegate the last
 * resort. Set beyond the sequence's own watchdog so it can only replace a cue that is never
 * coming, never one that is merely late.
 */
const CUE_WATCHDOG_MS = 6000

/** The luminance at which black and white ink give identical contrast: √(1.05·0.05) − 0.05. */
const INK_CROSSOVER = 0.179
/** Below this, a background is a tint over something else and the sampler keeps walking down. */
const OPAQUE_ENOUGH = 0.5
/**
 * Scrubbed transforms keep moving for a few frames after the wheel stops, and the last frame is the
 * one the visitor reads. Re-sampling after the scroll settles is what keeps the ink honest there.
 */
const INK_SETTLE_MS = 120

type Ink = 'light' | 'dark'

/**
 * The ink for the FIRST paint only — before hydration, and for a visitor with no JS at all. Route
 * is the only thing available that early, and it is a decent guess: pages whose first screen is
 * full-bleed photography open dark. The sampler takes over on the first frame and owns it from
 * there, so being wrong here costs one frame, not a page.
 */
function firstPaintInk(pathname: string): string {
  const overPhotography =
    pathname === '/' || /^\/projects\/[^/]+\/?$/.test(pathname) || /^\/journal\/[^/]+\/?$/.test(pathname)
  return overPhotography ? 'text-primary' : 'text-secondary'
}

/** `rgb()`/`rgba()`, in either the legacy comma form or the modern slash form. */
function parseRgb(value: string): { hex: string; alpha: number } | null {
  const match = /^rgba?\(([^)]+)\)$/.exec(value)
  if (!match) return null
  const parts = match[1].split(/[\s,/]+/).filter(Boolean)
  if (parts.length < 3) return null
  const rgb = parts.slice(0, 3).map(Number)
  if (!rgb.every((c) => Number.isFinite(c))) return null
  // A percentage alpha parses to NaN here and is read as opaque. That is the safe direction: it
  // stops the walk at a layer that is at least partly painted rather than skipping past it.
  const alpha = parts.length > 3 ? Number(parts[3]) : 1
  return {
    hex: `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`,
    alpha: Number.isFinite(alpha) ? alpha : 1,
  }
}

/**
 * A photograph wide enough to be the band's whole background rather than a picture sitting on it.
 * Full-bleed photography is the case where light ink is right regardless of the image's own tones:
 * it fills the band edge to edge, it is dark-graded, and it usually carries a scrim.
 *
 * An inset picture is the opposite case and it is why this threshold exists. A journal card's
 * photograph is 690px wide inside a white section, so the band around it is white — and ours are
 * bright interiors, so choosing light ink for the whole band because one probe point landed on a
 * photograph made the wordmark and the nav unreadable for a 600px stretch of the journal chapter.
 * The reference keeps dark ink through that whole chapter for the same reason.
 */
function isFullBleedMedia(node: Element): boolean {
  return node.getBoundingClientRect().width >= window.innerWidth * 0.9
}

/**
 * Walks the painted stack at one viewport point, topmost first, and returns the ink that point
 * wants. Full-bleed photography, video and gradients want light ink; anything narrower is a picture
 * placed ON a background, so the walk continues past it to find what that background is.
 */
function inkAtPoint(x: number, y: number): Ink | null {
  for (const node of document.elementsFromPoint(x, y)) {
    // Our own bands are at these points by definition; the wordmark cannot decide its own colour.
    if (node.closest('[data-header-band]')) continue
    const tag = node.tagName
    if (tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS' || tag === 'svg') {
      if (isFullBleedMedia(node)) return 'light'
      continue
    }
    const style = window.getComputedStyle(node)
    if (style.backgroundImage !== 'none' && isFullBleedMedia(node)) return 'light'
    const background = parseRgb(style.backgroundColor)
    if (!background || background.alpha < OPAQUE_ENOUGH) continue
    return relativeLuminance(background.hex) < INK_CROSSOVER ? 'light' : 'dark'
  }
  return null
}

/**
 * The wordmark's and the nav's own boxes carry `data-ink-probe`, so the sampler asks about the
 * pixels the ink is actually set on rather than about the middle of a band that is mostly empty.
 * Two points per box, because a band can straddle an edge — a card, or a column of black against a
 * white page — and one of those points will be on the wrong side of it.
 */
function inkProbePoints(band: HTMLElement): Array<[number, number]> {
  const points: Array<[number, number]> = []
  for (const probe of band.querySelectorAll<HTMLElement>('[data-ink-probe]')) {
    const rect = probe.getBoundingClientRect()
    // The nav is `display: none` below sm and measures to nothing there.
    if (rect.width < 1 || rect.height < 1) continue
    points.push([rect.left + rect.width * 0.15, rect.top + rect.height / 2])
    points.push([rect.left + rect.width * 0.85, rect.top + rect.height / 2])
  }
  return points
}

/** Majority of the ink-bearing points; a tie goes to the wordmark, which is the leftmost probe. */
function resolveInk(band: HTMLElement): Ink | null {
  let light = 0
  let dark = 0
  let first: Ink | null = null
  for (const [x, y] of inkProbePoints(band)) {
    const ink = inkAtPoint(x, y)
    if (!ink) continue
    first ??= ink
    if (ink === 'light') light += 1
    else dark += 1
  }
  if (light === dark) return first
  return light > dark ? 'light' : 'dark'
}

/**
 * Holds a block at opacity 0 and releases it on its load cue. Returns the ref to attach.
 *
 * Nothing is hidden speculatively: the block renders visible, and only the resolved branch — GSAP
 * present AND a load sequence that has promised to fire every cue — is allowed to hide it. A failed
 * chunk or an interior route with no sequence therefore lands on a visible header rather than on an
 * empty one.
 */
function useLoadFade(stage: Extract<LoadStage, 'wordmark' | 'nav'>) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (reduced || !el) return

    let cancelled = false
    let dispose: (() => void) | undefined

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        // Asked here rather than at the top of the effect, for the reason SplitLines documents: a
        // LoadSequence mounted above this component claims the page during its own mount, and
        // effects run child-first, so only a macrotask past every mount is the answer dependable.
        if (!loadSequenceActive()) return

        gsap.set(el, { opacity: 0 })
        let tween: ReturnType<typeof gsap.to> | undefined
        const play = () => {
          if (cancelled || tween) return
          tween = gsap.to(el, { opacity: 1, duration: ENTRANCE_S, ease: ENTRANCE_EASE })
        }

        const unsubscribe = onLoadStage(stage, play)
        const watchdog = window.setTimeout(play, CUE_WATCHDOG_MS)

        dispose = () => {
          unsubscribe()
          window.clearTimeout(watchdog)
          tween?.kill()
          gsap.set(el, { clearProps: 'opacity' })
        }
      })
      .catch((err) => {
        console.error('[SiteHeader] load entrance unavailable; the header renders visible', err)
      })

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [reduced, stage])

  return ref
}

/**
 * One nav or footer link: a label that lifts and a hairline that is ruled out beneath it.
 *
 * Two elements and two properties, because that is the gesture — 3.6px of lift over 200ms while a
 * 1.4375px rule sweeps `scaleX` 0→1 over 300ms. The origin flip is the part that is easy to miss:
 * at rest it sits on the right, on hover it moves to the left, so the line is drawn out of the left
 * edge with the reading direction and then collapses away to the right. A single fixed origin can
 * only give you the entrance played backwards.
 *
 * The `group` is the anchor itself rather than an inner wrapper, so `group-focus-visible` reaches
 * the same two states from the keyboard: an affordance that exists only under a pointer carries no
 * information to anyone tabbing through.
 *
 * `pr-[1vw]` is on the anchor and the rule is `w-full` of its content box, so the rule measures the
 * word and the padding does the spacing.
 */
function NavLink({ href, label, current }: { href: string; label: string; current: boolean }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'group block h-fit pr-[1vw] rounded-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
      )}
    >
      <span className="block transition-transform duration-200 ease-out group-hover:-translate-y-[0.25vw] group-focus-visible:-translate-y-[0.25vw] motion-reduce:transition-none">
        {label}
      </span>
      {/* `.in-out-line`, not the same utilities written out longhand. The footer's links use the
          utility, and two spellings of one gesture drift: this copy was a pixel thicker than the
          footer's until the utility's height was corrected, and only one of them would have been
          fixed. The utility also carries the reduced-motion rule that keeps a link underline at
          rest while pinning the structural rules drawn — a distinction longhand utilities cannot
          express, since both spell `motion-reduce:transition-none` identically. */}
      <span aria-hidden="true" className="in-out-line block" />
    </Link>
  )
}

/**
 * The sub-sm nav: a text trigger and a full-screen sheet.
 *
 * The sheet is portalled to `document.body` rather than rendered in place. Its own position is
 * `fixed`, and inside the band that is fragile twice over — the fixed header spends the hero at
 * opacity 0, which would take the sheet with it, and any transform on an ancestor (the hero is
 * scroll-scrubbed) would re-base `inset-0` onto that ancestor's box instead of the viewport. The
 * portal puts it out of reach of both. It can only be mounted from a click, so the branch never
 * runs during a server render where `document` does not exist.
 *
 * The trigger is a 31.2px text label, not an icon glyph in a 44px box: at this width the reference
 * sets it at the same step as its section titles. `min-h-11 min-w-11` keeps the 44px touch target
 * under it.
 */
function MobileNav({ settings }: { settings?: SiteSettings }) {
  const [open, setOpen] = useState(false)
  const sheetId = useId()

  // Lock the page while the sheet is open, and restore on unmount as well as on close — a sheet
  // that unmounts while open would otherwise leave the body permanently unscrollable.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const items = [{ href: '/', label: 'Home' }, ...NAV, { href: '/contact', label: 'Contact' }]

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        // Only while it exists: `aria-controls` pointing at an id that is not in the document is a
        // broken reference, and the sheet is unmounted when closed.
        aria-controls={open ? sheetId : undefined}
        onClick={() => setOpen(true)}
        className="pointer-events-auto inline-flex min-h-11 min-w-11 items-center justify-end rounded-none text-lead-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:hidden"
      >
        Menu
      </button>

      {open &&
        createPortal(
          <div
            id={sheetId}
            className="pointer-events-auto fixed inset-0 z-[85] flex flex-col bg-primary text-secondary sm:hidden"
          >
            <div className="layout-grid items-start py-[4vw]">
              <LogoMark className="col-span-8 w-[30vw]" />
              <div className="col-span-4 flex justify-end">
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-end rounded-none text-lead-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  Close
                </button>
              </div>
            </div>

            <nav aria-label="Main" className="layout-grid flex-1 content-center gap-y-[6vw]">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="col-span-12 text-lead-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* The sheet is where a phone call is one tap away, so the real numbers belong in it.
                Email only when there is one — a `mailto:` to a mailbox that does not exist
                swallows an enquiry while looking like it worked. */}
            {settings && (
              <div className="layout-grid gap-y-[2vw] pb-[10vw] text-body-sm">
                {settings.phones.slice(0, 1).map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="col-span-12">
                    {phone}
                  </a>
                ))}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="col-span-12">
                    {settings.email}
                  </a>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  )
}

/**
 * The contents of the band, shared by both instances. Two grid blocks, each animated on its own
 * load cue: `col-span-6` for the wordmark, `col-span-6` for links plus Contact.
 */
function HeaderRow({ settings }: { settings?: SiteSettings }) {
  const pathname = usePathname()
  const wordmark = useLoadFade('wordmark')
  const links = useLoadFade('nav')

  return (
    <>
      <div ref={wordmark} className="col-span-6 flex">
        <Link
          href="/"
          aria-label="BKR INFRA — Home"
          data-ink-probe
          // `items-center` now that this is a single graphic rather than a word plus an ornament
          // that had to share a cap line.
          className="pointer-events-auto flex items-center rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          {/* The real mark, not the letters "BKR" set as type. Its letterforms are `currentColor`,
              so they take whatever ink the sampler has decided for this band — cream over a navy
              chapter, navy over a cream one — while the orange wedge stays orange on both. That is
              what lets ONE instance ride a header that crosses photography and both chapter colours.

              Sized by width (`w-[8.2vw]`, ~118px at 1440) so the band stays the measured 41.27px
              tall. Never give this a height budget: a flex parent then compresses the graphic, which
              is how a previous version of this header shipped an 8px-tall logo. */}
          {/* Width, never height — a height budget lets a flex parent crush the graphic, which is how
              a previous version of this header shipped an 8px-tall logo. 9.6vw is ~138px at 1440,
              which keeps the BKR cap height inside the band's measured 41.27px once INFRA and its
              rules are accounted for. */}
          <LogoMark className="w-[9.6vw] max-sm:w-[30vw]" />
        </Link>
      </div>

      <div ref={links} className="col-span-6 flex items-center justify-end sm:justify-between">
        {/* `text-label` carries no `max-sm:` pair on purpose: this nav is `display: none` below sm,
            where the sheet replaces it, so the vw step is never read at a narrow width. */}
        <nav
          aria-label="Main"
          data-ink-probe
          className="pointer-events-auto hidden h-fit text-label sm:flex"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              // The current link gets the state and no visual at all. An underline here would both
              // depart from the reference and collide with the hover rule, which sits at the same
              // baseline at a different offset.
              current={pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <Button href="/contact" tone="dark" className="pointer-events-auto max-sm:hidden">
          Contact
        </Button>
        <MobileNav settings={settings} />
      </div>
    </>
  )
}

/**
 * The hero-local copy of the band: in the hero, scrolling away with it.
 *
 * Mount it as a child of the hero section (which must be `relative`). It starts `invisible` and is
 * revealed by `SiteHeader`'s hand-off once that has confirmed it exists, so a page that mounts this
 * without a `[data-hero]` ancestor — or with no GSAP — simply never shows it and keeps the fixed
 * header instead. Ink is fixed light here: the hero is full-bleed dark photography by definition.
 */
export function HeroHeaderBand({ settings }: { settings?: SiteSettings }) {
  return (
    <div
      data-header-band="hero"
      // Starts hidden, and stays hidden unless `SiteHeader` confirms it exists and reveals it. That
      // ordering is what makes the whole arrangement fail safe: a page that mounts this band without
      // a `[data-hero]` ancestor, or with no JS at all, simply shows the fixed header instead of
      // showing neither.
      className="layout-grid pointer-events-none invisible absolute inset-x-0 top-[1.5vw] z-20 items-start text-primary opacity-0 transition-[opacity,visibility] duration-500 ease-out motion-reduce:transition-none max-sm:top-[4vw]"
    >
      <HeaderRow settings={settings} />
    </div>
  )
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  const band = useRef<HTMLElement>(null)

  // Ink. Deliberately outside the reduced-motion branch: legibility is not decoration, and this
  // effect loads nothing — it reads the painted stack and swaps one class.
  //
  // The class is toggled on the node rather than held in state. Sampling runs once per animation
  // frame while scrolling, and routing a scroll-rate signal through a render would re-render the
  // whole header 60 times a second to change one word's colour. `pathname` is a dependency because
  // a navigation re-renders this component and React writes the first-paint class back over
  // whatever the sampler last set, so the sampler has to re-run and re-decide after one.
  //
  // It keeps sampling while the band is hidden over the hero, which looks like waste and is not:
  // the ink has to be already correct in the frame the band fades in, or the 500ms colour
  // transition plays out in full view as a flash of the wrong colour.
  useEffect(() => {
    const el = band.current
    if (!el) return

    let current: Ink | null = null
    let frame = 0
    let settle = 0

    const sample = () => {
      const ink = resolveInk(el)
      if (!ink || ink === current) return
      current = ink
      el.classList.toggle('text-primary', ink === 'light')
      el.classList.toggle('text-secondary', ink === 'dark')
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        sample()
      })
    }

    const onScroll = () => {
      schedule()
      window.clearTimeout(settle)
      settle = window.setTimeout(schedule, INK_SETTLE_MS)
    }

    schedule()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.cancelAnimationFrame(frame)
      window.clearTimeout(settle)
    }
  }, [pathname])

  // The hand-off from the hero-local band to this one. Armed only when that band is really in the
  // document: without it this header is the only one there is and must stay visible from y=0, which
  // is also what the reference does on every route whose hero carries no copy.
  //
  // Re-armed per route. This header never unmounts, so a client-side navigation ONTO a page with a
  // hero would otherwise leave the arrangement made for the page before it — a fresh hero band that
  // nothing ever reveals, and this header still visible over a photograph it should be absent from.
  // Teardown restores both elements first, so re-arming cannot compound state.
  useEffect(() => {
    const el = band.current
    if (!el) return
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    const inHero = document.querySelector<HTMLElement>('[data-header-band="hero"]')
    if (!hero || !inHero) return

    // The hand-off happens at the end of the page's chrome-free OPENING, which is not the same thing
    // as the end of the hero. On the reference the fixed header stays absent for 2110px — the hero
    // AND the chapter after it — so there is a long stretch with no navigation at all, deliberately,
    // because that chapter is the showpiece and its copy sits at the very top of it where a nav bar
    // would land on top of the words. Gating on the hero alone put the nav straight through that
    // copy here.
    //
    // A page declares how far its opening runs with `data-header-reveal`; the hero is the fallback
    // for pages that do not. The header asking "where does the opening end" rather than naming a
    // section keeps the two from having to know about each other.
    const opening = document.querySelector<HTMLElement>('[data-header-reveal]') ?? hero

    // Driven by a plain scroll listener and CSS classes rather than by a ScrollTrigger, which is a
    // deliberate departure from how every other scroll effect on this site works.
    //
    // A ScrollTrigger with `start: 'bottom top'` on the opening only ever reached its active state
    // here when the visitor crossed the threshold GRADUALLY. A single jump past it — an in-page
    // anchor, a browser restoring a scroll position on reload, a fast flick, or a test scrolling
    // straight to an offset — left the trigger inactive and the header hidden for the whole rest of
    // the document. That is a visitor with no navigation at all, and it reproduced on a real wheel
    // gesture as well as a scripted one, so it was not a test artefact.
    //
    // The ink sampler above already reads the live layout on every scroll and is correct after any
    // jump, so this uses the same shape. It also drops the GSAP dependency for what is a single
    // binary decision: no chunk to load, no tween to be overwritten, and nothing to re-assert on
    // refresh. `visibility` rather than opacity alone is what keeps the hidden band from swallowing
    // clicks — its descendants set `pointer-events: auto`, so opacity 0 on its own would leave three
    // invisible nav links live over the hero.
    let shown: boolean | null = null

    const apply = (fixedVisible: boolean) => {
      if (fixedVisible === shown) return
      shown = fixedVisible
      el.classList.toggle('opacity-0', !fixedVisible)
      el.classList.toggle('invisible', !fixedVisible)
      inHero.classList.toggle('opacity-0', fixedVisible)
      inHero.classList.toggle('invisible', fixedVisible)
    }

    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        // The opening's own bottom edge leaving the top of the viewport — measured, not a pixel
        // constant, so the sections stay free to own their own heights.
        apply(opening.getBoundingClientRect().bottom <= 0)
      })
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.cancelAnimationFrame(frame)
      // Back to the pre-JS arrangement: this header visible, the hero's own copy hidden by its class.
      el.classList.remove('opacity-0', 'invisible')
      inHero.classList.add('opacity-0', 'invisible')
    }
  }, [pathname])

  return (
    <header
      ref={band}
      data-header-band="fixed"
      className={cn(
        'layout-grid pointer-events-none fixed left-0 top-[1.5vw] z-[80] h-auto w-full items-start',
        // Two transitions on this element, for two different things. `colors` is the ink inverting
        // per band. `opacity,visibility` is the hand-off to and from the hero's own copy of the band;
        // it is on the class rather than tweened so that a failed JS chunk leaves a visible header
        // instead of a permanently hidden one, and `visibility` rides along because this element is
        // `pointer-events-none` with `pointer-events-auto` children — opacity alone would leave three
        // invisible nav links live over the hero.
        'transition-[color,background-color,opacity,visibility] duration-500 ease-out motion-reduce:transition-none max-sm:top-[4vw]',
        firstPaintInk(pathname)
      )}
    >
      <HeaderRow settings={settings} />
    </header>
  )
}
