'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { LogoMark } from '@/components/brand/LogoMark'
import { DotOrnament } from '@/components/motion/DotOrnament'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import type { SiteSettings } from '@/lib/data/types'

/**
 * Black footer: a 2×2 block of link groups in the left six columns, a photograph filling the right
 * six, and a white slab under the whole thing that the page scrolls up and off.
 *
 * ## The grid is two halves, not four columns
 *
 * Two `col-span-6` children. The four link groups live INSIDE the left one as two stacked
 * `grid-cols-6` rows 57.6px apart — [Site index | Legal] over [Get in touch | the wordmark] — and
 * that is what reserves columns 7–12 for the image. Four `col-span-3` siblings across all twelve
 * columns is the obvious arrangement and it consumes the half of this footer that actually carries
 * it: a 710 × 443.77px photograph with a rotated note card pinned to its top-left corner.
 *
 * ## Type hierarchy
 *
 * Group heads are 31.68px (`text-lead`) in solid white over 15.84px links — an exact 2.00× ratio.
 * At 15.84px and 50% white the ratio is 1.00×, a heading is indistinguishable from the links beneath
 * it, and the footer reads as four undifferentiated lists rather than four titled blocks. No
 * `font-display` on them: the 31.68px step is weight 400 everywhere on this site, and a 500 there
 * reads as a heading emboldened rather than one sized. The heads are `display: inline` so their box
 * hugs the word instead of spanning the cell, with the 14.4px gap to the list carried by a block
 * wrapper — margins do not apply to an inline box.
 *
 * Every `li` carries `text-label` as well as its link, so its box is 17.28px and hugs the label.
 * A bare `li` inherits the body's 16px/24px instead, which grows the row pitch from 24.45px to
 * 32.6px — a third too loose over ten rows, from a rule nobody wrote.
 *
 * ## Wrapping runs must leave the lh-1.0 steps
 *
 * `label` is line-height 1.0 because no 15.84px run on the reference ever wraps; its widest is a
 * 37-character address on one line. Ours is 69 characters and the RERA disclaimer is 322, so both
 * wrap, and 15.84px text on 15.84px leading over three lines leaves literally zero space between
 * one line's descenders and the next line's ascenders. Both use `label-flow` (same size, 1.4
 * leading) and the legal line is capped at five columns rather than running the full grid width.
 *
 * ## The note card
 *
 * Rotated 4° about its own top-left corner and pinned to the photograph's, it is the only white
 * surface in the footer. The stamped mono trio (`ST / BKR`, `THANK YOU`, the copyright) belongs
 * inside it at 11.52px in ink across 207px — not as a full-width 15.84px band over a hairline,
 * which is what this replaces. On paper that trio reads as a printer's mark; spread across 1400px of
 * black it reads as a copyright bar, which is a different and much more ordinary thing.
 *
 * Below `sm` the card is `hidden`. Its type is sized at 1vw and 0.8vw, which resolve to 3.9px and
 * 3.1px at 390px — the reference hides it at that width rather than rescaling it, and those two
 * sizes are the only sub-16px type anywhere on the page for exactly that reason. That is also why
 * the three small steps inside it carry no `max-sm:` pair: the element does not exist at that width,
 * so a mobile floor for it would be dead CSS rather than a safeguard.
 *
 * ## The closing slab
 *
 * `h-[20vw] sticky bottom-0 bg-primary`, 288px, pinned at the viewport bottom under the footer
 * content (`z-0` against the grid's `z-10`) and uncovered only as the document ends. It is not an
 * empty white band: inside `overflow-y-clip` one child is scrubbed `translateY 288 → 0` over the
 * last 875px of scroll — 0.329px per px — landing at 0 exactly at maxScroll, so the page resolves
 * on a graphic rather than simply stopping on a white rectangle.
 *
 * The graphic is an eight-blade shard on a near-edge-on 3D plane plus a soft gradient where the
 * black footer meets the white. Solid `bg-secondary` blades rather than `<ImageRing3D>`: the
 * reference's blades are plain black blocks, and the ring renders eight `<Link>`-wrapped
 * photographs, which inside an `aria-hidden` decorative slab is an axe violation and outside one is
 * eight half-clipped duplicate links in the tab order.
 *
 * `perspective()` is a transform FUNCTION here, not the property, which is why the plane survives
 * having a scrubbed `transform` on its parent and a clipped ancestor: the projection is self
 * contained, and the blades are coplanar with the plane so they want the default `flat` — no
 * `preserve-3d` anywhere, and nothing above can break it.
 *
 * ## Why this file is a client component
 *
 * Only the slab scrub needs an effect, and the house rule is to push the boundary down into a small
 * child rather than make a whole section client. That child would be a new file, which this pass
 * cannot add; until it exists the directive sits here. Nothing else in the footer is interactive —
 * the link gesture and every hover is pure CSS.
 *
 * Contact details render conditionally: `settings.email` is optional and currently unset, because a
 * `mailto:` to a mailbox that does not exist swallows an enquiry while appearing to work. Same for
 * `socials`, which is `[]`. Both appear automatically once real values are supplied.
 */

