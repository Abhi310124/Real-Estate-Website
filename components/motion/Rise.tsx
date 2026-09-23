'use client'
import { useEffect, useRef } from 'react'
import { getGsap } from './gsap'
import { useReducedMotion } from './useReducedMotion'

/**
 * A heading rising into place as it scrolls into view — the layout's section-heading entrance.
 *
 * Measured spec: each line travels up into position over 800ms on the `door` curve
 * (cubic-bezier(0.8, 0, 0.2, 1)), and a heading's second line follows its first 250ms later. The
 * reference moves its lines only 5px, which on a 64px heading is too little to register as motion at
 * all; here they also fade up from 14px, which keeps the same curve, timing and stagger while being
 * something a visitor can actually see happen.
 *
 * Lines are opted in with `data-line` on block-level children:
 *
 *   <Rise as="h2">
 *     <span data-line className="block">Growing across</span>
 *     <span data-line className="block text-accentInk">Hyderabad</span>
 *   </Rise>
 *
 * An explicit marker rather than "every child", because a one-line heading with a coloured word in it
 * (`made an <span>impact</span>`) has an element child that is NOT a line, and animating it alone
 * would lift one word out of its sentence. With no `data-line` children the element rises as a whole.
 *
 * Renders fully visible; only script hides it, and only once motion is confirmed allowed — so a
 * failed chunk, reduced motion and no-JS all land on the finished heading.
 */

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'blockquote'

type Props = React.HTMLAttributes<HTMLElement> & {
  as?: Tag
  children: React.ReactNode
  /** Seconds between lines. The reference's second line trails by 0.25s. */
  stagger?: number
  delay?: number
}

export function Rise({ as: Tag = 'h2', children, stagger = 0.25, delay = 0, className, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !ref.current) return
    const el = ref.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const marked = el.querySelectorAll<HTMLElement>(':scope > [data-line]')
        const lines = marked.length ? Array.from(marked) : [el]
        gsap.set(lines, { y: 14, opacity: 0 })
        const t = gsap.to(lines, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'door',
          stagger,
          delay,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onComplete: () => gsap.set(lines, { clearProps: 'transform,opacity' }),
        })
        kill = () => {
          t.scrollTrigger?.kill()
          t.kill()
          gsap.set(lines, { clearProps: 'transform,opacity' })
        }
      })
      .catch((err) => {
        console.error('[Rise] heading entrance unavailable; heading renders in place', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, stagger, delay])

  return (
    <Tag ref={ref as React.Ref<never>} className={className} {...rest}>
      {children}
    </Tag>
  )
}
