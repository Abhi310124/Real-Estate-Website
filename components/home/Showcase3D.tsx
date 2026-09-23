'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * The showcase: a drum of photographs turning in 3D inside the frame the layout gives its film.
 *
 * The reference fills this 1344×756 frame with a video player. There is no BKR film, and a player
 * with nothing to play is worse than an empty frame, so the frame holds the portfolio's photography
 * instead — as a real 3D object: ten panels set around a vertical axis, the drum tipped slightly toward
 * the viewer, under a perspective. It turns three ways:
 *
 * - **With the page.** Half a revolution across the frame's time on screen, scrubbed with a little lag.
 * - **By hand.** Drag it (mouse or touch; vertical touch movement still scrolls the page), and it
 *   carries on with the flick's momentum before settling.
 * - **By keyboard.** The frame is focusable; ← and → turn it one panel.
 *
 * Panels are shaded by how far they face away — full brightness at the front, dimmer toward the
 * edges — which is the depth cue that makes a ring of flat images read as a solid drum.
 *
 * The geometry is pure CSS (custom properties below), so the server renders the drum already posed
 * and a visitor without script, or with reduced motion, sees the same composition standing still.
 * Reduced motion keeps dragging and the keyboard — motion the visitor starts is motion they asked
 * for — but drops the scroll scrub and the momentum.
 *
 * The bar and counter along the foot mirror the scrubber of the player this replaces: they report
 * which panel is at the front, and the caption beside them is that photograph's own description.
 */

type Panel = { src: string; alt: string }

/** Degrees of drag per pixel. */
const DRAG_GAIN = 0.28
/** Revolutions across the frame's scroll range. */
const SCROLL_TURN = 0.5
/** Momentum decay per frame at 60fps. */
const FRICTION = 0.94

