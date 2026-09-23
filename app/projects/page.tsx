import type { Metadata } from 'next'
import Link from 'next/link'
import { GradientRule } from '@/components/motion/GradientRule'
import { RevealImage } from '@/components/motion/RevealImage'
import { Rise } from '@/components/motion/Rise'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { resolvePhoto } from '@/components/project/photo'
import { FilterBar } from '@/components/projects/FilterBar'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { EnquiryDoors } from '@/components/site/EnquiryDoors'
import { PageIntro } from '@/components/site/PageIntro'
import { getFeaturedProjects, getProjects, getSiteSettings } from '@/lib/data'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/format'
import type { ProjectCategory, ProjectStatus } from '@/lib/data/types'

// This page reads `searchParams`, which renders it dynamically on every request; `revalidate` here
// sets the default cache lifetime for the data fetches inside the render rather than making the page
// static. Kept for that, and for consistency with the other routes.
export const revalidate = 30

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProjectCategory[]
const STATUSES = Object.keys(STATUS_LABELS) as ProjectStatus[]

function parseCategory(value: string | undefined): ProjectCategory | undefined {
  return value !== undefined && (CATEGORIES as string[]).includes(value) ? (value as ProjectCategory) : undefined
}

function parseStatus(value: string | undefined): ProjectStatus | undefined {
  return value !== undefined && (STATUSES as string[]).includes(value) ? (value as ProjectStatus) : undefined
}

// One static title for every filter combination — the filters change which projects render, not what
// the route is.
export const metadata: Metadata = {
  title: 'Our Projects — Open Plots, Villas and Apartments | BKR INFRA',
  description:
    'Browse every BKR INFRA development across Hyderabad: open plots, villas, apartments, independent houses and developer partnerships, filterable by category or status.',
}

type Props = {
  searchParams: Promise<{ category?: string; status?: string }>
}

/**
 * `/projects`, in the order of the layout it follows: the page intro with a jump link to the listing;
 * "Our latest project" as one full-width plate; a gradient rule; then "Our projects" with the filters
 * and the two-up grid; the doors.
 *
 * Filtering happens here, server-side, on a plain GET with the filters in the URL rather than in
 * client state, so every filtered view is real, indexable HTML and every deep link is a genuine page.
 * The feature always shows the owner's first featured project — it is the page's masthead, not a
 * search result, so it does not change with the filters.
 */
export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const category = parseCategory(params.category)
  const status = parseStatus(params.status)

  const [projects, featured, settings] = await Promise.all([
    getProjects({ category, status }),
    getFeaturedProjects(),
    getSiteSettings(),
  ])
  const latest = featured[0]
  const latestImage = latest ? resolvePhoto(latest.heroImage) : undefined

  return (
    <>
      <PageIntro
        crumb="Projects"
        lines={[{ accent: 'Land and homes', after: ', laid out' }, 'across Hyderabad']}
        aside={
          <Link
            href="#our-projects"
            className="font-heading text-h4 text-secondary transition-colors duration-300 hover:text-accentInk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary max-sm:text-body"
          >
            View all projects
          </Link>
        }
      />

      {latest && latestImage && (
        <section className="container-page mt-36 max-lg:mt-16" aria-labelledby="latest-heading">
          <Rise as="h2" id="latest-heading" className="font-heading text-h2 text-secondary max-sm:text-h2-sm">
            Our latest project
          </Rise>
          <Link
            href={`/projects/${latest.slug}`}
            className="group mt-8 block rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-heading text-h4 text-secondary max-sm:text-h4-sm">{latest.title}</p>
                <p className="mt-1 text-body text-muted">
                  {latest.location.area}, {latest.location.city}
                </p>
              </div>
              <p className="text-right text-body text-muted max-sm:text-small">
                <span className="block">{CATEGORY_LABELS[latest.category]}</span>
                <span className="block">{STATUS_LABELS[latest.status]}</span>
              </p>
            </div>
            <Tilt3D className="mt-8" max={2} perspective={2000}>
              <RevealImage
                src={latestImage.url}
                alt={latestImage.alt}
                sizes="(max-width: 1440px) 100vw, 1344px"
                zoom
                className="aspect-[1344/768] rounded-card max-md:aspect-[4/3]"
              />
            </Tilt3D>
          </Link>
        </section>
      )}

      <div className="container-page mt-24 flex justify-center max-lg:mt-16">
        <GradientRule className="max-w-[556px]" />
      </div>

      <section id="our-projects" className="scroll-mt-[calc(var(--header-h)+24px)] pb-16 pt-24 max-lg:pt-16" aria-labelledby="all-heading">
        <div className="container-page">
          <Rise as="h2" id="all-heading" className="font-heading text-h2 text-secondary max-sm:text-h2-sm">
            Our projects
          </Rise>
          <div className="mt-10">
            <FilterBar categories={settings.categories} active={{ category, status }} />
          </div>
        </div>
        <ProjectGrid projects={projects} />
      </section>

      <EnquiryDoors />
    </>
  )
}
