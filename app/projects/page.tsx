import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FilterBar } from '@/components/projects/FilterBar'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { ContactIntake } from '@/components/storey/ContactIntake'
import { getProjects, getSiteSettings } from '@/lib/data'
import type { ProjectCategory, ProjectStatus } from '@/lib/data/types'
import { PageShell } from '@/components/layout/PageShell'

// This page reads `searchParams` (below), which forces Next to render it dynamically on every
// request — there is no static HTML shell for `revalidate` to put an ISR lifetime on, so this
// export does *not* turn this route into ISR the way it does on app/page.tsx and
// app/projects/[slug]/page.tsx. What it does still do: set the default cache lifetime for any
// `fetch()` call in this render that does not specify its own `next.revalidate` — which covers
// getProjects()/getSiteSettings() below, since sanity/lib/queries.ts's fetches only set
// `next.tags`, not their own `next.revalidate`. Kept for that reason, and for consistency with the
// other two routes, not because it makes this particular page static.
export const revalidate = 30

const CATEGORIES: ProjectCategory[] = ['open-plots', 'villas', 'apartments', 'independent-houses', 'developers']
const STATUSES: ProjectStatus[] = ['upcoming', 'ongoing', 'completed', 'sold-out']

function parseCategory(value: string | undefined): ProjectCategory | undefined {
  return value !== undefined && (CATEGORIES as string[]).includes(value) ? (value as ProjectCategory) : undefined
}

function parseStatus(value: string | undefined): ProjectStatus | undefined {
  return value !== undefined && (STATUSES as string[]).includes(value) ? (value as ProjectStatus) : undefined
}

// Its own unique, >10-character title. One static title for every ?category=/?status=
// combination — the filters change which published projects render, not what the route
// fundamentally is, so a single description already covers every combination truthfully without
// enumerating each category/status pair.
export const metadata: Metadata = {
  title: 'Our Projects — Open Plots, Villas and Apartments | BKR INFRA',
  description:
    'Browse every BKR INFRA development across Hyderabad: open plots, villas, apartments, independent houses and developer partnerships, filterable by category or status.',
}

type Props = {
  searchParams: Promise<{ category?: string; status?: string }>
}

// No <main> here: app/layout.tsx owns the single <main id="main"> for every route. Next 16 hands
// `searchParams` in as a Promise with no synchronous compatibility mode, so it must be awaited —
// same contract as `params` in app/projects/[slug]/page.tsx.
//
// Filtering happens here, server-side, on a plain GET with the filters carried entirely in the
// URL — not in a client component reading useSearchParams() — because that keeps results
// indexable (a crawler sees the real filtered HTML for `/projects?category=villas`, not an
// empty shell that only fills in client-side) and makes every deep link a genuine, shareable
// page rather than client state reconstructed after the fact.
//
// The masthead is the reference's listing register: mono eyebrow, one `display-lg` line, and the
// standfirst pushed out to the last four columns instead of sitting under the heading in a
// `max-w-2xl` measure. The heading is held to eight columns so the standfirst has somewhere to be
// — that column split is what makes the top of the page read as a masthead rather than as a title
// with a subtitle.
//
// `PageShell` is now nothing but the opening clearance, so this route renders on the same full-bleed
// `.layout-grid` as the header above it and the footer below it — x=20 w=1400 at 1440, the one set
// of column edges everything on the site is aligned to. It used to inherit PageShell's centred
// `max-w-7xl` container, which pushed every grid inside it to x=120 w=1200 and left the listing
// running 140..1300 between a header and a footer running 20..1420.
//
// `<ContactIntake/>` outside the shell, not inside it: the reference closes all three of its
// interior routes with this block and it butts straight into the footer, so the shell is `flush` and
// the only gap is the intake section's own `mt-[20vw]` approach margin. `/contact` keeps the same
// form as a standalone route for direct links; this is the same component, mounted whole, not a
// second copy of it.
export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = parseCategory(params.category)
  const status = parseStatus(params.status)

  const [projects, settings] = await Promise.all([getProjects({ category, status }), getSiteSettings()])

  return (
    <>
      <PageShell flush>
        <div className="layout-grid items-end">
          <div className="col-span-12 sm:col-span-8">
            <Eyebrow>Our Portfolio</Eyebrow>
            <h1 className="mt-[1.2vw] text-display-lg font-display max-sm:mt-[4vw] max-sm:text-display-sm-lg">
              Every BKR INFRA development
            </h1>
          </div>
          <p className="col-span-12 mt-[3vw] text-body text-muted max-sm:mt-[6vw] max-sm:text-body-sm sm:col-span-4 sm:mt-0">
            Open plots, villas, apartments, independent houses and developer partnerships across
            Hyderabad — filter by category or status to find the one that fits.
          </p>
        </div>

        <div className="layout-grid mt-[6vw] max-sm:mt-[12vw]">
          <div className="col-span-12">
            <FilterBar categories={settings.categories} active={{ category, status }} />
          </div>
        </div>

        <ProjectGrid projects={projects} />
      </PageShell>

      {/* The stamp row's one fact comes from `getSiteSettings()`, which this route already awaited
          for the filter bar — the intake is a client component and cannot read the data source
          itself, and it prints nothing there rather than inventing a number. */}
      <ContactIntake contact={settings.phones[0]} />
    </>
  )
}
