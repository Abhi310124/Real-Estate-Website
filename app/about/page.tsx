import { permanentRedirect } from 'next/navigation'

/**
 * `/about` has moved to `/studio`.
 *
 * The redesign renames the practice page to match the reference's nav (Projects · Studio · Journal),
 * so the practice content that used to live here — the three pillars and the Managing Director's note
 * among it — is now on `app/studio/page.tsx`. The route is kept rather than deleted because `/about`
 * has been the published URL: inbound links, bookmarks and any indexed copy of the old page all still
 * point at it, and a 404 would strand them.
 *
 * Nothing inside the site expects content here, and that is worth stating because it is the condition
 * under which a redirect is the right answer rather than a loose end. The header nav and its drawer,
 * the footer's site index and every CTA in `lib/content/home.ts` all address `/studio` directly;
 * `app/sitemap.ts` deliberately omits this URL, since listing a redirect asks a crawler to index a
 * page that only points elsewhere. The three e2e route lists that still name `/about` are exercising
 * the hop itself — they load the redirected page and assert against `/studio`'s markup — so they are
 * evidence the redirect works, not evidence that something still reads this route as a page.
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
