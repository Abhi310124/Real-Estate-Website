import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Ruling 9: /studio (Task 19's embedded Sanity CMS, not yet built) is disallowed ahead of its
// own arrival — an owner-only editing surface with no reason to ever appear in search results.
// Ruling 11: /motion-lab (the Task 5 development harness — see its own file comment) is
// disallowed for the same reason: it is a real, reachable route, but not a page any visitor was
// ever meant to land on from a search result.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/motion-lab'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
