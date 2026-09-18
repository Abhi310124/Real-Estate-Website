import { permanentRedirect } from 'next/navigation'

/**
 * `/about` has moved to `/studio`.
 *
 * The redesign renames the practice page to match the reference's nav (Projects · Studio · Journal),
 * so everything that used to live here — the three pillars, the Managing Director's note, the
 * at-a-glance figures — is now on `app/studio/page.tsx`. The route is kept rather than deleted
 * because `/about` has been the published URL: inbound links, bookmarks and any indexed copy of the
 * old page all still point at it, and a 404 would strand them.
 *
 * `permanentRedirect` (HTTP 308) rather than `redirect` (307): the page has genuinely moved and is
 * not coming back, which is what tells a crawler to transfer the old URL's standing to `/studio`
 * instead of re-checking `/about` forever. Both come from `next/navigation`, and both throw — so
 * nothing below this line ever runs, and this file deliberately renders no markup and exports no
 * metadata (a redirecting page's metadata is generated and then discarded; `/studio` owns the real
 * title and description).
 */
export default function AboutPage() {
  permanentRedirect('/studio')
}
