import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// /admin is the embedded Sanity Studio (`app/admin/[[...tool]]/page.tsx`) — an owner-only editing
// surface with no reason to ever appear in search results. It is `/admin` and no longer `/studio`
// because the redesign gives `/studio` to the public practice page, which very much DOES want to
// be indexed; disallowing `/studio` here would now hide a real page from search.
// /motion-lab (the development harness — see its own file comment) is disallowed for the original
// reason: a real, reachable route, but not a page any visitor was meant to land on from a search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/motion-lab'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
