'use client'
import { useEffect, useRef } from 'react'
import { getGsap } from '@/components/motion/gsap'
import { useReducedMotion } from '@/components/motion/useReducedMotion'

/**
 * "What drives us": the values, revealed along a gradient bar that grows down the page as it scrolls.
 *
 * The scrub is the reference's keyframe table, as fractions of the block's scroll range:
 *
 *   bar height   30% until 12%, then 40% at 26%, 75% at 67%, 100% at 78%
 *   value 1      hidden until 20.9%, fully in by 26%
 *   value 2      hidden until 48%,   fully in by 56%
 *   value 3      hidden until 63%,   fully in by 70%
 *
 * so the bar leads and each value arrives as the bar reaches it. Smoothed with 0.9s of lag (the
 * reference's smoothing of 90 on this interaction).
 *
 * The server renders the finished state — full bar, every value visible — and reduced motion keeps
 * it, so none of the copy ever depends on the scrub to be read.
 */

type Value = { title: string; description: string }

export function ValuesTimeline({ intro, title, values }: { intro: string; title: string; values: Value[] }) {
  const root = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced || !root.current || !bar.current) return
    const el = root.current
    const line = bar.current
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-value]'))
    let kill: (() => void) | undefined
    let cancelled = false

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 55%', scrub: 0.9 },
        })
        // One unit of timeline = the whole scroll range, so every position below reads as a fraction.
        tl.set(line, { height: '30%' }, 0)
          .to(line, { height: '30%', duration: 0.12 }, 0)
          .to(line, { height: '40%', duration: 0.14 }, 0.12)
          .to(line, { height: '75%', duration: 0.41 }, 0.26)
          .to(line, { height: '100%', duration: 0.11 }, 0.67)
          .to(line, { height: '100%', duration: 0.22 }, 0.78)
        const windows: Array<[number, number]> = [
          [0.209, 0.26],
          [0.48, 0.56],
          [0.63, 0.7],
        ]
        items.forEach((item, i) => {
          const [from, to] = windows[Math.min(i, windows.length - 1)]
          tl.set(item, { opacity: 0 }, 0).fromTo(item, { opacity: 0 }, { opacity: 1, duration: to - from }, from)
        })
        kill = () => {
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set([line, ...items], { clearProps: 'height,opacity' })
        }
      })
      .catch((err) => console.error('[ValuesTimeline] scrub unavailable; values render in full', err))

    return () => {
      cancelled = true
      kill?.()
    }
  }, [reduced])

  return (
    <div ref={root} className="relative">
      {/* The bar sits in the gutter just left of the copy column, the full height of the block. */}
      <div aria-hidden="true" className="layout-grid pointer-events-none absolute inset-0">
        <div className="relative col-span-12 lg:col-span-5 lg:col-start-4">
          <div className="absolute -left-12 top-0 h-full w-2 max-lg:left-0">
            <div ref={bar} className="bg-brand-y h-full w-full rounded-full" />
          </div>
        </div>
      </div>

      <div className="layout-grid">
        <div className="col-span-12 lg:col-span-5 lg:col-start-4 max-lg:pl-8">
          <p className="text-[18px] leading-[1.5] text-secondary max-sm:text-body">{intro}</p>
          <h2 className="mt-28 font-heading text-h2 text-secondary max-lg:mt-16 max-sm:text-h2-sm">{title}</h2>
        </div>
      </div>

      <ol className="mt-24 space-y-20 pb-10 max-lg:mt-14 max-lg:space-y-14">
        {values.map((value, i) => (
          <li key={value.title} className="layout-grid items-start">
            {/* The ghosted numeral hangs in the left margin, level with its value's title. */}
            <span aria-hidden="true" className="col-span-3 -mt-3 font-heading text-numeral text-ghost max-lg:hidden">
              {i + 1}
            </span>
            <div data-value className="col-span-12 lg:col-span-5 lg:col-start-4 max-lg:pl-8">
              <h3 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">{value.title}</h3>
              <p className="mt-3 text-body text-muted">{value.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
