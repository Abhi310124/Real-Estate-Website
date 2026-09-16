'use client'
import { useCallback, useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

type Props = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  delay?: number
}

export function SplitWords({ text, as: Tag = 'h2', className, delay = 0 }: Props) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const words = text.split(/\s+/).filter(Boolean)

  useEffect(() => {
    if (reduced || !root.current) return
    const el = root.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        const inner = el.querySelectorAll<HTMLElement>('[data-word]')
        gsap.set(inner, { yPercent: 110, willChange: 'transform' })
        const tween = gsap.to(inner, {
          yPercent: 0,
          duration: 1.1,
          delay,
          stagger: 0.055,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          onComplete: () => gsap.set(inner, { willChange: 'auto' }),
        })
        kill = () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          ScrollTrigger.refresh()
        }
      })
      .catch((err) => {
        // A chunk that fails to load — stale deploy, flaky network — must degrade to the
        // words' natural visible position, not surface as an unhandled rejection. This
        // degrades correctly by construction: the gsap.set(..., { yPercent: 110 }) call
        // above never ran, so the words were never hidden in the first place — there is
        // nothing to undo. Logged rather than swallowed silently: a heading reveal that
        // quietly never runs is worth seeing in a console.
        console.error('[SplitWords] reveal unavailable; words render at natural position', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, delay, text])

  // Ruling 2: each mask below is `inline-block` and comes from a `.map`/`.flatMap`, so
  // there is no whitespace between them at all — without this, the words would render,
  // and be read aloud or copy-pasted, as one run-on token
  // ("RedefiningRealEstateExcellence"). A real space text node before every word but the
  // first restores normal spacing for a11y and copy-paste while leaving no trailing
  // space after the last word.
  const nodes = words.flatMap((w, i) => {
    const mask = (
      <span
        key={`${w}-${i}`}
        data-word-mask
        style={{ display: 'inline-block', overflow: 'hidden', lineHeight: 1.1, verticalAlign: 'bottom' }}
      >
        <span data-word style={{ display: 'inline-block' }}>
          {w}
        </span>
      </span>
    )
    return i > 0 ? [' ', mask] : [mask]
  })

  // Ruling 6: a callback ref, not `ref={root}` directly, because `Tag` is a union of
  // element types and `useRef<HTMLElement>` cannot be proven assignable to the specific
  // ref type React computes per member of that union (that mismatch is what the brief's
  // `ref={root as never}` was papering over). Function parameters are contravariant, so
  // a callback that accepts the general `HTMLElement` type-checks for every member of
  // the union without an `as never` escape hatch. Memoized with an empty dependency array
  // so its identity is stable across re-renders — an inline arrow here would give React a
  // new callback every render, forcing a detach/reattach of the DOM ref on every re-render
  // instead of only on mount/unmount.
  const setRef = useCallback((node: HTMLElement | null) => {
    root.current = node
  }, [])

  return (
    <Tag ref={setRef} className={className}>
      {nodes}
    </Tag>
  )
}
