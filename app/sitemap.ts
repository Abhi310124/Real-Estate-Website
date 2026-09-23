import type { MetadataRoute } from 'next'
import { getAllJournalSlugs, getAllProjectSlugs } from '@/lib/data'

// Same fallback as app/layout.tsx's metadataBase (see the comment there) — duplicated rather
// than factored into a shared lib module, matching this codebase's own precedent in
// SiteFooter.tsx's link-list comment: a brief that scopes specific files, reaching into a new
// unlisted file for one shared constant would widen the diff for a minor DRY gain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// Static routes only.
//
// `/about` and `/blog` are the pages; `/studio` and `/journal` (their previous names) are absent
// because they are now permanent redirects (see `redirects()` in next.config.ts), and listing a
// redirect in a sitemap asks crawlers to index a URL that only ever points elsewhere.
//
// Two routes are deliberately absent and always will be: `/motion-lab` (a development harness) and
// `/admin` (the embedded Sanity Studio). Both are also `Disallow`ed in robots.ts — the sitemap is
// the invitation, robots.txt is the refusal, and a route that should never be indexed needs both.
//
// `/legal/*` is absent for a third reason, which is temporary: those three pages exist so the
// footer's links resolve, but they say the documents are still being finalised rather than carrying
// policy text nobody has reviewed. They each set `robots: noindex` for the same reason. Add them
// here once the real text lands — an indexed page headed "Privacy policy" that does not state a
// policy is worse than one search cannot find.
//
// getAllProjectSlugs() and getAllJournalSlugs() already filter to published records (see the
// `published()` / `publishedPosts()` helpers in lib/data/mock.ts and the same gating in the Sanity
// queries), so hiding a project or a post removes it from the sitemap for free rather than by any
// extra logic here.
const STATIC_ROUTES = ['', '/about', '/projects', '/blog', '/contact']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projectSlugs, journalSlugs] = await Promise.all([getAllProjectSlugs(), getAllJournalSlugs()])

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
    })),
    ...projectSlugs.map((slug) => ({
      url: `${SITE_URL}/projects/${slug}`,
      lastModified: new Date(),
    })),
    ...journalSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: new Date(),
    })),
  ]
}
