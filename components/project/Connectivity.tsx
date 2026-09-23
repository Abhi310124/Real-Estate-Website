'use client'
import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { Rise } from '@/components/motion/Rise'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#location` — as the layout sets it: "Location" in the left three columns; to the right, the locality
 * with a "Get directions ↗" link across from it, the map beneath, and — ours — the `place → distance`
 * list under the map, two columns of ruled rows with the distances in tabular figures.
 *
 * "Get directions" opens Google Maps routed to the locality named on the page, which is all the page
 * knows; it never guesses at a street address.
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

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${project.location.area}, ${project.location.city}`
  )}`

  return (
    <section id="location" className={cn('layout-grid gap-y-8 pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
      <Rise as="h2" className="col-span-12 font-heading text-h2 text-secondary max-sm:text-h2-sm lg:col-span-3">
        Location
      </Rise>

      <div className="col-span-12 lg:col-span-9">
        <div className="flex items-baseline justify-between gap-6">
          <p className="text-body text-secondary">
            {project.location.area}, {project.location.city}
          </p>
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 text-body text-accentInk transition-colors duration-300 hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            Get directions
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {mapEmbedUrl && (
          <div ref={wrapRef} className="relative mt-6 aspect-[988/450] w-full overflow-clip rounded-card bg-tint max-sm:aspect-[4/3]">
            {shouldLoadMap ? (
              <iframe
                title={`Map of ${project.title}`}
                src={mapEmbedUrl}
                className="absolute inset-0 h-full w-full border-0 grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              // `animate-pulse` is an opacity animation, dropped under reduced motion.
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-edge/20 motion-reduce:animate-none" />
            )}
          </div>
        )}

        {project.connectivity.length > 0 && (
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {project.connectivity.map((entry, i) => (
              <li key={entry.place} className="border-t border-hairline">
                <Reveal delay={i * 0.05} className="flex items-baseline justify-between gap-6 py-4">
                  <span className="text-body text-secondary">{entry.place}</span>
                  <span className="tnum shrink-0 text-small text-navySoft">{entry.distance}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