const SITE_INDEX = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/studio', label: 'Studio' },
  { href: '/journal', label: 'Journal' },
]

const LEGAL = [
  { href: '/legal/privacy', label: 'Privacy policy' },
  { href: '/legal/terms', label: 'Terms of use' },
  { href: '/legal/cookies', label: 'Cookie policy' },
]

/** Six ruled lines at `h-[14%]` each, so the stack fills 84% of the card's middle and stops short. */
const RULES = [0, 1, 2, 3, 4, 5]

/**
 * The closing shard's eight blades, at 45° increments — the same eightfold symmetry as the ornament
 * and the image ring.
 *
 * Each blade is a `w-[4.5vw]` strut `h-[15vw]` long, rotating about its own bottom edge (the shard's
 * hub) with a `h-[3.8vw]` block at the far end. Those three numbers are the image ring's measured
 * proportions — radius 38.5% of the stage, item 11.5% × 9.7% — applied to a 39vw stage, because the
 * reference sizes each blade with an inline style and only the projected quads survive in a DOM
 * capture. They are the right proportions: at this plane's foreshortening the eight blocks project
 * to between 32 × 27 and 130 × 109px, against the 46 × 31 to 134 × 120px actually measured.
 */
const BLADES = [0, 45, 90, 135, 180, 225, 270, 315]

/** The shard's plane. `perspective(36vw)` = 518.4px at 1440, which the measured matrix3d pins exactly. */
const SHARD_PLANE = 'perspective(36vw) rotate3d(0.29, -1.01, 1.32, 91deg)'

/**
 * Scroll distance the slab's payload travels over, in px. 288 / 875 = 0.329px per px, and the range
 * ends at the document bottom, so the graphic arrives at rest on the last frame of the page.
 */
const SLAB_TRAVEL_PX = 875

/**
 * The closing photograph. Declared here rather than in `lib/content/home.ts` because the footer is
 * on every route, not just the home page. A wide exterior: the frame is 16/10, and the composition
 * has to survive being cropped to 1.2× and drifted inside it.
 *
 * It is also the hero's second slide. Every whole-building frame in the curated placeholder set is
 * already spoken for on the home page (see `components/project/photo.ts` for why the other seven are
 * not usable), and a slide the visitor sees for ten seconds 13,000px earlier is the least conspicuous
 * repeat available. Replaced along with the rest of the placeholder photography before launch.
 */
const FOOTER_PHOTO = {
  src: '/photography/exterior-07.jpg',
  alt: 'Two-storey timber house behind a pool at the end of the garden',
}

