'use client'
import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { LogoMark } from '@/components/brand/LogoMark'
import { useRoutePath } from '@/components/layout/useRoutePath'
import { scrollToElement } from '@/components/motion/LenisProvider'
import { RingButton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { groupPhone, telHref } from '@/lib/format'
import type { SiteSettings } from '@/lib/data/types'

/**
 * The header: sticky, on a solid cream ground, always visible — the construction the layout this site
 * follows uses, measured at 94px tall at 1440 (88px on a phone).
 *
 *   logo ·························· Home  About  Projects  Blog   6301 999 971   [ Enquire Now ]
 *
 * A solid ground is a deliberate change from the transparent band this replaced, and a measured one:
 * floating over full-bleed photography, the old header's logo and links fell below 3:1 against what
 * was behind them at almost every scroll position, because a photograph can be near-black and
 * near-white inside the same 140px. No single ink survives that. A ground does.
 *
 * - The current page is marked in orange (`accentInk` — orange TEXT on cream needs the darker orange
 *   to clear AA at 16px) and with `aria-current`, so the state is not carried by colour alone.
 * - The phone number is set as the layout sets it, grouped for reading ("6301 999 971") and dialled
 *   in full — the grouping is for the eye, the `tel:` href is for the phone.
 * - "Enquire Now" is a gradient-ring button. Every page ends in an enquiry block (`#enquire`), so on
 *   a page that has one it glides there; anywhere else — and with no JS — it is a plain link to
 *   /contact, which is the same form on its own page.
 *
 * Below 1024px the links collapse into a drop-down panel behind a menu button that fills in navy while
 * the panel is open, its three bars folding into a cross over 600ms on an in-out quint — the layout's
 * own menu gesture.
 */

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** "+91 6301999971" → "6301 999 971": the layout's grouping, without the country code, in the bar. */
function displayPhone(raw: string): string {
  return groupPhone(raw, false)
}

/**
 * Glide to the page's own enquiry block when there is one; otherwise let the link go to /contact.
 * No offset here: the block's own `scroll-margin-top` clears this sticky bar, and Lenis honours it.
 */
function onEnquire(event: React.MouseEvent<HTMLAnchorElement>, after?: () => void) {
  const target = document.getElementById('enquire')
  if (!target) return
  event.preventDefault()
  after?.()
  scrollToElement(target)
}

function NavLinks({ pathname, className, onNavigate }: { pathname: string; className?: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => {
        const current = isCurrent(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? 'page' : undefined}
            onClick={onNavigate}
            className={cn(
              'font-heading transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
              current ? 'text-accentInk' : 'text-secondary hover:text-accentInk',
              className
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </>
  )
}

function MenuButton({ open, onToggle, controls }: { open: boolean; onToggle: () => void; controls: string }) {
  // Closed, a plain navy icon on the cream bar; open, a filled navy square with cream bars — the
  // layout's menu button, which only takes its fill while its panel is showing.
  const bar = cn(
    'absolute left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full transition-[top,transform,width,opacity,background-color] duration-[600ms] ease-[cubic-bezier(0.86,0,0.07,1)] motion-reduce:transition-none',
    open ? 'bg-primary' : 'bg-secondary'
  )
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onToggle}
      className={cn(
        'relative h-14 w-14 shrink-0 rounded-card transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary lg:hidden',
        open ? 'bg-secondary' : 'bg-transparent'
      )}
    >
      <span aria-hidden="true" className={cn(bar, open ? 'top-1/2 rotate-45' : 'top-[20px]')} />
      <span aria-hidden="true" className={cn(bar, 'top-1/2', open ? 'w-0 opacity-0' : '')} />
      <span aria-hidden="true" className={cn(bar, open ? 'top-1/2 -rotate-45' : 'top-[34px]')} />
    </button>
  )
}

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const pathname = useRoutePath()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const phone = settings.phones[0]

  // Close the panel when the route changes. Keyed on the pathname value itself, so it runs on
  // navigation rather than on every render.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  // Escape closes the open panel — a disclosure that only a pointer can dismiss is a trap for a
  // keyboard user who opened it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-[80] w-full bg-primary">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="BKR INFRA — home"
          className="shrink-0 text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
        >
          {/* Width, never height: a height budget lets a flex parent squeeze the mark. */}
          <LogoMark className="w-[138px] max-sm:w-[112px]" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-10 text-nav lg:flex">
          <NavLinks pathname={pathname} />
          {phone && (
            <a
              href={telHref(phone)}
              className="font-heading text-secondary transition-colors duration-300 hover:text-accentInk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
            >
              {displayPhone(phone)}
            </a>
          )}
          <RingButton href="/contact" scrollTarget="enquire" onClick={(e) => onEnquire(e)} className="min-w-[156px]">
            Enquire Now
          </RingButton>
        </nav>

        <MenuButton open={open} onToggle={() => setOpen((v) => !v)} controls={panelId} />
      </div>

      {/* The drop-down panel. Rendered always and hidden with `hidden`, not mounted on demand, so the
          button's `aria-controls` always points at an element that exists. Links are set at 24px:
          that is the reference's size here, and it is also what lets the current page's orange clear
          contrast on the tinted panel — `accentInk` on tint is 4.16:1, enough for large text only. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-t border-hairline bg-tint shadow-[0_24px_48px_-24px_rgba(10,26,47,0.35)] lg:hidden"
      >
        <nav aria-label="Main" className="container-page flex flex-col py-8">
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} className="py-4 text-h4" />
          {phone && (
            <a href={telHref(phone)} className="py-4 font-heading text-h4 text-secondary">
              {displayPhone(phone)}
            </a>
          )}
          <RingButton
            href="/contact"
            scrollTarget="enquire"
            onClick={(e) => onEnquire(e, () => setOpen(false))}
            className="mt-4 w-full"
          >
            Enquire Now
          </RingButton>
        </nav>
      </div>
    </header>
  )
}
