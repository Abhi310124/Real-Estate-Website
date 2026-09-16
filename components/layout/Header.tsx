'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { MegaMenu } from './MegaMenu'
import type { SiteSettings } from '@/lib/data/types'
import { cn } from '@/lib/cn'

type Props = { settings: SiteSettings }

const SCROLL_THRESHOLD = 80
const MENU_ID = 'main-menu'

export function Header({ settings }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
          scrolled ? 'bg-navy-800/95 backdrop-blur' : 'bg-transparent'
        )}
      >
        <div
          className={cn(
            // py-2.5 as well as min-h-16: the logo lockup is vertical (mark over INFRA, as in
            // the reference artwork) and stands ~55px tall, which min-h-16 alone left no room
            // for — the mark clipped against the top edge. The row now grows to fit it.
            'mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6',
            scrolled ? 'text-ivory' : 'text-navy-800'
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
            {/* Header only ever sees the two states it manages itself (transparent-over-hero
                vs scrolled-opaque); a page with a light hero at scroll 0 needs a
                page-level override this component does not yet take a prop for — flagged in
                batch-b-report.md rather than guessed at here. */}
            {/* Width, not height — see the note in Logo.tsx. A height budget here crushed the
                monogram to 8px via flex-shrink. */}
            <Logo variant={scrolled ? 'light' : 'dark'} className="w-32" />
          </Link>

          <Button href="/contact" variant="solid" className="hidden sm:inline-flex">
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
