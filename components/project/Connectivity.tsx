'use client'
import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#location` — black chapter. A `place → distance` list beside the map.
 *
 * The distances are set in mono with tabular figures and pushed hard right against the place name, with
 * a hairline under every row. That `label … value` pairing across a ruled row is the reference's
 * treatment for any table of facts, and tabular figures are what keep the numbers in a true column
 * instead of shuffling by a fraction of a character per row.
 *
 * The iframe's `src` is only set once the map wrapper has intersected the viewport (plus a little
 * lookahead margin), never on first paint, so a slow or unreachable Google Maps embed never becomes a
 * load-bearing dependency of this page's first render. Renders nothing in the map's place — only the
 * connectivity list — when `location.mapEmbedUrl` is absent: it is never synthesised from `lat`/`lng`
 * and never invented.
 */
export function Connectivity({ project }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)
  const mapEmbedUrl = project.location.mapEmbedUrl

  useEffect(() => {
    if (!mapEmbedUrl) return
    const el = wrapRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadMap(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mapEmbedUrl])

  return (
    <section
      id="location"
      className={cn('w-full bg-secondary py-[8vw] text-primary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <p className="col-span-12 font-mono text-mono uppercase text-primary/70 max-sm:text-mono-sm sm:col-span-3">
          Location &amp; Connectivity
        </p>
        <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-8 sm:col-start-5 sm:mt-0">
          {project.location.area}, {project.location.city}
        </h2>
      </div>

      <div className="layout-grid mt-[6vw] max-sm:mt-[12vw]">
        <ul className="col-span-12 sm:col-span-5">
          {project.connectivity.map((entry, i) => (
            <li key={entry.place}>
              <RuleDraw delayMs={i * 70} className="text-primary/25" />
              <Reveal
                delay={i * 0.05}
                className="flex items-baseline justify-between gap-[2vw] py-[1.2vw] max-sm:py-[4vw]"
              >
                <span className="text-body max-sm:text-body-sm">{entry.place}</span>
                <span className="tnum shrink-0 font-mono text-mono uppercase text-primary/70 max-sm:text-mono-sm">
                  {entry.distance}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>

        {mapEmbedUrl && (
          <div
            ref={wrapRef}
            className="relative col-span-12 mt-[4vw] aspect-[4/3] w-full overflow-hidden bg-muted max-sm:mt-[10vw] sm:col-span-6 sm:col-start-7 sm:mt-0"
          >
            {shouldLoadMap ? (
              <iframe
                title={`Map of ${project.title}`}
                src={mapEmbedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              // `animate-pulse` is an opacity animation, so it composites on its own layer and is
              // dropped entirely under reduced motion by `motion-reduce:animate-none`.
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-edge/20 motion-reduce:animate-none" />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
