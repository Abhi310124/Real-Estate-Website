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
const SECTION_NAV_TOP_CLASS = 'top-[127px]'

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

    // IntersectionObserver callbacks only report entries whose ratio changed since the
    // last call, not the full current state of every observed target — so "which section
    // is topmost and currently in view" has to be read from an accumulated map of the
    // latest entry per target, not from a single callback's entries alone.
    const latest = new Map<Element, IntersectionObserverEntry>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) latest.set(entry.target, entry)
        const visible = Array.from(latest.values()).filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top <= b.boundingClientRect.top ? a : b))
        const id = (topmost.target as HTMLElement).id
        if (id) setActive(id)
      },
      // Top offset clears both the fixed header and this sticky nav's own bar so a
      // section only counts as "in view" once it is actually below both; bottom offset
      // favours whichever section occupies the upper half of the remaining viewport.
      { rootMargin: '-180px 0px -55% 0px', threshold: 0 },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
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
