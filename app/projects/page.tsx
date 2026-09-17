import type { Metadata } from 'next'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FilterBar } from '@/components/projects/FilterBar'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { getProjects, getSiteSettings } from '@/lib/data'
import type { ProjectCategory, ProjectStatus } from '@/lib/data/types'
import { PageShell } from '@/components/layout/PageShell'

const CATEGORIES: ProjectCategory[] = ['open-plots', 'villas', 'apartments', 'independent-houses', 'developers']
const STATUSES: ProjectStatus[] = ['upcoming', 'ongoing', 'completed', 'sold-out']

function parseCategory(value: string | undefined): ProjectCategory | undefined {
  return value !== undefined && (CATEGORIES as string[]).includes(value) ? (value as ProjectCategory) : undefined
}

function parseStatus(value: string | undefined): ProjectStatus | undefined {
  return value !== undefined && (STATUSES as string[]).includes(value) ? (value as ProjectStatus) : undefined
}

// Task 23 (Ruling 11): its own unique, >10-character title. One static title for every
// ?category=/?status= combination — the filters change which published projects render, not
// what the route fundamentally is, so a single description already covers every combination
// truthfully without enumerating each category/status pair.
export const metadata: Metadata = {
  title: 'Our Projects — Open Plots, Villas and Apartments | BKR INFRA',
  description:
    'Browse every BKR INFRA development across Hyderabad: open plots, villas, apartments, independent houses and developer partnerships, filterable by category or status.',
}

type Props = {
  searchParams: Promise<{ category?: string; status?: string }>
}

// Task 13 replaces Ruling 1's minimal placeholder. No <main> here: app/layout.tsx owns the
// single <main id="main"> for every route (Ruling 6). Next 16 hands `searchParams` in as a
// Promise with no synchronous compatibility mode, so it must be awaited — same contract as
// `params` in app/projects/[slug]/page.tsx.
//
// Filtering happens here, server-side, on a plain GET with the filters carried entirely in the
// URL — not in a client component reading useSearchParams() — because that keeps results
// indexable (a crawler sees the real filtered HTML for `/projects?category=villas`, not an
// empty shell that only fills in client-side) and makes every deep link a genuine, shareable
// page rather than client state reconstructed after the fact.
export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = parseCategory(params.category)
  const status = parseStatus(params.status)

  const [projects, settings] = await Promise.all([getProjects({ category, status }), getSiteSettings()])

  return (
    <PageShell>
      <Eyebrow className="text-navy-700">Our Portfolio</Eyebrow>
      <h1 className="mt-3 font-display-expanded text-display-lg text-navy-800">
        Every BKR INFRA development
      </h1>
      <p className="mt-4 max-w-2xl text-body text-navy-700">
        Open plots, villas, apartments, independent houses and developer partnerships across
        Hyderabad — filter by category or status to find the one that fits.
      </p>

      <div className="mt-10">
        <FilterBar categories={settings.categories} active={{ category, status }} />
      </div>

      <ProjectGrid projects={projects} />
    </PageShell>
  )
}
