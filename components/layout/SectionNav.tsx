'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { OCCLUDED_TOP_PX } from '@/components/project/section-anchor'

type Section = { id: string; label: string }
type Props = { sections: Section[] }

/**
 * Where this pins: directly under the sticky header, whose height is the `--header-h` custom property
 * (94px, 88px on phones) — so the two can never drift apart.
 */
const STICKY_TOP_CLASS = 'top-[var(--header-h)]'

/**
 * Sticky secondary nav for the project detail page.
 *
 * Rendered directly after `ProjectHero` in document flow, so its static position starts a full
 * viewport height down the page — it only begins pinning below the header once the hero has mostly
 * scrolled past, which is what gives it the "appears once the hero leaves the viewport" behaviour
 * with no scroll-triggered show/hide state to manage.
 *
 * Set in the site's link vocabulary: plain labels in navy, the current one in orange with a 2px
 * orange rule under it and `aria-current`, so the state is carried by more than colour.
 *
 * `z-[70]`, below the header's `80`: the header is opaque over photography and must always win.
 *
 * Active-section tracking uses `IntersectionObserver` rather than ScrollTrigger specifically so
 * scrollspy still works when `prefers-reduced-motion` stops GSAP from ever loading — this is the
 * one piece of "motion" here that is really just state, and it has no reduced-motion fallback.
 */
export function SectionNav({ sections }: Props) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '')

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null)
    if (targets.length === 0) return

    // The active section is the one filling the most of the *usable* viewport — the band below the
    // fixed header and this bar. Two simpler rules were tried and both picked the wrong section for
    // the same underlying reason:
    //
    //   - "topmost target intersecting a `-180px 0px -55% 0px` rootMargin" — that band is under half
    //     the viewport, so a section sitting below it counted as not-in-view and the previous one
    //     stayed marked.
    //   - "last section whose top edge passed the line" — measured with `#amenities` genuinely in
    //     view, its top was at 310px and `#gallery`'s at −372px, so gallery was "last past the line"
    //     and won, despite filling 130px of the band while amenities filled 590px.
    //
    // Share-of-viewport is what actually matches what a reader would call the section they are
    // looking at, and it does not depend on where a scroll happens to land — which matters because
    // `scrollIntoViewIfNeeded()` aligns to the nearest edge, not the top.
    const pick = () => {
      const usableBottom = window.innerHeight
      // Starts at -Infinity so that once the reader has scrolled past every section (the enquiry card
      // and the other projects below the last one), the nearest section — the last — stays marked.
      let best = targets[0]
      let bestVisible = Number.NEGATIVE_INFINITY
      for (const el of targets) {
        const rect = el.getBoundingClientRect()
        const visible = Math.min(rect.bottom, usableBottom) - Math.max(rect.top, OCCLUDED_TOP_PX)
        // `>=` so that on a tie the later section wins: when two sections split the band evenly the
        // reader is scrolling downward into the second one.
        if (visible >= bestVisible) {
          bestVisible = visible
          best = el
        }
      }
      if (best.id) setActive(best.id)
    }

    // IntersectionObserver is what notices sections entering and leaving. But IO only fires when a
    // threshold is crossed, and between crossings the answer still changes, so a passive scroll
    // listener supplies the in-between precision. That is a plain listener, not a ScrollTrigger —
    // the point is that scrollspy must survive reduced motion disabling GSAP, and this does.
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
        'sticky z-[70] border-b border-hairline bg-primary/95 text-secondary backdrop-blur',
        STICKY_TOP_CLASS
      )}
    >
      {/* Not a `.layout-grid`: this is a single horizontally scrollable row, and a 12-column grid
          cannot overflow-scroll one of its own tracks. `container-page` gives it the grid's edges. */}
      <ul className="scrollbar-hide container-page flex gap-10 overflow-x-auto max-sm:gap-7">
        {sections.map((section) => {
          const isActive = active === section.id
          return (
            <li key={section.id} className="shrink-0">
              <Link
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative inline-flex min-h-12 items-center whitespace-nowrap font-heading text-small transition-colors duration-300',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  isActive ? 'text-accentInk' : 'text-secondary hover:text-accentInk'
                )}
              >
                {section.label}
                {isActive && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-accent" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
