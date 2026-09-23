'use client'
import { usePathname } from 'next/navigation'

/**
 * `usePathname()`, normalised for the root route.
 *
 * When the home page is prerendered on Vercel its canonical path is recorded as `/index` (visible in
 * the RSC payload as the segments `["", "index"]`), and the router then reports `/index` for the home
 * page — on the server and on the client, until the first navigation. Compared against `/`, that left
 * "Home" unmarked in the header on the live site while it was marked locally. A trailing `/index`
 * segment is folded back onto its parent, so every consumer sees the path the visitor sees.
 */
export function useRoutePath(): string {
  const raw = usePathname() ?? '/'
  return raw.replace(/\/index$/, '') || '/'
}
