'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type Section = { id: string; label: string }
type Props = { sections: Section[] }

// Ruling 5: 127px mirrors the same measurement PageShell.tsx's doc comment encodes —
// AnnouncementBar's `min-h-11` (44px) plus Header's row (~83px) puts the header's own
// bottom edge at 127px when the announcement bar is enabled, which it is in
// `MOCK_SETTINGS.announcementBar` today. Tailwind's JIT scanner needs the literal class
// string in this file, so — exactly like `top-11` in Header.tsx being hand-matched to
// `ANNOUNCEMENT_BAR_HEIGHT_CLASS` in AnnouncementBar.tsx — this cannot be a shared,
// computed constant: if that 127px measurement ever changes, this class must be updated
// here by hand to match.
//
// That same header-plus-nav geometry is also why every section this nav links to
// (`#overview` through `#location`) carries `scroll-mt-[180px]` in its own component:
// 127px (this bar's sticky offset) plus its own ~45px bar height lands the occluded
// band's bottom edge around 172px. Without that scroll-margin, a native anchor jump —
// or `Element.scrollIntoView()` — aligns the target's own top edge flush with the
// viewport's top edge, which lands it *underneath* the fixed header and this sticky bar
// instead of below them, hiding the section's eyebrow and heading behind opaque chrome
// even though `getBoundingClientRect()` reports it as "in the viewport". 180px reuses
// the same clearance this file's own IntersectionObserver already treats as "not yet
// really in view" via its `-180px` rootMargin below, so both concerns agree on one
// number instead of two that could drift apart.
const SECTION_NAV_TOP_CLASS = 'top-[127px]'

// 127px of fixed header plus this bar's own ~45px: the band a section's heading would be
// hidden behind. Shared by the scrollspy below and by each section's own `scroll-mt-[180px]`
// so anchor jumps and active-state tracking agree on one number.
const OCCLUDED_TOP_PX = 180

/**
 * Sticky secondary nav for the project detail page. Rendered directly after
 * `ProjectHero` in document flow, so its static position starts a full viewport height
 * down the page — it only starts pinning below the header once the hero has mostly
 * scrolled past, which is what gives it the "appears once the hero leaves the viewport"
 * behaviour the brief asks for, with no separate scroll-triggered show/hide state to
 * manage.
 *
 * Active-section tracking uses `IntersectionObserver`, not ScrollTrigger, specifically so
 * scrollspy still works when `prefers-reduced-motion` disables every GSAP-driven effect
 * on the page — this is the one piece of "motion" here that is really just state, not an
 * animation, and has no reduced-motion equivalent to fall back to.
 */
export function SectionNav({ sections }: Props) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    // The active section is the one filling the most of the *usable* viewport — the band
    // below the fixed header and this sticky bar. Two simpler rules were tried and both
    // picked the wrong section for the same underlying reason:
    //
    //   - "topmost target intersecting `rootMargin: '-180px 0px -55% 0px'`" — that band is
    //     only 45% of the viewport minus 180px, so a section sitting below it counted as
    //     not-in-view and the previous one stayed marked.
    //   - "last section whose top edge passed the line" — measured with `#amenities`
    //     genuinely in view, its top was at 310px and `#gallery`'s at −372px, so gallery
    //     was "last past the line" and won, despite filling only 130px of the band while
    //     amenities filled 590px.
    //
    // Share-of-viewport is what actually matches what a reader would call the section
    // they are looking at, and it does not depend on where a scroll happens to land — which
    // matters because `scrollIntoViewIfNeeded()` aligns to the nearest edge, not the top.
    const pick = () => {
      const usableBottom = window.innerHeight
      let best = targets[0]
      let bestVisible = -1
      for (const el of targets) {
        const rect = el.getBoundingClientRect()
        const visible = Math.min(rect.bottom, usableBottom) - Math.max(rect.top, OCCLUDED_TOP_PX)
        // `>=` so that on a tie the later section wins: when two sections split the band
        // evenly the reader is scrolling downward into the second one.
        if (visible >= bestVisible) {
          bestVisible = visible
          best = el
        }
      }
      if (best.id) setActive(best.id)
    }

    // IntersectionObserver stays the mechanism the brief asks for, and it is what notices
    // sections entering and leaving. But IO only fires when a threshold is crossed, and
    // between crossings the "last section whose top has passed the line" still changes, so
    // a passive scroll listener supplies the in-between precision. That is a plain
    // listener, not a ScrollTrigger — the point of the brief's constraint was that
    // scrollspy must survive `prefers-reduced-motion` disabling GSAP, and this does.
    const observer = new IntersectionObserver(pick, { rootMargin: `-${OCCLUDED_TOP_PX}px 0px 0px 0px`, threshold: 0 })
    targets.forEach((el) => observer.observe(el))
    window.addEventListener('scroll', pick, { passive: true })
    pick()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', pick)
    }
  }, [sections])

  return (
    <nav
      data-section-nav
      aria-label="Section"
      className={cn(
        'sticky z-40 border-b border-navy-800/10 bg-ivory/95 backdrop-blur',
        SECTION_NAV_TOP_CLASS,
      )}
    >
      <ul className="scrollbar-hide mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 sm:px-6 lg:px-10">
        {sections.map((section) => {
          const isActive = active === section.id
          return (
            <li key={section.id} className="shrink-0">
              <Link
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative inline-flex min-h-11 items-center whitespace-nowrap py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
                  isActive ? 'text-navy-800' : 'text-navy-700/70 hover:text-navy-800',
                )}
              >
                {section.label}
                {isActive && <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-[3px] bg-orange" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
