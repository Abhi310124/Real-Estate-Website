import { NextStudio } from 'next-sanity/studio'

import config from '../../../sanity.config'

export { metadata, viewport } from 'next-sanity/studio'

// The Studio is a client-rendered SPA behind this one catch-all route — there is nothing for
// Next.js to server-render per sub-path, so force-static avoids Next trying (and failing) to
// treat /studio/[[...tool]] as a dynamic data-fetching route. robots.ts (Task 23) separately
// disallows /studio so it never appears in search results — an owner-only editing surface.
export const dynamic = 'force-static'

export default function StudioPage() {
  return <NextStudio config={config} />
}