/**
 * The reference's link gesture, on every link in the footer and identical to the header's: the label
 * lifts 3.6px over 200ms while a hairline draws in from the left over 300ms, and retracts rightward
 * on release. `.in-out-line` owns the rule, including the origin flip that stops the exit from being
 * the entrance rewound, and the `focus-visible` arm that gives a keyboard the same signal.
 *
 * The lift is deliberately hover-only. It carries no information a focus ring does not already
 * carry, and the reference does not lift on focus either.
 */
function FooterLink({
  href,
  children,
  newTab,
  label,
}: {
  href: string
  children: React.ReactNode
  /** Leaves the site, so it opens in a new tab — pass `label` so that is announced. */
  newTab?: boolean
  label?: string
}) {
  const body = (
    <span className="group block cursor-pointer">
      <span className="block transition-transform duration-200 ease-out group-hover:-translate-y-[0.25vw] motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        {children}
      </span>
      <span aria-hidden="true" className="in-out-line block" />
    </span>
  )

  const shape =
    'block w-fit rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={shape}>
        {body}
      </Link>
    )
  }

  return (
    <a
      href={href}
      aria-label={label}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className={shape}
    >
      {body}
    </a>
  )
}

/** One quadrant of the 2×2 block: a 31.68px head, 14.4px of air, then the 15.84px list. */
function FooterColumn({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="col-span-6 sm:col-span-3">
      <div className="mb-[1vw] max-sm:mb-[3vw]">
        <h2 className="inline text-lead max-sm:text-lead-sm">{heading}</h2>
      </div>
      <ul className="space-y-[0.5vw] max-sm:space-y-[2vw]">{children}</ul>
    </div>
  )
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()
  const footer = useRef<HTMLElement>(null)
  const closing = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = closing.current
    const trigger = footer.current
    if (!el || !trigger) return

    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return

        // `fromTo`, and the 100% offset lives here rather than in a class, so the resting state is
        // the graphic AT REST and visible. The payload can only be pushed out of frame once GSAP is
        // proven to be running — a failed chunk or a hydration failure therefore leaves the slab
        // showing its graphic instead of hiding it forever behind a clip.
        const tween = gsap.fromTo(
          el,
          { yPercent: 100 },
          {
            yPercent: 0,
            // Linear: the measured curve is straight at 0.329px per px across its whole range.
            ease: 'none',
            scrollTrigger: {
              // The footer, not the slab: the slab is `sticky`, so its own box stops tracking the
              // document partway through exactly the range being measured against.
              trigger,
              // `bottom+=875`, not `bottom-=875`. The offset applies to the SCROLLER side of the
              // pair, and a negative offset there moves the reference line UP the viewport, which
              // the footer's bottom edge reaches only after scrolling FURTHER — so `-=` put the
              // start 875px past the end. With a maximum scroll of 14047 the start resolved to
              // 14922, which is unreachable, so progress sat at 0 for the whole document and the
              // payload stayed parked a full slab-height below the clip: a blank white band at the
              // bottom of every page. `+=` moves the line down past the viewport bottom, which the
              // footer reaches 875px EARLIER, giving the measured range that lands at 0 exactly at
              // the document's end.
              start: `bottom bottom+=${SLAB_TRAVEL_PX}`,
              end: 'bottom bottom',
              scrub: true,
              invalidateOnRefresh: true,
              onToggle: (self) => gsap.set(el, { willChange: self.isActive ? 'transform' : 'auto' }),
            },
          }
        )

        kill = () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(el, { clearProps: 'transform,willChange' })
          ScrollTrigger.refresh()
        }
      })
      .catch((err) => {
        console.error('[SiteFooter] closing reveal unavailable; the slab renders uncovered', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  // Google's documented Maps URL contract rather than the older `/maps/place/<text>` path: same
  // gesture, stable interface, and it is built from the one address the data layer holds — nothing
  // about the location is authored here.
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`

  return (
    <footer ref={footer} className="relative bg-secondary pt-[10vw] text-primary max-sm:pt-[16vw]">
      <div className="layout-grid relative z-10 bg-secondary pb-[4vw] max-sm:pb-[10vw]">
        {/* Left half: the 2×2 block. 57.6px between the two rows. */}
        <div className="col-span-12 space-y-[4vw] sm:col-span-6 max-sm:mb-[10vw] max-sm:space-y-[10vw]">
          <div className="grid grid-cols-6 gap-[var(--gutter)] max-sm:gap-y-[10vw]">
            <FooterColumn heading="Site index">
              {SITE_INDEX.map((item) => (
                <li key={item.href} className="w-fit text-label max-sm:text-label-sm">
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn heading="Legal">
              {LEGAL.map((item) => (
                <li key={item.href} className="w-fit text-label max-sm:text-label-sm">
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>
          </div>

          <div className="grid grid-cols-6 gap-[var(--gutter)] max-sm:gap-y-[10vw]">
            <FooterColumn heading="Get in touch">
              {settings.email && (
                <li className="w-fit text-label max-sm:text-label-sm">
                  <FooterLink href={`mailto:${settings.email}`}>{settings.email}</FooterLink>
                </li>
              )}
              {settings.phones.map((phone) => (
                <li key={phone} className="w-fit text-label max-sm:text-label-sm">
                  <FooterLink href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</FooterLink>
                </li>
              ))}
              {/* The address is a link, not a caption. It is the one line in the footer a visitor
                  wants to act on rather than read, and on the reference it goes to a map. */}
              <li className="w-fit text-label-flow max-sm:text-label-flow-sm">
                <FooterLink href={mapsHref} newTab label={`${settings.address} — open in Google Maps`}>
                  {settings.address}
                </FooterLink>
              </li>
              {/* Socials have no reference counterpart and are `[]` today. They ride in this list
                  rather than in a row of their own so they inherit its pitch when they arrive. */}
              {settings.socials.map((social) => (
                <li key={social.platform} className="w-fit text-label max-sm:text-label-sm">
                  <FooterLink href={social.url} newTab label={`BKR INFRA on ${social.platform}`}>
                    {social.platform}
                  </FooterLink>
                </li>
              ))}
            </FooterColumn>

            {/* The wordmark owns a quadrant of its own at 31.68px, rather than being tacked onto a
                column at label size. Same element, twice the size, and it is what closes the block. */}
            <div className="col-span-6 sm:col-span-3">
              <Link
                href="/"
                aria-label="BKR INFRA — Home"
                className="flex w-fit items-center rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                {/* The real mark rather than the letters set as type, matching the header. Its
                    letterforms are `currentColor` and this footer is navy, so they render cream while
                    the orange wedge stays orange — the same one component doing both grounds.

                    Wider here than in the header (11.5vw against 8.2vw): this quadrant is the closing
                    beat of the page and the mark is the thing closing it, where in the header it has
                    to share a 41.27px band with the nav and the CTA. */}
                <LogoMark className="h-auto w-[11.5vw] shrink-0 max-sm:w-[34vw]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right half: the photograph, bleeding off the page edge, with the note card on its corner.
            The negative margin cancels the grid's own inline padding, so `--margin` is the variable
            that has to be undone here — it and `--gutter` are equal at desktop and deliberately are
            not below `sm`. */}
        <div className="col-span-12 -mr-[var(--margin)] sm:col-span-6 max-sm:-ml-[var(--margin)]">
          <div className="relative aspect-[16/10] w-full">
            {/* `z-20` puts the card over the photograph's frame and over its uncovering scrim. */}
            <div className="absolute left-0 top-0 z-20 hidden h-fit w-fit sm:block">
              <div className="h-[19vw] w-[18vw] origin-top-left rotate-[4deg]">
                <div className="relative flex h-full w-full flex-col justify-between bg-primary px-[10%] pb-[8%] pt-[10%] text-label-md text-muted">
                  <div className="mb-[10%] flex items-center justify-between">
                    {/* 1.2 leading, not the token's 1.0: this is the one mono label on the card that
                        wraps, and at 1.0 its two lines touch. */}
                    <p className="w-[45%] font-mono text-mono-note uppercase leading-[1.2]">
                      A note from BKR
                    </p>
                    {/* The one place on the site where 14.4px is set at weight 500 — the reference's
                        single small exception, and it is this wordmark. */}
                    <div className="flex items-center gap-[0.5vw]">
                      <span className="text-label-md font-display">BKR</span>
                      <DotOrnament size="md" />
                    </div>
                  </div>

                  <div aria-hidden="true" className="h-full w-full">
                    {RULES.map((rule) => (
                      <div key={rule} className="h-[14%] w-full border-b border-muted" />
                    ))}
                  </div>

                  <div className="flex w-full justify-between font-mono text-mono-xs uppercase">
                    <span>ST / BKR</span>
                    <span>Thank you</span>
                    {/* Server and client can straddle a year boundary across time zones. */}
                    <span suppressHydrationWarning>© {year} BKR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* `saturate-[1.12]` grades the photograph. It sits on the frame because ImageReveal
                exposes no class for its `<Image>`; the filter covers the subtree, and the only other
                thing in the frame is the uncovering scrim, which is pure black and unmoved by a
                saturation multiplier. `sizes` is 1.2× the frame's 49.3vw, since that is what the
                bleeding image actually renders at. */}
            <ImageReveal
              src={FOOTER_PHOTO.src}
              alt={FOOTER_PHOTO.alt}
              sizes="(min-width: 640px) 59vw, 120vw"
              className="h-full w-full saturate-[1.12]"
            />
          </div>
        </div>

        {/* Ours, not the reference's — it has no statutory disclaimer to print. Five columns caps the
            measure near 39.7vw instead of the 94.2vw a full-width row gives, which is 181 characters
            a line and 5.4× wider than the widest 15.84px run on the reference. It is also the reason
            this grid carries a bottom pad at all: on the reference the photograph's bottom edge runs
            straight into the white slab, and here there is a legal row under it that cannot sit flush
            against white.

            text-primary/60, not /40: white at 40% over black composites to an effective #666, which
            is under 4.5:1 and fails AA for text — axe flagged it on all five routes. /60 gives #999
            at ~7.4:1. */}
        <p className="col-span-12 mt-[4vw] text-label-flow text-primary/60 sm:col-span-5 max-sm:mt-[10vw] max-sm:text-label-flow-sm">
          {settings.reraDisclaimer}
        </p>
      </div>

      {/* The closing slab. Sticky and behind the footer content, so it is only uncovered at the very
          bottom of the document. `overflow-y-clip` rather than `overflow-hidden`: `clip` does not
          create a scrollport, which is what lets the payload start a full slab-height out of frame
          without the slab itself becoming scrollable. */}
      <div
        aria-hidden="true"
        className="sticky bottom-0 z-0 h-[20vw] w-full overflow-y-clip bg-primary max-sm:h-[30vw]"
      >
        <div ref={closing} data-closing-payload className="relative h-full w-full">
          {/* The seam: 20% black fading out over the slab's top quarter, lifted 15% of its own
              height so the darkest edge sits under the footer rather than below it. */}
          <div className="relative z-10 h-[25%] w-full -translate-y-[15%] bg-gradient-to-b from-secondary/20 to-transparent" />

          <div className="absolute bottom-0 left-0 z-0 h-[39vw] w-[39vw]">
            <div className="h-full w-full -translate-x-1/4 translate-y-1/3">
              <div className="relative h-full w-full" style={{ transform: SHARD_PLANE }}>
                {BLADES.map((deg) => (
                  <div
                    key={deg}
                    className="absolute left-1/2 top-0 -ml-[2.25vw] h-[15vw] w-[4.5vw] origin-bottom"
                    // Inline, so it replaces the composed transform rather than joining it — which
                    // is why the strut is centred with a negative margin and not a translate.
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div className="h-[3.8vw] w-full bg-secondary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
