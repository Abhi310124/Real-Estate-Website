'use client'
import { useEffect, useRef, useState } from 'react'

type Props = { address: string }

/**
 * Lazily-loaded map for the Contact page, mirroring `Connectivity.tsx`'s own pattern exactly:
 * the iframe's `src` is only ever set once this wrapper has intersected the viewport (plus a
 * 200px lookahead), never on first paint — a slow or unreachable Google Maps embed must never
 * become a load-bearing dependency of this page's first render, and no e2e test here asserts on
 * the iframe having actually loaded.
 *
 * The embed URL is built straight from the verified `settings.address` string via Google Maps'
 * query-based embed (`/maps?q=...&output=embed`), which needs no API key — never synthesised
 * from an invented `lat`/`lng`, and never a hardcoded address of its own.
 */
export function ContactMap({ address }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [shouldLoadMap, setShouldLoadMap] = useState(false)

  useEffect(() => {
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
  }, [])

  return (
    // An 8px-radius card at the proportions the layout gives its location map (988×450), as an
    // `aspect-*` frame rather than a fixed `min-h`, so the box is reserved before the embed arrives
    // and a late-loading map cannot shift the page.
    //
    // `grayscale` is the one non-obvious class here: a Google embed is the single most colourful
    // thing that can land on this site, and desaturating it is what keeps it reading as a drawing
    // on the page rather than as a widget pasted onto it. It is a static filter, not an animation.
    <div ref={wrapRef} className="relative aspect-[988/450] w-full overflow-clip rounded-card bg-hairline max-sm:aspect-[4/3]">
      {shouldLoadMap ? (
        <iframe
          title={`Map showing ${address}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0 grayscale"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-edge/40" />
      )}
    </div>
  )
}
