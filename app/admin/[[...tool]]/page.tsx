import { NextStudio } from 'next-sanity/studio'

import config from '../../../sanity.config'

export { metadata, viewport } from 'next-sanity/studio'

/*
 * The embedded Sanity Studio — the owner's editing surface — lives at `/admin`.
 *
 * It used to sit at `/studio`, which the redesign reclaims for the public practice page: the
 * reference's nav reads Projects · Studio · Journal, where "Studio" is the page about the practice
 * itself. A visitor clicking "Studio" must land on that page, not on a CMS login, so the CMS moved
 * and the public URL won.
 *
 * Three things have to agree on this path or the Studio breaks in ways that are not obvious:
 * this route's folder, `basePath` in `sanity.config.ts`, and the `Disallow` line in `app/robots.ts`.
 * A mismatch between the first two leaves the Studio loading and then rewriting the URL to a 404.
 *
 * The Studio is a client-rendered SPA behind this one catch-all route — there is nothing for
 * Next.js to server-render per sub-path, so `force-static` avoids Next trying (and failing) to
 * treat /admin/[[...tool]] as a dynamic data-fetching route.
 */
export const dynamic = 'force-static'

export default function AdminStudioPage() {
  return <NextStudio config={config} />
}
