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
import { BrochureGate } from '@/components/project/BrochureGate'
import { EnquiryForm } from '@/components/project/EnquiryForm'
import { Eyebrow } from '@/components/ui/Eyebrow'
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

// Same fallback/duplication rationale as app/layout.tsx, app/sitemap.ts and app/robots.ts's own
// SITE_URL consts (see app/layout.tsx's comment) — a shared lib/site-url.ts is not worth adding
// for one constant, matching Footer.tsx's own precedent for small, flagged duplication.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const RUPEES_PER_UNIT: Record<Project['priceUnit'], number> = { Lakh: 1e5, Cr: 1e7 }

// Task 23: a RealEstateListing wrapping the physical Residence, both real schema.org types named
// verbatim in the plan. Every field traces to a real Project value — nothing here is invented:
// - image/url are made absolute (schema.org's own guidance for the `image` property) by
//   prefixing the project's own relative paths with SITE_URL, never a new asset.
// - identifier is the project's real, published RERA number.
// - address is plain Text (schema.org permits Text or PostalAddress for `address`) rather than a
//   PostalAddress with `area` force-fit into `addressLocality`/`addressRegion` — area is a
//   locality-within-a-city (e.g. "Kokapet"), not a state/province, and PostalAddress has no clean
//   third tier for that, so a plain "area, city" string says exactly what is true without
//   guessing at a closer-fitting schema.org field.
// - offers is omitted entirely (not asserted with a placeholder) whenever priceOnRequest is true
//   or priceFrom is null — schema.org's Offer.price expects a real decimal in the currency's base
//   unit, so a "starting from" figure with no real number yet must not manufacture one. When a
//   price does exist, it is converted from the UI's Lakh/Cr convention into plain rupees, since
//   that base-unit conversion is arithmetic on a real figure, not a new fact.
function projectJsonLd(project: Project, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.title,
    description: project.tagline,
    url: `${baseUrl}/projects/${project.slug}`,
    image: `${baseUrl}${project.heroImage.url}`,
    identifier: project.reraNumber,
    about: {
      '@type': 'Residence',
      name: project.title,
      address: `${project.location.area}, ${project.location.city}`,
    },
    ...(project.priceOnRequest || project.priceFrom === null
      ? {}
      : {
          offers: {
            '@type': 'Offer',
            price: project.priceFrom * RUPEES_PER_UNIT[project.priceUnit],
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        }),
  }
}

type Props = { params: Promise<{ slug: string }> }

// Ruling 11 (Task 20): does this conflict with generateStaticParams below? No — this is Next's
// own documented ISR pattern for exactly this combination (its App Router guide's canonical
// example pairs `export const revalidate = 60` with a `generateStaticParams()` in the same
// file). The two settings answer different questions: generateStaticParams decides *which*
// slugs get a prerendered HTML file at build time (the published list only, so an owner hiding a
// project removes its static file on the next build); revalidate decides how long each of those
// prerendered files is served before Next regenerates it in the background. A slug requested
// that is *not* in the static list still reaches this page function on demand (Next falls back
// to on-demand rendering for params outside generateStaticParams's list, then caches that result
// too) and getProject()'s own isPublished filter still 404s it via notFound() below — so an
// unpublished or deleted project can never be served stale from either mechanism. In local dev,
// Sanity's webhook has no route to localhost, so the 30s background revalidation is the only
// path to freshness without restarting the dev server or rebuilding.
export const revalidate = 30

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

  // `brochureUrl` is deliberately withheld from every section component below, and this is
  // load-bearing rather than tidiness.
  //
  // Several of those sections are client components (the gallery swiper, the plans tabs, the
  // specifications accordion, the masterplan). Passing `project` into any client component makes
  // Next serialise the WHOLE object into the RSC flight payload, which is inlined into the served
  // HTML — so the brochure's URL was sitting in view-source, readable by anyone, while the page
  // rendered no link to it at all. That defeats the gate completely: the point of BrochureGate is
  // that the PDF is exchanged for a contact detail, not merely left unlinked.
  //
  // The spec's own assertion (`a[href$=".pdf"]` has count 0) passed throughout, because there
  // genuinely is no anchor. Only scanning the whole served document caught it.
  const hasBrochure = Boolean(project.brochureUrl)
  const projectForSections: Project = { ...project }
  delete projectForSections.brochureUrl

  return (
    <>
      {/* Real project fields only — see projectJsonLd's own comment. Sibling to the visible
          content, not a replacement for any of it. */}
      <script
        type="application/ld+json"
        // dangerouslySetInnerHTML is the standard Next.js JSON-LD pattern: rendering the JSON as
        // a text child would have React escape its quotes as HTML entities and corrupt it. The
        // payload is JSON.stringify() of our own server-side data (never user input), so there is
        // no injection risk despite the name.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project, SITE_URL)) }}
      />
      <ProjectHero project={projectForSections} />
      <SectionNav sections={sectionsFor(projectForSections)} />
      <Overview project={projectForSections} />
      <KeyStats project={projectForSections} />
      {projectForSections.masterPlan && <MasterPlan plan={projectForSections.masterPlan} />}
      <PlansTabs project={projectForSections} />
      <GallerySwiper project={projectForSections} />
      <Amenities project={projectForSections} />
      <Specifications project={projectForSections} />
      <ConstructionTimeline project={projectForSections} />
      {/* Only where a brochure actually exists — a gate that captures a lead and then has
          nothing to hand back would be a bait-and-switch. */}
      {hasBrochure && (
        <BrochureGate projectSlug={project.slug} projectTitle={project.title} />
      )}
      <Connectivity project={projectForSections} />

      {/* An enquiry form on the project page itself, not only on /contact: this is the page a
          buyer is on when they decide they are interested, and making them navigate away to ask
          a question is where enquiries get lost. `projectSlug` is passed so the lead records
          which development prompted it, which is what makes the follow-up call useful. */}
      <section id="enquire" className="scroll-mt-[180px] bg-ivory px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Eyebrow className="text-navy-700">Enquire</Eyebrow>
          <h2 className="mt-3 font-display-expanded text-display-md text-navy-800">
            Interested in {project.title}?
          </h2>
          <EnquiryForm
            source="enquiry"
            projectSlug={project.slug}
            intro="Leave your number and a member of our team will call you back — not a call centre."
            className="mt-8"
          />
        </div>
      </section>
    </>
  )
}
