// Ruling 6: minimal stub — Task 14 replaces this wholesale with the real project detail page.
// It exists now because every showcase card links to `/projects/<slug>` and Next prefetches
// `<Link>` targets, so without a route here every home-page load fills the console with 404s for
// `GET /projects/<slug>?_rsc=...` (already flagged in the Batch C report, then caused by the
// AnnouncementBar's own link).
//
// No <main> here: app/layout.tsx owns the single <main id="main"> for every route, and a second
// one would nest <main> elements and duplicate the `main` DOM id that the skip link targets.
//
// Next 16 hands `params` in as a Promise with no synchronous compatibility mode, so it must be
// awaited. Nothing is fetched from `lib/data` yet on purpose — this renders from the slug alone,
// so it cannot invent a title, price or RERA number for a project that does not exist.

function titleFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => (word === 'bkr' ? 'BKR' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <h1 className="font-display-expanded text-display-lg text-navy-800">{titleFromSlug(slug)}</h1>
      <p className="mt-4 text-body text-navy-700">
        The full details for this development — plans, amenities, specifications and construction
        updates — are being prepared for this page.
      </p>
    </div>
  )
}
