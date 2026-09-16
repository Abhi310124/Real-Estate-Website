'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

type Props = {
  value: number
  suffix?: string
  className?: string
}

// The brief's interface (`<Counter value={90} suffix="Acres" className?>`) has no
// testid slot, and the lab mounts exactly one Counter — same situation as ImageReveal —
// so `data-testid="counter"` is hardcoded here rather than threaded through as a prop.
// Per Ruling 3 it lands on the number-only span specifically: `suffix` is a sibling
// span outside it, so the testid element's text is exactly the number ("90"), never
// "90Acres". Known limitation (shared with ImageReveal): a second Counter on the same
// page would collide on this fixed testid.
export function Counter({ value, suffix, className }: Props) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !numberRef.current) return
    const el = numberRef.current
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const counter = { val: 0 }
        // Only jump the displayed text to "0" once the count-up is confirmed to be
        // about to run. The element sits behind its own ScrollTrigger below the fold,
        // so this never strands a visible "0" the way an unconditional reset on mount
        // would — by the time it can be seen, the trigger has already fired.
        el.textContent = '0'
        const t = gsap.to(counter, {
          val: value,
          // Brief specifies the trigger position exactly ("top 85%") but leaves
          // duration/ease unspecified for Counter (unlike Reveal's 0.9s/power3.out and
          // ImageReveal's 1.4s/expo.out, which are given verbatim). Judgment call:
          // 2s/power2.out — long enough to read as a genuine count rather than a snap,
          // decelerating smoothly like the other reveal-class primitives without the
          // very sharp expo/power3 tail that can look like it stalls on the last few
          // integer steps of a number tween.
          duration: 2,
          ease: 'power2.out',
          roundProps: 'val',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            el.textContent = counter.val.toLocaleString('en-IN')
          },
        })
        kill = () => {
          t.scrollTrigger?.kill()
          t.kill()
        }
      })
      .catch((err) => {
        // A failed chunk load must degrade to the final value already rendered below —
        // el.textContent was never touched, so nothing was ever reset to "0" in the
        // first place. Logged rather than swallowed.
        console.error('[Counter] count-up unavailable; final value stays as rendered', err)
      })

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced, value])

  // Renders the final value by default; only JS rewrites it, and only once motion is
  // confirmed allowed and the count-up is about to run.
  return (
    <span className={className}>
      <span ref={numberRef} data-testid="counter" className="tabular-nums">
        {value.toLocaleString('en-IN')}
      </span>
      {suffix !== undefined && <span>{suffix}</span>}
    </span>
  )
}
