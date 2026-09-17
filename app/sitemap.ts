import type { MetadataRoute } from 'next'
import { getAllProjectSlugs } from '@/lib/data'

// Same fallback as app/layout.tsx's metadataBase (see the comment there) — duplicated rather
// than factored into a shared lib module, matching this codebase's own precedent in
// Footer.tsx's PRIMARY_LINKS comment: a brief that scopes specific files, reaching into a new
// unlisted file for one shared constant would widen the diff for a minor DRY gain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Static routes only — /motion-lab is a development harness (see its own file comment) and is
// deliberately never listed here, and /studio (Task 19, not yet built) never will be either:
// both are kept out of the index by robots.ts instead. getAllProjectSlugs() already filters to
// isPublished projects (lib/data/mock.ts's published() helper), so an unpublished project is
// excluded for free, not by any extra logic here.
const STATIC_ROUTES = ['', '/projects', '/about', '/contact']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProjectSlugs()

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
    })),
    ...slugs.map((slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      lastModified: new Date(),
    })),
  ]
}
