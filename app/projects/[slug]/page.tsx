import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllProjectSlugs, getProject } from '@/lib/data'
import type { Project } from '@/lib/data/types'
import { ProjectHero } from '@/components/project/ProjectHero'
import { Overview } from '@/components/project/Overview'
import { KeyStats } from '@/components/project/KeyStats'
import { MasterPlan } from '@/components/project/MasterPlan'
import { PlansTabs } from '@/components/project/PlansTabs'
import { GallerySwiper } from '@/components/project/GallerySwiper'
import { Amenities } from '@/components/project/Amenities'
import { Specifications } from '@/components/project/Specifications'
import { ConstructionTimeline } from '@/components/project/ConstructionTimeline'
import { Connectivity } from '@/components/project/Connectivity'
import { SectionNav } from '@/components/layout/SectionNav'

// Order here is the page's real reading order top to bottom: overview -> plans ->
// gallery -> amenities -> specifications -> updates -> location, matching a typical
// sales-page narrative (what it is, then proof, then where). "Master Plan" is spliced in
// right after "Overview" — matching where <MasterPlan> actually renders, between
// <KeyStats> and <PlansTabs> — but only when project.masterPlan exists: a nav link
// pointing at an anchor with no matching section would be a broken link, and
// bkr-skyline-residences (a single tower, no plotted layout) is a real published
// project with no masterPlan.
function sectionsFor(project: Project) {
  return [
    { id: 'overview', label: 'Overview' },
    ...(project.masterPlan ? [{ id: 'masterplan', label: 'Master Plan' }] : []),
    { id: 'plans', label: 'Plans' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'updates', label: 'Updates' },
    { id: 'location', label: 'Location' },
  ]
}

type Props = { params: Promise<{ slug: string }> }

// Static params from the published slug list only — an unpublished or unknown slug is
// never in this list, so it is never prerendered and always falls through to the
// runtime notFound() below whenever it is actually requested.
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}

  // Falls back to the project's own tagline/hero image, never to invented copy — both
  // are already real content for this project, just not specifically authored as SEO
  // metadata.
  const ogImage = project.seo?.ogImage ?? project.heroImage
  return {
    title: project.seo?.metaTitle ?? `${project.title} — BKR INFRA`,
    description: project.seo?.metaDescription ?? project.tagline,
    openGraph: {
      images: [{ url: ogImage.url, alt: ogImage.alt }],
    },
  }
}

// Ruling 1: no <main> here (app/layout.tsx owns the single <main id="main"> for every
// route) and no PageShell either — ProjectHero is full-bleed like the home hero, and
// PageShell's pt-36 exists specifically for pages that do *not* handle their own top
// clearance. This page does, the same way app/page.tsx's Hero does.
//
// Next 16 hands `params` in as a Promise with no synchronous compatibility mode, so it
// must be awaited — same contract as app/projects/page.tsx's `searchParams`.
export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)

  // getProject() already filters on isPublished (lib/data/mock.ts's published()
  // helper), so this one guard covers both an unknown slug and a real-but-unpublished
  // project — neither ever leaks a 200.
  if (!project) notFound()

  return (
    <>
      <ProjectHero project={project} />
      <SectionNav sections={sectionsFor(project)} />
      <Overview project={project} />
      <KeyStats project={project} />
      {project.masterPlan && <MasterPlan plan={project.masterPlan} />}
      <PlansTabs project={project} />
      <GallerySwiper project={project} />
      <Amenities project={project} />
      <Specifications project={project} />
      <ConstructionTimeline project={project} />
      <Connectivity project={project} />
    </>
  )
}
