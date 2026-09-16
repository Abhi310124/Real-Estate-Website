'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { getGsap } from '@/components/motion/gsap'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitWords } from '@/components/motion/SplitWords'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pill } from '@/components/ui/Pill'
import { Rule } from '@/components/ui/Rule'
import { cn } from '@/lib/cn'
import type { ProjectSummary } from '@/lib/data'
import { formatPrice } from '@/lib/format'

type Props = { projects: ProjectSummary[] }

// Per-card flourish, in one place so the numbers are tunable without hunting through the
// timeline. `rotateY` needs a perspective to render as anything but a flat horizontal squash;
// this sets it per card (GSAP's `transformPerspective`, i.e. a `perspective()` function inside
// each card's own transform list) rather than as a `perspective` property on the track.
// Deliberate: the track is ~2.5 viewports wide, and a `perspective` on it would put a single
// shared vanishing point at the track's centre, so cards near either end would be viewed at an
// extreme off-axis angle and distort badly. Per-card perspective gives every card its own
// vanishing point at its own centre, which is what makes the rotation read as a subtle turn
// instead of a smear.
const CARD_PERSPECTIVE = 900
const CARD_ROTATION = 7
const CARD_SCALE_MIN = 0.9

/**
 * Signature moment 1 of 3 — the section pins to the viewport and translates a horizontal track
 * of featured-project cards as the user scrolls down.
 *
 * Ruling 2: the markup below IS the fallback, and the pinned path upgrades away from it. The
 * track ships server-rendered as `overflow-x-auto snap-x snap-mandatory` with `snap-center`
 * cards, and only flips to the non-scrolling, GSAP-translated form once three separate things
 * have been confirmed on the client — motion is allowed, the pointer is not coarse, and the GSAP
 * chunk actually loaded. Never the reverse: there is no state in which pinned markup ships and a
 * fallback has to rescue it. Two reasons this direction is the correct one:
 *
 *   1. It makes the touch test deterministic. That test reads `getComputedStyle(track).overflowX`
 *      and expects `auto`/`scroll`. `useReducedMotion()` returns `true` on its first render by
 *      design, so there is always a one-render settle window before any client-side media query
 *      has been consulted — a window this project has already had flake in twice. Because the
 *      fallback is the default rather than something applied after a `matchMedia` check, that
 *      read cannot race it.
 *   2. It degrades correctly. If the GSAP chunk never loads (stale deploy, flaky network), the
 *      visitor keeps a working scroll-snap carousel instead of a dead full-height section.
 */
