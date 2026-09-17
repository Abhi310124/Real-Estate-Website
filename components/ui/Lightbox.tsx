'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { Img } from '@/lib/data/types'

type Props = { images: Img[]; index: number; onClose: () => void }

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])'
const MIN_SCALE = 1
const MAX_SCALE = 4

function distance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/**
 * Focus-trapped image dialog, mounted via a portal straight onto `document.body` so its
 * stacking context is never at the mercy of whichever section happened to render the
 * trigger. Ruling 4's z-index budget puts this at `z-[110]`, above the page-transition
 * curtain's `z-[90]` — the curtain must never be able to trap a dialog the user is actively
 * interacting with underneath it.
 *
 * The focus-trap/Escape/Tab-cycling shape mirrors `components/layout/MegaMenu.tsx` almost
 * exactly, with one deliberate difference: MegaMenu takes an explicit `triggerRef` prop
 * because its one caller (Header) already owns that ref. This component's interface is
 * fixed to `{ images, index, onClose }` (no triggerRef param), so it captures
 * `document.activeElement` itself the moment it mounts — whichever `[data-zoom]` button
 * was actually clicked, from any of the three sections that open this — and restores
 * focus there on every close path.
 */
export function Lightbox({ images, index, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [current, setCurrent] = useState(index)
  const [scale, setScale] = useState(MIN_SCALE)
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null)

  // The setState calls below are deferred into a microtask rather than called directly in
  // the effect body (same shape as `PageTransition.tsx`'s intro-decision effect): `document`
  // is an external system with no render-time-safe read on the server, so the read has to
  // happen here, on mount — but `react-hooks/set-state-in-effect` wants the actual re-render
  // trigger to come from a callback, not the effect's own top-level synchronous flow. A
  // microtask still resolves before the next paint.
  useEffect(() => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    queueMicrotask(() => setMounted(true))
  }, [])

  // A fresh `index` (a different [data-zoom] clicked while already open — GallerySwiper and
  // ConstructionTimeline both mount this conditionally, so in practice this only matters if a
  // caller ever swaps `index` without unmounting) always resets the zoom level too.
  useEffect(() => {
    queueMicrotask(() => {
      setCurrent(index)
      setScale(MIN_SCALE)
    })
  }, [index])

  const closeAndRestoreFocus = () => {
    onClose()
    triggerRef.current?.focus()
  }

  const goTo = (next: number) => {
    setCurrent(((next % images.length) + images.length) % images.length)
    setScale(MIN_SCALE)
  }

  // Requirement: overflow:hidden on <body> while open, restored after — including if this
  // unmounts while still open. Same shape as MegaMenu.tsx's body-scroll-lock effect.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  // Focus trap + Escape + arrow-key navigation, combined for the same reason MegaMenu
  // combines them: all three are about keeping focus and navigation inside this dialog
  // until the user explicitly leaves it.
  //
  // `mounted` is in the dependency array on purpose, even though the body never reads it:
  // this component's first real (portaled) paint is its *second* render — `dialogRef` has
  // nothing attached to it yet on the render where `mounted` is still false, so this effect
  // bails out via the `!panel` guard below and never attaches the keydown listener. Without
  // `mounted` here, nothing in this effect's dependency list ever changes again once the
  // portal actually exists (`current`/`images.length` are already settled by then), so it
  // would never get a second chance to run against a real `panel` — Escape/Tab/arrow keys
  // would silently do nothing forever, while the dialog still opens and looks interactive.
  useEffect(() => {
    const panel = dialogRef.current
    if (!panel) return

    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    focusable()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeAndRestoreFocus()
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goTo(current + 1)
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goTo(current - 1)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- closeAndRestoreFocus/goTo close over `current`/`images`, both already deps in effect
  }, [current, images.length, mounted])

  if (!mounted) return null

  const image = images[current]
  if (!image) return null

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))

  // Desktop zoom: wheel scrolls the page by default, so this is the one place a wheel
  // listener intentionally takes over — only ever while the dialog is open and focused.
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setScale((s) => clampScale(s - e.deltaY * 0.0015))
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return
    pinchStartRef.current = { distance: distance(e.touches[0], e.touches[1]), scale }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !pinchStartRef.current) return
    e.preventDefault()
    const ratio = distance(e.touches[0], e.touches[1]) / pinchStartRef.current.distance
    setScale(clampScale(pinchStartRef.current.scale * ratio))
  }

  const onTouchEnd = () => {
    pinchStartRef.current = null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-navy-900/95 p-4 sm:p-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAndRestoreFocus()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={image.alt}
        className="relative flex h-full max-h-[85vh] w-full max-w-4xl items-center justify-center"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={closeAndRestoreFocus}
          className="absolute right-0 top-0 z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-navy-900/60 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(current - 1)}
              className="absolute left-0 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900/60 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(current + 1)}
              className="absolute right-0 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900/60 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}

        <div
          className="relative h-full w-full overflow-hidden"
          onWheel={onWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="90vw"
            className="object-contain transition-transform duration-150"
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        {image.caption && <p className="absolute -bottom-8 inset-x-0 text-center text-caption text-white/70">{image.caption}</p>}
      </div>
    </div>,
    document.body,
  )
}
