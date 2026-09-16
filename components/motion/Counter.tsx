'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'
import { getGsap } from './gsap'

// Extends the brief's `{ value, suffix?, className? }` with a passthrough for the rest of the
// standard span attributes, matching Reveal/Parallax/SplitWords.
//
// `data-testid` is declared and threaded explicitly rather than left to `rest`, because unlike
// the other primitives this component's testid does not belong on its root: per Ruling 3 it
// marks the number-only span, so the testid element's text is exactly the number ("90") and
// never "90Acres" — `suffix` is a sibling outside it. Letting `rest` carry it to the root would
// put a second matching element in the DOM instead of overriding the first. Defaults to
// "counter" so existing tests keep passing; a stats row with two Counters can now name each one
// and avoid a Playwright strict-mode violation.
type Props = React.HTMLAttributes<HTMLSpanElement> & {
  value: number
  suffix?: string
  'data-testid'?: string
}

export function Counter({ value, suffix, className, 'data-testid': testId = 'counter', ...rest }: Props) {
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
    <span className={className} {...rest}>
      <span ref={numberRef} data-testid={testId} className="tabular-nums">
        {value.toLocaleString('en-IN')}
      </span>
      {suffix !== undefined && <span>{suffix}</span>}
    </span>
  )
}
