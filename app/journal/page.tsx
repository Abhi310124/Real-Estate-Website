import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/PageShell'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { JournalGrid } from '@/components/journal/JournalGrid'
import { getJournalPosts } from '@/lib/data'

// Its own unique title, over 10 characters, distinct from every other route's and from the site
// default in app/layout.tsx. The description summarises the posts that actually exist — material in
// a warm climate, plans that open and close, reading a site before drawing on it — rather than
// claiming a publishing cadence or a body of work that is not there.
export const metadata: Metadata = {
  title: 'Journal — Notes on Material, Site and Long-Term Living',
  description:
    'Short pieces from BKR INFRA on designing homes for their second decade: materials that age well in a warm climate, plans that open and close, and reading a site before drawing on it.',
}

// Matches every other route: 30s background revalidation is what lets an owner see a published edit
// appear, since a Sanity webhook has no route to localhost in development.
export const revalidate = 30

// PageShell owns the clearance under the fixed header (see its own comment), which is why this page
// uses it rather than hand-rolling a top offset. Its horizontal container is neutralised, though:
// the design has no max-width containers anywhere, because every section being a `.layout-grid`
// padded by `--margin` is exactly what keeps the page aligned to the same column edges as the
// header and footer. Centring this one route inside 80rem would put its heading on a different
// left edge from the wordmark directly above it.
//
// The overrides are `!`-important rather than plain classes because `lib/cn.ts` is a plain join with
// no tailwind-merge: `max-w-none` and `max-w-7xl` would both survive into the class list, and which
// one wins would be decided by Tailwind's stylesheet order rather than by the order here.
export default async function JournalPage() {
  const posts = await getJournalPosts()

  return (
    <PageShell className="!max-w-none !px-0">
      <div className="layout-grid items-end">
        <h1 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          Notes on material, site and the long term
        </h1>
        <p className="col-span-12 mt-[3vw] text-body text-muted max-sm:mt-[6vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10 sm:mt-0">
          Written as projects are drawn and built — on climate, plan, material and place.
        </p>
      </div>

      <div className="layout-grid mt-[4vw] max-sm:mt-[10vw]">
        <RuleDraw className="col-span-12 text-edge" />
      </div>

      {/* getJournalPosts() returns published posts only, newest first, so an owner hiding a post
          removes it here with no filtering of our own. An empty result is a real state (nothing
          published yet), and a page that renders a heading over blank space looks broken rather
          than empty — so say so in one line instead. */}
      {posts.length > 0 ? (
        <JournalGrid posts={posts} />
      ) : (
        <div className="layout-grid mt-[8vw] max-sm:mt-[14vw]">
          <p className="col-span-12 text-body text-muted max-sm:text-body-sm sm:col-span-6">
            No posts have been published yet.
          </p>
        </div>
      )}
    </PageShell>
  )
}
