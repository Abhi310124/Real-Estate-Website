'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

// Extends the brief's `<Marquee speed={40}>{children}</Marquee>` with a passthrough for the rest
// of the standard div attributes, matching Reveal/Parallax/SplitWords. `data-testid="marquee"`
// stays as the default on the outer element and is spread over by `rest`, so a caller can name
// each instance; the test's descendant selector `[data-testid="…"] [data-marquee-track]` keeps
// working either way, since the track structure inside is owned by this component.
type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode
  speed?: number
}

//
// Ruling 5 requires reduced motion to change the DOM shape itself (one track instead of
// two), not just gate the animation invisibly: a continuously-looping marquee has no
// stable "settled" end state to poll for the way a one-shot reveal does, so track count
// is the only race-free, external signal that reduced motion is actually honored. This
// also happens to be the correct application of useReducedMotion's "true on first
// render" safety default — the safe default (no motion) IS the one-track shape, so
// starting there and only upgrading to the two-track animated shape once motion is
// confirmed allowed is consistent with that ordering, not a deviation from it.
export function Marquee({ children, speed = 40, className, ...rest }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pairRef = useRef<HTMLDivElement>(null)
  const firstTrackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !containerRef.current || !pairRef.current || !firstTrackRef.current) return
    const container = containerRef.current
    const pair = pairRef.current
    const track = firstTrackRef.current
    let cancelled = false
    let cleanup: (() => void) | undefined

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return

        const width = track.getBoundingClientRect().width
        // Guard against a 0-width measurement (content not yet laid out): fall back to
        // a duration that still loops rather than dividing by zero into Infinity/NaN.
        const duration = width > 0 ? width / speed : 20

        // Translating the *pair* (two copies of the track side by side) by exactly
        // -50% moves it by exactly one track-width — track two lands exactly where
        // track one started, so the loop point is visually seamless.
        const tween = gsap.to(pair, { xPercent: -50, duration, ease: 'none', repeat: -1 })
        tween.pause() // held until the first onToggle reports visibility, below

        let inView = false
        let hovered = false
        const sync = () => {
          if (inView && !hovered) tween.play()
          else tween.pause()
        }

        const trigger = ScrollTrigger.create({
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            inView = self.isActive
            // A looping marquee never "completes" the way a once-triggered reveal
            // does, so — same reasoning as Parallax — will-change is tied to the
            // visibility signal that also gates play/pause, not to an onComplete.
            gsap.set(pair, { willChange: inView ? 'transform' : 'auto' })
            sync()
          },
        })

        const onEnter = () => {
          hovered = true
          sync()
        }
        const onLeave = () => {
          hovered = false
          sync()
        }
        container.addEventListener('mouseenter', onEnter)
        container.addEventListener('mouseleave', onLeave)

        cleanup = () => {
          trigger.kill()
          tween.kill()
          gsap.set(pair, { willChange: 'auto' })
          container.removeEventListener('mouseenter', onEnter)
          container.removeEventListener('mouseleave', onLeave)
        }
      })
      .catch((err) => {
        // A failed chunk load must degrade to a static, non-looping marquee, not an
        // unhandled rejection. Both tracks stay laid out side by side at their natural
        // position — nothing was ever transformed, so there is nothing to undo.
        // Logged rather than swallowed.
        console.error('[Marquee] loop unavailable; tracks render static side by side', err)
      })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [reduced, speed])

  if (reduced) {
    return (
      <div ref={containerRef} data-testid="marquee" {...rest} className={`overflow-hidden ${className ?? ''}`}>
        <div data-marquee-track className="inline-flex w-max">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} data-testid="marquee" {...rest} className={`overflow-hidden ${className ?? ''}`}>
      <div ref={pairRef} className="inline-flex w-max">
        <div ref={firstTrackRef} data-marquee-track className="inline-flex w-max shrink-0">
          {children}
        </div>
        <div data-marquee-track className="inline-flex w-max shrink-0">
          {children}
        </div>
      </div>
    </div>
  )
}
