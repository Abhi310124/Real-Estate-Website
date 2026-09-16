'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { MegaMenu } from './MegaMenu'
import type { SiteSettings } from '@/lib/data/types'
import { cn } from '@/lib/cn'

type Props = { settings: SiteSettings }

const SCROLL_THRESHOLD = 80
const MENU_ID = 'main-menu'

// Routes whose first screen is a full-bleed dark hero the header can sit transparently over.
// Everywhere else the header paints its own navy background from scroll 0, so its contents
// always have a dark backdrop and can always use the light ink.
//
// This replaces a `scrolled ? 'light' : 'dark'` logo variant that was a real bug once Task 10
// landed a dark hero: at scroll 0 the header rendered the navy monogram against navy
// photography and the mark was invisible above the fold on the home page. Deciding by route
// rather than by scroll position is what makes the ink correct in both states, and it needs no
// per-page prop threaded through `app/layout.tsx`, which cannot know which page it is rendering.
//
// Task 14 (Ruling 2): a plain `.includes(pathname)` array cannot express "every project detail
// page, but not the listing page itself" — `/projects/<slug>` gets the transparent header
// (ProjectHero is full-bleed, same construction as the home hero) but `/projects` does not
// (the listing page renders FilterBar/ProjectGrid on plain ivory via PageShell; a transparent
// header there would leave the header's light-ink logo with no dark backdrop to read against —
// the exact bug class this function exists to prevent, one route earlier). The regex demands at
// least one non-slash character after `/projects/`, so it matches exactly one path segment deep
// — every `/projects/<slug>` — and never the bare listing route, with or without a trailing
// slash.
function isFullBleedHeroRoute(pathname: string): boolean {
  return pathname === '/' || /^\/projects\/[^/]+\/?$/.test(pathname)
}

export function Header({ settings }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const transparent = isFullBleedHeroRoute(pathname) && !scrolled

  // Ruling 10: the scrolled/not-scrolled flip is a plain useState driven by a passive
  // `scroll` listener — never a ScrollTrigger. This is a binary UI state change with no
  // scroll-linked position to scrub, and unlike a ScrollTrigger instance it keeps working
  // even if the GSAP chunk never loads (see getGsap()'s .catch() pattern used elsewhere for
  // everything that *does* need GSAP).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // `top-11` below must match AnnouncementBar's own `min-h-11` (both are Tailwind's 2.75rem
  // step) or the two fixed strips gap or overlap. Not shared as a single constant: Tailwind's
  // JIT scanner needs each class spelled out literally in its own file, so this is a
  // by-hand-kept-in-sync pairing, not a DRY one — see the comment on
  // ANNOUNCEMENT_BAR_HEIGHT_CLASS in AnnouncementBar.tsx.
  const hasAnnouncement = settings.announcementBar.enabled

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 z-[80] transition-colors duration-300',
          hasAnnouncement ? 'top-11' : 'top-0',
          transparent ? 'bg-transparent' : 'bg-navy-800/95 backdrop-blur'
        )}
      >
        <div
          className={cn(
            // py-2.5 as well as min-h-16: the logo lockup is vertical (mark over INFRA, as in
            // the reference artwork) and stands ~55px tall, which min-h-16 alone left no room
            // for — the mark clipped against the top edge. The row now grows to fit it.
            // Always ivory ink: both header states sit on a dark backdrop by construction —
            // either a full-bleed dark hero or the header's own navy fill.
            //
            // A three-column grid rather than `flex justify-between`: the "Enquire Now" button
            // is `hidden sm:inline-flex`, so below the sm breakpoint the row had only two
            // children and `justify-between` pushed the logo to the right edge instead of
            // leaving it centred. Fixed 1fr side columns keep it centred whether or not the
            // CTA renders. Verified at 390x844 and 1440x900.
            'mx-auto grid min-h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5 text-ivory sm:px-6'
          )}
        >
          <button
            ref={triggerRef}
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            aria-haspopup="true"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            <span className="sr-only">Menu</span>
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
              <path d="M0 1H22" stroke="currentColor" strokeWidth="2" />
              <path d="M0 8H22" stroke="currentColor" strokeWidth="2" />
              <path d="M0 15H22" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <Link
            href="/"
            aria-label="BKR INFRA — Home"
            className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            {/* Always the light variant — see FULL_BLEED_HERO_ROUTES above for why both header
                states are guaranteed to sit on dark. Width, not height: a height budget here
                let flex-shrink crush the monogram to 8px (see the note in Logo.tsx). */}
            <Logo variant="light" className="w-32" />
          </Link>

          {/* justify-self-end: grid items align to the start of their column by default, so
              without this the CTA would sit next to the centred logo rather than at the edge. */}
          <Button href="/contact" variant="solid" className="hidden justify-self-end sm:inline-flex">
            Enquire Now
          </Button>
        </div>
      </header>

      <MegaMenu
        id={MENU_ID}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        triggerRef={triggerRef}
        settings={settings}
      />
    </>
  )
}
