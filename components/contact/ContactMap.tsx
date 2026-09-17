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
    <div ref={wrapRef} className="relative min-h-[320px] overflow-hidden rounded-sm bg-navy-700">
      {shouldLoadMap ? (
        <iframe
          title={`Map showing ${address}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-navy-600" />
      )}
    </div>
  )
}
