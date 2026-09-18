'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DotOrnament } from '@/components/motion/DotOrnament'
import { Button } from '@/components/ui/Button'
import type { SiteSettings } from '@/lib/data/types'
import { cn } from '@/lib/cn'

/**
 * Fixed header: wordmark + ornament hard left, nav centred, Contact button hard right.
 *
 * The reference keeps this permanently fixed with no scroll-hide and no background fill — it just
 * sits over whatever is beneath it. That works because its ink flips with the page: white over
 * the full-bleed dark photography of a hero, black over a white chapter.
 *
 * How the ink is decided: by ROUTE, not by scroll position. Pages whose first screen is full-bleed
 * photography get white ink; ordinary white pages get black. Deciding by scroll position is the
 * obvious approach and it is wrong — at scroll 0 on a light page the header would be white on
 * white and simply vanish, which is exactly the bug this pattern produces in the wild.
 *
 * The Contact button is always the dark tone. Over photography it reads as a deliberate black
 * block; over white it is the page's only solid mass, which is what anchors the layout.
 */

const NAV = [
  { href: '/projects', label: 'Projects' },
  { href: '/studio', label: 'Studio' },
  { href: '/journal', label: 'Journal' },
]

/** Routes whose first screen is full-bleed photography, so the header needs light ink. */
function isFullBleedRoute(pathname: string): boolean {
  return pathname === '/' || /^\/projects\/[^/]+\/?$/.test(pathname) || /^\/journal\/[^/]+\/?$/.test(pathname)
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const overPhoto = isFullBleedRoute(pathname)

  // The sheet closes from each link's own onClick rather than from an effect watching `pathname`.
  // Same outcome, but it does not need to observe the route to do it — and watching the route
  // would mean a setState in an effect body, which cascades a render on every navigation.

  // Lock the page while the sheet is open, and restore on unmount as well as on close — a sheet
  // that unmounts while open would otherwise leave the body permanently unscrollable.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const ink = overPhoto ? 'text-primary' : 'text-secondary'

  return (
    <>
      <header
        className={cn(
          'layout-grid pointer-events-none fixed inset-x-0 top-0 z-[80] items-center py-[1.4vw] max-sm:py-[4vw]',
          ink
        )}
      >
        <Link
          href="/"
          aria-label={`${settings.tagline ? 'BKR INFRA — Home' : 'Home'}`}
          className="pointer-events-auto col-span-4 flex items-center gap-[0.4vw] rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:col-span-3"
        >
          {/* Wordmark as type, not an SVG mark. The reference's identity is a word plus an
              ornament, and that is what survives being set in one weight at any size. */}
          <span className="text-lead font-display max-sm:text-lead-sm">BKR</span>
          <DotOrnament />
        </Link>

        {/* Centred nav. Hidden below sm, where it becomes the sheet below. */}
        <nav
          aria-label="Main"
          className="pointer-events-auto col-span-6 hidden items-center justify-center gap-[1.6vw] sm:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
              className={cn(
                'text-label transition-opacity duration-150 ease-in-out hover:opacity-60',
                'rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current',
                pathname.startsWith(item.href) && 'underline underline-offset-4'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pointer-events-auto col-span-8 flex justify-end sm:col-span-3">
          <Button href="/contact" tone="dark" className="max-sm:hidden">
            Contact
          </Button>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-none text-label-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current sm:hidden"
          >
            Menu
          </button>
        </div>
      </header>

      {menuOpen && (
        <div id="mobile-nav" className="fixed inset-0 z-[85] flex flex-col bg-secondary text-primary sm:hidden">
          <div className="layout-grid items-center py-[4vw]">
            <span className="col-span-8 text-lead-sm font-display">BKR</span>
            <div className="col-span-4 flex justify-end">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-none text-label-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                Close
              </button>
            </div>
          </div>
          <nav aria-label="Main" className="layout-grid flex-1 content-center gap-y-[6vw]">
            {[...NAV, { href: '/contact', label: 'Contact' }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="col-span-12 text-display-sm-lg font-display focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