export function HorizontalShowcase({ projects }: Props) {
  const reduced = useReducedMotion()
  // Starts `true` — the safe value — for the same reason useReducedMotion() starts `true`: the
  // very first paint must be the fallback, before any media query has been read. `active` below
  // is additionally gated on the GSAP chunk having resolved, so this initial value can never be
  // what decides the first paint, but keeping it on the safe side matches the house convention
  // and means a future refactor that drops that second gate still fails safe.
  const [coarsePointer, setCoarsePointer] = useState(true)
  const [gsapReady, setGsapReady] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Ruling 3: either a coarse pointer or reduced motion selects the fallback. A coarse pointer
  // means touch, where a pinned section fights the browser's own scrolling.
  const wantsPin = !reduced && !coarsePointer
  const active = wantsPin && gsapReady

  // Same shape as useReducedMotion(), including the live `change` listener: a device that gains
  // or loses a coarse pointer mid-session (a detached tablet keyboard, a desktop switching to
  // touch emulation) re-decides rather than stranding a half-pinned section. Because the
  // fallback markup is a pure function of `active`, flipping back needs no teardown of its own.
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarsePointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Load GSAP only where it could be used, and treat "loaded" as a separate, explicit gate from
  // "wanted". Split from the effect below on purpose: flipping `active` has to re-render the
  // track into its non-scrolling form BEFORE anything measures it, and a state update inside one
  // effect is not visible to that same effect. Keying the build effect off `active` gets the
  // committed DOM for free.
  useEffect(() => {
    if (!wantsPin) return
    let cancelled = false
    getGsap()
      .then(() => {
        if (!cancelled) setGsapReady(true)
      })
      .catch((err) => {
        // Matching LenisProvider: a chunk that fails to load degrades to the shipped fallback —
        // here the native scroll-snap carousel, which is already on screen and needs no repair —
        // rather than surfacing as an unhandled rejection. Logged rather than swallowed.
        console.error(
          '[HorizontalShowcase] pinned horizontal scroll unavailable; native scroll-snap carousel stays in place',
          err,
        )
      })
    return () => {
      cancelled = true
    }
  }, [wantsPin])

  useEffect(() => {
    if (!active) return
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return

        // Ruling 1: the brief computed this ONCE into a `const` and then used that captured
        // value in both `x: -total` and `end: () => '+=' + total`, which makes
        // `invalidateOnRefresh: true` a no-op — the end callback re-runs on refresh but reads a
        // frozen number, so a resize recalculates nothing and the pin distance silently stops
        // matching the track width. Both values are function-based here so GSAP re-evaluates
        // them on every refresh, which is what `invalidateOnRefresh` was there to do.
        //
        // Clamped at zero for the case where the whole track already fits on screen (very wide
        // viewport, few featured projects): a negative travel would translate the track the
        // wrong way. `end` is separately clamped to a 1px minimum because `end: '+=0'` is a
        // degenerate, zero-length pin. At 1px the pin is imperceptible, and a later resize that
        // makes the track overflow again is picked up by `invalidateOnRefresh`.
        //
        // `window.innerWidth`, per the ruling, rather than `track.clientWidth`: the two differ
        // by the width of the vertical scrollbar, so the track travels a scrollbar's width
        // further than strictly needed and the final item's last ~15px are clipped by the
        // section. The final item is the transparent end panel, whose text sits well inside its
        // own right padding, so nothing visible is lost. Measured, not assumed: `scrollWidth`
        // does report the overflowing content extent on an `overflow: visible` element in
        // Chromium (2376px against a 1360px clientWidth in the probe), and is unaffected by the
        // element's own transform — both load-bearing here.
        const travel = () => Math.max(0, track.scrollWidth - window.innerWidth)

        const cards = gsap.utils.toArray<HTMLElement>('[data-showcase-card]', track)
        gsap.set(track, { willChange: 'transform' })
        gsap.set(cards, { transformPerspective: CARD_PERSPECTIVE })

        // Ruling 4: GSAP's `pin: true`, never CSS `position: sticky`, and never both — the pin
        // wraps this element in a spacer and manages its own spacing, so a sticky rule on top of
        // it double-pins and jitters. Ruling 7: this stays a plain `x` tween with `ease: 'none'`,
        // because that is the only shape `containerAnimation` can map a horizontal position onto.
        const container = gsap.to(track, {
          x: () => -travel(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${Math.max(1, travel())}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            // A scrubbed tween never "completes", so the will-change hint is tied to whether the
            // trigger is live rather than to an onComplete — same lifecycle as Parallax.
            onToggle: (self) => gsap.set(track, { willChange: self.isActive ? 'transform' : 'auto' }),
          },
        })

        // Ruling 7: per-card easing driven by `containerAnimation`, so `start`/`end` are measured
        // along the track's horizontal progress instead of the page's. None of these carries
        // `pin` — a ScrollTrigger using `containerAnimation` cannot pin, and the one pin in this
        // section is the container's above. Each card scales up and rotates flat on its way to
        // centre, then back out again as it leaves.
        const cardTimelines = cards.map((card) =>
          gsap
            .timeline({
              scrollTrigger: {
                trigger: card,
                containerAnimation: container,
                start: 'left right',
                end: 'right left',
                scrub: true,
                onToggle: (self) =>
                  gsap.set(card, { willChange: self.isActive ? 'transform' : 'auto' }),
              },
            })
            .fromTo(
              card,
              { scale: CARD_SCALE_MIN, rotateY: CARD_ROTATION },
              { scale: 1, rotateY: 0, ease: 'power1.out', duration: 1 },
            )
            .to(card, { scale: CARD_SCALE_MIN, rotateY: -CARD_ROTATION, ease: 'power1.in', duration: 1 }),
        )

        // Keyboard reachability inside a pinned, horizontally-translated track. The section is
        // `overflow-hidden`, which is still programmatically scrollable, so focusing a card that
        // is off-screen to the right makes Chromium scroll the SECTION to reveal it. That leaves
        // `section.scrollLeft` non-zero on top of GSAP's transform, and since GSAP only ever
        // writes the transform, the offset persists and the whole row reads as shifted. Two
        // pieces: the scroll listener pins `scrollLeft` at 0 unconditionally (a net that catches
        // this however it is triggered), and `focusin` converts the browser's intent into the
        // page scroll that the pin actually responds to, so the focused card genuinely comes into
        // view with its focus ring. `window.scrollTo` is safe alongside Lenis: Lenis does not
        // patch it, and its own `onNativeScroll` resyncs `animatedScroll`/`targetScroll` to the
        // real position whenever a scroll it did not originate arrives while it is idle.
        const resetHorizontal = () => {
          if (section.scrollLeft !== 0) section.scrollLeft = 0
        }
        const onFocusIn = (event: FocusEvent) => {
          const st = container.scrollTrigger
          const distance = travel()
          if (!st || distance <= 0 || !(event.target instanceof Element)) return
          const item = event.target.closest<HTMLElement>('[data-showcase-item]')
          if (!item) return
          resetHorizontal()
          const progress = Math.min(1, Math.max(0, item.offsetLeft / distance))
          window.scrollTo({ top: st.start + (st.end - st.start) * progress })
        }
        section.addEventListener('scroll', resetHorizontal)
        track.addEventListener('focusin', onFocusIn)

        // The pin inserts a spacer and grows the document, which invalidates the start/end every
        // ScrollTrigger created before it — Hero's parallax, every Reveal, every ImageReveal.
        ScrollTrigger.refresh()

        kill = () => {
          section.removeEventListener('scroll', resetHorizontal)
          track.removeEventListener('focusin', onFocusIn)
          cardTimelines.forEach((tl) => {
            tl.scrollTrigger?.kill()
            tl.kill()
          })
          container.scrollTrigger?.kill()
          container.kill()
          // Reverting to the fallback carousel (a reduced-motion flip, a pointer change) must not
          // leave the track translated or the cards scaled — the row would be scrolled to a
          // position the native scroller knows nothing about. clearProps also drops the
          // per-card transformPerspective, and will-change is released on every element that
          // could still be live, same as Parallax/ImageReveal cleanup.
          gsap.set([track, ...cards], { clearProps: 'transform' })
          gsap.set([track, ...cards], { willChange: 'auto' })
          ScrollTrigger.refresh()
        }
      })
      .catch((err) => {
        // Degrades correctly by construction: nothing above ran, so the track is still the
        // untransformed markup React rendered. `active` stays true, which only means the track
        // is no longer a native scroller — the row still fits or clips harmlessly, and no
        // element is hidden.
        console.error('[HorizontalShowcase] pinned horizontal scroll failed to start', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
    // `projects.length` as well as `active`: the per-card triggers above are built from a DOM query
    // for `[data-showcase-card]`, and `invalidateOnRefresh` recomputes sizes but never the SET of
    // triggers — so a change in how many cards there are has to rebuild them. It cannot change on
    // this page today (a server component renders the list once), which is exactly why it is worth
    // stating rather than leaving to be rediscovered.
  }, [active, projects.length])

  // A featured list that came back empty would otherwise render a dead full-height section with
  // nothing in it. Placed after every hook, so hook order is unconditional.
  if (projects.length === 0) return null

  return (
    <section
      ref={sectionRef}
      data-showcase
      {...(active ? { 'data-showcase-active': '' } : {})}
      // `overflow-hidden` on the SECTION, never on the track: a clip on the track would travel
      // with the track's own transform, so the visible window would move together with the
      // content and the horizontal motion would cancel out to nothing. Clipping here also keeps
      // the overflowing row from producing a document-level horizontal scrollbar. `svh`
      // throughout, so mobile browser chrome cannot clip the section.
      //
      // The asymmetric padding is not a typo. While pinned, this section fills the viewport
      // exactly, and the fixed announcement bar + header (~7rem together) sit on top of its first
      // rows — so centring the content in the section's own box left it visually high, with the
      // top gap hidden behind the header and all the slack pooling at the bottom. Measured at
      // 1440x900 before the fix: content ended at y=730 with 170px of empty ivory below it.
      // Padding the top by the chrome's height centres the content in the space the visitor can
      // actually see. The full 7rem only from `md` up: below that the heading block wraps to two
      // rows and the cards are proportionally taller, so spending the whole 7rem there pushed the
      // row past the bottom of a 390x844 viewport. But the smaller mobile value is not zero
      // either — at `6svh` alone, measured at 390x844 with the section's top edge at the viewport
      // top (the worst case for a section that is not pinned), the header's bottom sat at 127px
      // while the eyebrow's top sat at 105px, i.e. it covered the eyebrow by 22px. Note that
      // `justify-center` returns only half of any padding added here, because shrinking the
      // padding box also shrinks the slack it is centring within.
      //
      // `h-[100svh]` ONLY while pinned, where the section's height has to equal the viewport's or
      // the pin leaves its own bottom off-screen. On the fallback path it is `min-h-`, so a short
      // or narrow viewport grows the section instead of clipping the row against
      // `overflow-hidden` — at 360x640 the fixed version was ~7px short of fitting.
      className={cn(
        'relative flex flex-col justify-center overflow-hidden bg-ivory pb-[6svh] pt-[calc(6svh+5rem)] md:pt-[calc(6svh+7rem)]',
        active ? 'h-[100svh]' : 'min-h-[100svh]',
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            {/* Eyebrow sets no colour of its own; navy-700, not orange — at 11px orange fails AA
                on ivory, and the contrast law limits orange to display text ≥24px, rules, icons
                and filled buttons with white labels. */}
            <Eyebrow className="text-navy-700">FEATURED DEVELOPMENTS</Eyebrow>
            <SplitWords
              as="h2"
              className="mt-3 font-display-expanded text-display-md text-navy-800"
              text="Where BKR is building"
            />
            <Rule className="mt-4" />
          </div>
          {/* Hidden below `sm` rather than allowed to wrap: on a 390-wide viewport it wraps to a
              second row and costs ~64px of the heading block, which is the difference between the
              eyebrow clearing the fixed header and sitting under it. Supporting context only —
              the count it states is plainly visible from the row of cards beside it. */}
          <p className="hidden max-w-xs text-caption text-navy-700 sm:block">
            {projects.length} featured developments across Hyderabad&apos;s growth corridors.
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        data-showcase-track
        className={cn(
          'mt-[5svh] flex w-full items-stretch gap-5 px-4 sm:gap-6 sm:px-6 lg:gap-8 lg:px-10',
          active ? 'overflow-visible' : 'snap-x snap-mandatory overflow-x-auto pb-3',
        )}
      >
        {projects.map((project) => (
          <article
            key={project.id}
            data-showcase-card
            data-showcase-item
            // An image well above an ivory info panel, rather than the text overlaid on the image
            // over a scrim. Changed after looking at the first render (see check-showcase-1.png in
            // the task report): `Pill` maps `upcoming` to `bg-champagne/20 text-navy-800`, which is
            // designed for a light surface — over a navy card that became dark-on-dark and was
            // genuinely hard to read, and `completed` (`bg-navy-800 text-white`) lost its chip
            // shape entirely against the same navy. Putting the metadata on ivory puts every one
            // of Pill's four statuses back on the background it was contrast-checked against,
            // instead of overriding a shared atom for this one call site.
            // `ring-1` because an ivory-warm card on an ivory section needs a hairline to read as
            // a card at all.
            className="relative flex h-[50svh] max-h-[32rem] min-h-[18rem] w-[82vw] shrink-0 snap-center flex-col overflow-hidden rounded-sm bg-ivory-warm ring-1 ring-navy-800/10 sm:w-[60vw] lg:w-[46vw] lg:max-w-[40rem]"
          >
            {/* bg-navy-800 on the well itself, so the card reads as a deliberate navy panel until
                (and if) the image resolves — `heroImage.url` points into `public/placeholder/`,
                which Task 26 populates. */}
            <div className="relative flex-1 overflow-hidden bg-navy-800">
              <ImageReveal
                src={project.heroImage.url}
                alt={project.heroImage.alt}
                sizes="(min-width: 1024px) 46vw, 82vw"
                // Overrides ImageReveal's default `data-testid="image-reveal"`, which is shared by
                // every instance and would otherwise make that selector ambiguous under
                // Playwright's strict mode once three of them share a page.
                data-testid={`showcase-image-${project.slug}`}
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {/* Deliberately NOT `relative`: the stretched link's `::after` below resolves
                `inset-0` against the nearest POSITIONED ancestor, so a `relative` here would
                shrink the card-covering hit area down to this text block. */}
            <div className="w-full p-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <Pill status={project.status} />
                <span className="text-caption text-navy-700">{project.location.area}</span>
              </div>
              <h3 className="mt-3 font-display-expanded text-2xl leading-[1.05] text-navy-800 lg:text-[1.75rem]">
                {/* One link per card, covering the card via `::after` rather than wrapping it, so
                    the accessible name is the project title instead of the whole tile's text.
                    The focus ring draws around the title — the link's own box — which keeps a
                    visible focus state on a hit area that is otherwise invisible. */}
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex min-h-11 items-end rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
                >
                  {project.title}
                </Link>
              </h3>
              {/* navy-800, not champagne: champagne on ivory is 2.20:1 and decorative-only, and
                  orange is barred below 24px. `tnum` so the figures align between cards. */}
              <p className="tnum mt-2 text-body font-semibold text-navy-800">
                {formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest)}
              </p>
            </div>
          </article>
        ))}

        {/* End panel, deliberately the last item and deliberately transparent: it both extends
            the horizontal travel enough for the pin to read as a real move (roughly 0.5 of a
            viewport width more than the cards alone would give) and absorbs the scrollbar-width
            overshoot described on `travel()` above, since it has no visible box edge to look
            clipped. Not a `[data-showcase-card]` — the first-card assertion in the spec must
            keep resolving to a project. */}
        <div
          data-showcase-outro
          data-showcase-item
          className="flex h-[50svh] max-h-[32rem] min-h-[18rem] w-[74vw] shrink-0 snap-center flex-col justify-end gap-5 pr-4 sm:w-[44vw] lg:w-[24vw] lg:max-w-[22rem] lg:pr-10"
        >
          <Rule />
          <p className="font-display-expanded text-xl leading-[1.1] text-navy-800">
            Every BKR development, in one place
          </p>
          <Button href="/projects" variant="outline" className="self-start">
            View all projects
          </Button>
        </div>
      </div>
    </section>
  )
}
