'use client'
import { useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { SplitWords } from '@/components/motion/SplitWords'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#location` (navy) — a `place → distance` list beside a map. Ruling 6: the iframe's
 * `src` is only ever set once the map wrapper has intersected the viewport (plus a
 * little lookahead margin), never on first paint, so a slow or unreachable Google Maps
 * embed never becomes a load-bearing dependency of this page's first render or of any
 * e2e test — no test here asserts on the iframe having actually loaded. Renders nothing
 * in the map's place, only the connectivity list, when `location.mapEmbedUrl` is absent
 * (Ruling 6: never synthesised from `lat`/`lng`, and never invented outright).
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
      { rootMargin: '200px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [mapEmbedUrl])

  return (
    <section id="location" className="scroll-mt-[180px] bg-navy-800 py-20 text-white sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <Eyebrow className="text-champagne">Location &amp; Connectivity</Eyebrow>
          <SplitWords
            as="h2"
            text={`${project.location.area}, ${project.location.city}`}
            className="mt-3 font-display-expanded text-display-md text-white"
          />
          <ul className="mt-8 space-y-4">
            {/* Reveal sits INSIDE the <li>, not around it. Reveal renders a <div>, so wrapping
                the <li> put a <div> as a direct child of <ul> — which axe flags twice, as
                `list` (a ul may only directly contain li) and `listitem` (an li outside any
                list). Nesting it inward keeps the markup valid and looks identical, since the
                div fills the li. */}
            {project.connectivity.map((entry, i) => (
              <li key={entry.place} className="border-b border-white/10 pb-3">
                <Reveal delay={i * 0.05} className="flex items-baseline justify-between gap-4">
                  <span className="text-body text-white/90">{entry.place}</span>
                  <span className="tnum shrink-0 text-sm font-semibold text-champagne">{entry.distance}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        {mapEmbedUrl && (
          <div ref={wrapRef} className="relative min-h-[320px] overflow-hidden rounded-sm bg-navy-700">
            {shouldLoadMap ? (
              <iframe
                title={`Map of ${project.title}`}
                src={mapEmbedUrl}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-navy-600" />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
