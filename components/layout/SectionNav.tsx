'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'
import { OCCLUDED_TOP_PX } from '@/components/project/section-anchor'

type Section = { id: string; label: string }
type Props = { sections: Section[] }

/**
 * Where this pins. The monochrome header is `fixed … py-[1.4vw]` with a `py-[0.65vw]` +
 * `text-label` button as its tallest child, so its bottom edge sits at `2.8vw + 2.4vw = 5.2vw`;
 * `5.4vw` clears that at every width, because both numbers scale together. Below `sm` the header
 * switches to `py-[4vw]` around a `min-h-11` Menu button, which is `8vw + 44px` — a mix of units
 * that no single `vw` value tracks (it is 19.3vw at 390 and 14.9vw at 639), so that breakpoint
 * states the sum literally.
 *
 * Tailwind's scanner needs both as literal text, which is why they are inline here rather than
 * derived from the header's own classes — if the header's padding changes, this must be changed by
 * hand to match. The same hand-matching caveat applies to `SECTION_SCROLL_MT`, but that one is
 * shared, because eight sections have to agree with it.
 */
const STICKY_TOP_CLASS = 'top-[calc(8vw+44px)] sm:top-[5.4vw]'

/**
 * Sticky secondary nav for the project detail page.
 *
 * Rendered directly after `ProjectHero` in document flow, so its static position starts a full
 * viewport height down the page — it only begins pinning below the header once the hero has mostly
 * scrolled past, which is what gives it the "appears once the hero leaves the viewport" behaviour
 * with no scroll-triggered show/hide state to manage.
 *
 * Restyled to the monochrome system: mono labels at -10% tracking, `muted` when inactive and
 * `secondary` when active, and the active item carries a hairline underline. There is no tinted
 * state, no pill, no fill — with no accent colour in the palette, the active item is distinguished
 * by ink weight and a rule, which is how the rest of the site marks a current item (the header's
 * nav does the same thing with `underline-offset-4`).
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
      let best = targets[0]
      let bestVisible = -1
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
          cannot overflow-scroll one of its own tracks. It takes the grid's page margin as its own
          inline padding instead, so its first and last labels still sit on the same optical edges as
          every section below. */}
      <ul className="scrollbar-hide flex gap-[2vw] overflow-x-auto px-[var(--margin)] max-sm:gap-[6vw]">
        {sections.map((section) => {
          const isActive = active === section.id
          return (
            <li key={section.id} className="shrink-0">
              <Link
                href={`#${section.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative inline-flex min-h-11 items-center whitespace-nowrap font-mono text-mono uppercase',
                  'transition-colors duration-150 ease-in-out',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
                  'max-sm:text-mono-sm',
                  isActive ? 'text-secondary' : 'text-muted hover:text-secondary'
                )}
              >
                {section.label}
                {/* The hairline. Same height as `Rule`/`RuleDraw` (`max(0.1vw, 1px)`) so it reads as
                    the same mark the rest of the page separates blocks with, rather than as a tab
                    indicator. Static, not drawn: it moves between items on every scroll, and a
                    300ms draw on each move would be a flicker. */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-[0.6vw] bg-current max-sm:bottom-[2vw]"
                    style={{ height: 'max(0.1vw, 1px)' }}
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