export function Showcase3D({ panels, label, hint }: { panels: readonly Panel[]; label: string; hint: string }) {
  const frame = useRef<HTMLDivElement>(null)
  const drum = useRef<HTMLDivElement>(null)
  const shades = useRef<Array<HTMLDivElement | null>>([])
  const bar = useRef<HTMLDivElement>(null)
  const nudge = useRef<((dir: 1 | -1) => void) | null>(null)
  const reduced = useReducedMotion()
  const [front, setFront] = useState(0)

  const count = panels.length
  const step = 360 / count

  useEffect(() => {
    if (!frame.current || !drum.current) return
    const el = frame.current
    const body = drum.current
    let cleanup: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        let scrollAngle = 0
        let handAngle = 0
        let velocity = 0
        let dragging = false
        let lastX = 0
        let lastFront = 0

        const render = () => {
          const angle = scrollAngle + handAngle
          body.style.setProperty('--turn', `${angle}deg`)
          for (let i = 0; i < count; i += 1) {
            const facing = Math.cos(((i * step + angle) * Math.PI) / 180)
            const shade = shades.current[i]
            if (shade) shade.style.opacity = String(((1 - facing) / 2) * 0.85)
          }
          const turned = ((-angle % 360) + 360) % 360
          if (bar.current) bar.current.style.transform = `scaleX(${turned / 360})`
          const f = Math.round(turned / step) % count
          if (f !== lastFront) {
            lastFront = f
            setFront(f)
          }
        }

        // ── the page scrub ───────────────────────────────────────────────────────────────────────
        const proxy = { a: 0 }
        const scrub = reduced
          ? undefined
          : gsap.to(proxy, {
              a: -360 * SCROLL_TURN,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.9 },
              onUpdate: () => {
                scrollAngle = proxy.a
                render()
              },
            })

        // ── momentum ─────────────────────────────────────────────────────────────────────────────
        const tick = () => {
          if (dragging || Math.abs(velocity) < 0.01) return
          handAngle += velocity
          velocity *= FRICTION
          render()
        }
        if (!reduced) gsap.ticker.add(tick)

        // ── drag ─────────────────────────────────────────────────────────────────────────────────
        const onDown = (e: PointerEvent) => {
          if (e.button !== 0) return
          dragging = true
          velocity = 0
          lastX = e.clientX
          el.setPointerCapture(e.pointerId)
          el.dataset.dragging = 'true'
        }
        const onMove = (e: PointerEvent) => {
          if (!dragging) return
          const dx = e.clientX - lastX
          lastX = e.clientX
          handAngle += dx * DRAG_GAIN
          velocity = dx * DRAG_GAIN
          render()
        }
        const onUp = (e: PointerEvent) => {
          if (!dragging) return
          dragging = false
          if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
          delete el.dataset.dragging
          if (reduced) velocity = 0
        }
        el.addEventListener('pointerdown', onDown)
        el.addEventListener('pointermove', onMove)
        el.addEventListener('pointerup', onUp)
        el.addEventListener('pointercancel', onUp)

        // ── keyboard: one panel per press, snapped to the panel grid ──────────────────────────────
        nudge.current = (dir) => {
          velocity = 0
          const current = scrollAngle + handAngle
          const target = Math.round((current - dir * step) / step) * step
          const hand = { v: handAngle }
          gsap.to(hand, {
            v: handAngle + (target - current),
            duration: reduced ? 0 : 0.8,
            ease: 'door',
            onUpdate: () => {
              handAngle = hand.v
              render()
            },
          })
        }

        render()
        ScrollTrigger.refresh()

        cleanup = () => {
          scrub?.scrollTrigger?.kill()
          scrub?.kill()
          gsap.ticker.remove(tick)
          el.removeEventListener('pointerdown', onDown)
          el.removeEventListener('pointermove', onMove)
          el.removeEventListener('pointerup', onUp)
          el.removeEventListener('pointercancel', onUp)
          nudge.current = null
        }
      })
      .catch((err) => console.error('[Showcase3D] drum unavailable; photographs render standing still', err))

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [reduced, count, step])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      nudge.current?.(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      nudge.current?.(-1)
    }
  }

  return (
    <section className="py-16 max-lg:py-12">
      <div className="container-page">
        <div
          ref={frame}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${label}. Use the left and right arrow keys to turn.`}
          onKeyDown={onKeyDown}
          className={cn(
            'relative aspect-[16/9] w-full cursor-grab touch-pan-y select-none overflow-clip rounded-card bg-secondary',
            'data-[dragging=true]:cursor-grabbing',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary',
            'max-md:aspect-[4/5]'
          )}
          style={
            {
              '--panel-w': 'clamp(210px, 34vw, 500px)',
              '--panel-h': 'calc(var(--panel-w) * 0.72)',
              // (w/2) / tan(180°/10) is the radius at which ten panels meet edge to edge; the extra
              // 5% opens a hairline of navy between neighbours.
              '--radius': 'calc(var(--panel-w) * 1.62)',
            } as React.CSSProperties
          }
        >
          {/* A soft light behind the drum, so the panels stand out of the navy rather than off it. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(62,90,126,0.55),transparent_70%)]" />

          <div className="absolute inset-0 [perspective:1800px] [perspective-origin:50%_42%]">
            <div
              ref={drum}
              className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
              style={
                {
                  '--turn': '0deg',
                  width: 'var(--panel-w)',
                  height: 'var(--panel-h)',
                  marginLeft: 'calc(var(--panel-w) / -2)',
                  marginTop: 'calc(var(--panel-h) / -2)',
                  // Tipped about the FRONT panel (rotateX applied last, at z = 0), so the tilt lifts the
                  // back of the drum rather than dropping the front panel down the frame.
                  transform: 'rotateX(-7deg) translateZ(calc(var(--radius) * -1)) rotateY(var(--turn))',
                } as React.CSSProperties
              }
            >
              {panels.map((panel, i) => (
                <figure
                  key={panel.src}
                  className="absolute inset-0 overflow-clip rounded-card [backface-visibility:hidden]"
                  style={{ transform: `rotateY(${i * step}deg) translateZ(var(--radius))` }}
                >
                  <Image
                    src={panel.src}
                    alt={panel.alt}
                    fill
                    draggable={false}
                    sizes="(max-width: 767px) 60vw, 34vw"
                    className="pointer-events-none object-cover"
                  />
                  <div
                    ref={(node) => {
                      shades.current[i] = node
                    }}
                    aria-hidden="true"
                    className="absolute inset-0 bg-secondary"
                    style={{ opacity: ((1 - Math.cos((i * step * Math.PI) / 180)) / 2) * 0.85 }}
                  />
                </figure>
              ))}
            </div>
          </div>

          {/* Edge fades: the drum turns out of the dark rather than being cut by the frame. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[14%] bg-gradient-to-r from-secondary to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[14%] bg-gradient-to-l from-secondary to-transparent" />

          <p className="pointer-events-none absolute left-6 top-5 font-heading text-small text-primary max-md:left-4 max-md:top-4">{label}</p>
          <p className="pointer-events-none absolute right-6 top-5 flex items-center gap-2 text-small text-primary/80 max-md:right-4 max-md:top-4">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path d="M8 7 3 12l5 5M16 7l5 5-5 5M3 12h18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {hint}
          </p>

          <div className="pointer-events-none absolute inset-x-6 bottom-5 max-md:inset-x-4 max-md:bottom-4">
            <div className="h-[2px] w-full overflow-clip rounded-full bg-primary/25">
              <div ref={bar} className="h-full w-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-6 text-small text-primary">
              <p className="truncate">
                {panels[front]?.alt}
              </p>
              <p className="tnum shrink-0 text-primary/80">
                {String(front + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
