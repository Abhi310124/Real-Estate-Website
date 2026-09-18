'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Image reveal: `opacity 0 → 1` with `scale 1.05 → 1`, once, on enter.
 *
 * This replaces an earlier clip-path inset wipe. Measuring the reference showed its images rest
 * at `opacity: 0; transform: scale(1.05)` and settle to `opacity: 1; scale(1)` — a soft
 * settle-into-place, not a wipe. The difference is not subtle in use: a clip-path wipe draws
 * attention to the edge of the frame, while a scale-and-fade draws attention to the photograph.
 * On a layout carried almost entirely by its photography, that is the whole point.
 *
 * Deliberately CSS-transitioned rather than GSAP-driven, unlike the primitive it replaces:
 *
 *   - It is a one-shot enter transition with no scroll-linked progress, so ScrollTrigger buys
 *     nothing and costs a dynamic import on every image.
 *   - `transition` survives a failed JS chunk. If the observer never runs, the image is left in
 *     its pre-reveal state, so the rest state is `opacity: 1` and the observer *hides* it first.
 *     That inversion is what guarantees no image can ever be stranded invisible — a broken build
 *     shows every photograph rather than none.
 *
 * `scale(1.05)` needs `overflow-hidden` on the frame, or the 5% overshoot bleeds past the edge
 * and nudges surrounding layout.
 */
type Props = React.HTMLAttributes<HTMLDivElement> & {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  /** Stagger within a group, in ms. */
  delayMs?: number
}

export function ImageReveal({
  src,
  alt,
  sizes = '100vw',
  priority,
  delayMs = 0,
  className,
  ...rest
}: Props) {
  const frame = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  // `armed` means "JS is running and motion is allowed, so it is safe to hide this". Until then
  // the image renders fully visible.
  const [armed, setArmed] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (reduced) return
    const el = frame.current
    if (!el) return

    setArmed(true)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          window.setTimeout(() => setRevealed(true), delayMs)
          observer.disconnect()
          return
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, delayMs])

  const hidden = armed && !revealed

  return (
    <div ref={frame} data-testid="image-reveal" {...rest} className={`relative overflow-hidden ${className ?? ''}`}>
      <div
        className="relative h-full w-full transition-[opacity,transform] duration-[1100ms] ease-out motion-reduce:transition-none"
        style={{
          opacity: hidden ? 0 : 1,
          transform: hidden ? 'scale(1.05)' : 'scale(1)',
          willChange: hidden ? 'opacity, transform' : undefined,
        }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  )
}
