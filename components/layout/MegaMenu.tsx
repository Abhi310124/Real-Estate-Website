'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { getGsap } from '@/components/motion/gsap'
import type { SiteSettings } from '@/lib/data/types'

type Props = {
  id: string
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  settings: SiteSettings
}

const PRIMARY_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])'

/**
 * Full-screen navy overlay for the primary site navigation. Every a11y requirement below is
 * one of Ruling 10's hard, independently-testable requirements, and each is now exercised by
 * tests/e2e/header.spec.ts — including the Tab/Shift+Tab cycling half of the focus trap, which
 * 'focus cycles within the open mega-menu in both directions' covers.
 */
export function MegaMenu({ id, open, onClose, triggerRef, settings }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Requirement: overflow:hidden on <body> while open, restored on close — including if
  // this component unmounts while still open. A useEffect cleanup fires on both of those
  // paths identically (React guarantees it), so there is nothing extra to special-case for
  // the unmount branch: it is the same cleanup function either way. Restores the *previous*
  // inline value rather than assuming '', in case something else on the page ever sets it.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  // Requirement: Escape closes and returns focus to the trigger, plus a focus trap while
  // open. Both live in one listener because they are the same concern (keeping focus
  // inside the panel until the user explicitly leaves it).
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    focusable()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        triggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, triggerRef])

  // Requirement: staggered link reveal that collapses to instant under reduced motion.
  // Same getGsap().then().catch() degrade-gracefully shape as Reveal.tsx/SplitWords.tsx —
  // a failed chunk load must leave the links at their natural, already-visible state, never
  // stuck at the gsap.set(...) hidden starting point.
  useEffect(() => {
    if (!open || reduced) return
    const panel = panelRef.current
    if (!panel) return
    const links = Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-link]'))
    if (links.length === 0) return

    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        gsap.set(links, { opacity: 0, y: 16, willChange: 'transform, opacity' })
        const t = gsap.to(links, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power3.out',
          onComplete: () => gsap.set(links, { willChange: 'auto' }),
        })
        kill = () => t.kill()
      })
      .catch((err) => {
        console.error('[MegaMenu] link reveal unavailable; links render at their natural, visible state', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [open, reduced])

  if (!open) return null

  const closeAndRefocus = () => {
    onClose()
    triggerRef.current?.focus()
  }

  return (
    <div
      ref={panelRef}
      id={id}
      className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-navy-800 text-ivory"
    >
      <div className="flex justify-end px-4 pt-4 sm:px-6">
        <button
          type="button"
          // Deliberately "Close", not "Close menu": the header's own trigger is matched by
          // an accessible-name regex of /menu/i (see tests/e2e/header.spec.ts), and while
          // the panel is open both buttons are in the DOM at once — a label containing
          // "menu" here would make that query resolve to two elements and fail Playwright's
          // strict mode. Caught by this batch's own aria-expanded/body-scroll-lock test.
          aria-label="Close"
          onClick={closeAndRefocus}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Requirement: role="navigation" with aria-label="Main". */}
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-6 py-10 sm:flex-row sm:gap-16"
      >
        <ul className="space-y-4">
          {PRIMARY_LINKS.map((link) => (
            <li key={link.href} data-menu-link>
              <Link
                href={link.href}
                onClick={closeAndRefocus}
                className="font-display-expanded text-display-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="space-y-3">
          {settings.categories.map((category) => (
            <li key={category.value} data-menu-link>
              <Link
                href={`/projects?category=${category.value}`}
                onClick={closeAndRefocus}
                className="eyebrow text-eyebrow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="space-y-2 text-sm" data-menu-link>
          {settings.phones.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              {phone}
            </a>
          ))}
          <p>{settings.address}</p>
        </div>
      </nav>
    </div>
  )
}
