import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllProjectSlugs, getProject, getProjects } from '@/lib/data'
import type { Project } from '@/lib/data/types'
import { RevealImage } from '@/components/motion/RevealImage'
import { Rise } from '@/components/motion/Rise'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { resolvePhoto } from '@/components/project/photo'
import { ProjectTile } from '@/components/projects/ProjectTile'
import { Button } from '@/components/ui/Button'
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
import { SECTION_SCROLL_MT } from '@/components/project/section-anchor'
import { SectionNav } from '@/components/layout/SectionNav'
import { cn } from '@/lib/cn'

// The page's real reading order, top to bottom — the section nav lists exactly what renders, in the
// order it renders. "Master Plan" appears only when project.masterPlan exists: a nav link pointing at
// an anchor with no section would be a broken link, and bkr-skyline-residences (a single tower, no
// plotted layout) is a real published project with no masterPlan.
function sectionsFor(project: Project) {
  return [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    ...(project.masterPlan ? [{ id: 'masterplan', label: 'Master Plan' }] : []),
    { id: 'plans', label: 'Plans' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'updates', label: 'Updates' },
    { id: 'location', label: 'Location' },
  ]
}

// Same fallback/duplication rationale as app/layout.tsx, app/sitemap.ts and app/robots.ts's own
// SITE_URL consts (see app/layout.tsx's comment) — a shared lib/site-url.ts is not worth adding
// for one constant, matching SiteFooter.tsx's own precedent for small, flagged duplication.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

const RUPEES_PER_UNIT: Record<Project['priceUnit'], number> = { Lakh: 1e5, Cr: 1e7 }

// A RealEstateListing wrapping the physical Residence, both real schema.org types. Every field
// traces to a real Project value — nothing here is invented:
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
//
// `image` intentionally uses the project's own `heroImage.url` rather than the photograph the page
// actually renders. `components/project/photo.ts` swaps the fixtures' generated placeholder art for
// real architectural photography at render time, but those photographs are stand-ins of buildings
// BKR INFRA did not build (see public/photography/CREDITS.md) — publishing one as this listing's
// canonical image in structured data would be a claim, not a layout decision.
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

// Does this conflict with generateStaticParams below? No — this is Next's own documented ISR
// pattern for exactly this combination (its App Router guide's canonical example pairs
// `export const revalidate = 60` with a `generateStaticParams()` in the same file). The two
// settings answer different questions: generateStaticParams decides *which* slugs get a
// prerendered HTML file at build time (the published list only, so an owner hiding a project
// removes its static file on the next build); revalidate decides how long each of those
// prerendered files is served before Next regenerates it in the background. A slug requested that
// is *not* in the static list still reaches this page function on demand (Next falls back to
// on-demand rendering for params outside generateStaticParams's list, then caches that result
// too) and getProject()'s own isPublished filter still 404s it via notFound() below — so an
// unpublished or deleted project can never be served stale from either mechanism. In local dev,
// Sanity's webhook has no route to localhost, so the 30s background revalidation is the only path
// to freshness without restarting the dev server or rebuilding.
export const revalidate = 30

// Static params from the published slug list only — an unpublished or unknown slug is never in
// this list, so it is never prerendered and always falls through to the runtime notFound() below
// whenever it is actually requested.
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}

  // Falls back to the project's own tagline/hero image, never to invented copy — both are already
  // real content for this project, just not specifically authored as SEO metadata.
  const ogImage = project.seo?.ogImage ?? project.heroImage
  return {
    title: project.seo?.metaTitle ?? `${project.title} — BKR INFRA`,
    description: project.seo?.metaDescription ?? project.tagline,
    openGraph: {
      images: [{ url: ogImage.url, alt: ogImage.alt }],
    },
  }
}

/**
 * The project detail page, in the order of the layout it follows, with this site's extra sections
 * spliced in where a buyer needs them:
 *
 *   hero · section nav · overview · key figures · amenities (the layout's "key features") ·
 *   master plan (if any) · plans · gallery · specifications · progress on site · brochure (if any) ·
 *   location · the "get in touch" prompt · a closing photograph · the enquiry card · other projects
 *
 * No `<main>` here: app/layout.tsx owns the single `<main id="main">` for every route.
 */
export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const [project, all] = await Promise.all([getProject(slug), getProjects()])

  // getProject() already filters on isPublished, so this one guard covers both an unknown slug and a
  // real-but-unpublished project — neither ever leaks a 200.
  if (!project) notFound()

  // `brochureUrl` is deliberately withheld from every section component below, and this is
  // load-bearing rather than tidiness: several of those sections are client components, and passing
  // `project` into a client component serialises the WHOLE object into the RSC payload inlined in the
  // served HTML — which put the brochure's URL in view-source while the page rendered no link to it,
  // defeating the gate completely. Only scanning the whole served document caught it.
  const hasBrochure = Boolean(project.brochureUrl)
  const projectForSections: Project = { ...project }
  delete projectForSections.brochureUrl

  const closing = resolvePhoto(project.gallery[2] ?? project.gallery[0] ?? project.heroImage, 2)
  const others = all.filter((p) => p.slug !== project.slug).slice(0, 3)

  return (
    <>
      {/* Real project fields only — see projectJsonLd's own comment. */}
      <script
        type="application/ld+json"
        // The standard Next.js JSON-LD pattern: rendering the JSON as a text child would have React
        // escape its quotes. The payload is JSON.stringify() of our own server-side data, never input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(project, SITE_URL)) }}
      />
      <ProjectHero project={projectForSections} />
      <SectionNav sections={sectionsFor(projectForSections)} />
      <Overview project={projectForSections} />
      <KeyStats project={projectForSections} />
      <Amenities project={projectForSections} />
      {projectForSections.masterPlan && <MasterPlan plan={projectForSections.masterPlan} />}
      <PlansTabs project={projectForSections} />
      <GallerySwiper project={projectForSections} />
      <Specifications project={projectForSections} />
      <ConstructionTimeline project={projectForSections} />
      {/* Only where a brochure actually exists — a gate that captures a lead and then has nothing to
          hand back would be a bait-and-switch. */}
      {hasBrochure && <BrochureGate projectSlug={project.slug} projectTitle={project.title} />}
      <Connectivity project={projectForSections} />

      <section className="layout-grid pb-24 max-lg:pb-16" aria-label="Get in touch">
        <div className="col-span-12 lg:col-span-9 lg:col-start-4">
          <p className="font-heading text-lede text-secondary max-sm:text-lede-sm">
            Ask us anything about {project.title}, or book a visit to the site — the people who answer are the
            people building it.
          </p>
          <Button href="#enquire" chevron={false} className="mt-10 min-w-[280px] max-sm:w-full">
            Contact us
          </Button>
        </div>
      </section>

      <div className="container-page pb-32 max-lg:pb-20">
        <Tilt3D max={2} perspective={2200}>
          <RevealImage
            src={closing.url}
            alt={closing.alt}
            sizes="(max-width: 1440px) 100vw, 1344px"
            zoom
            className="aspect-[1344/760] rounded-card max-md:aspect-[4/3]"
          />
        </Tilt3D>
      </div>

      {/* An enquiry form on the project page itself, not only on /contact: this is the page a buyer
          is on when they decide they are interested, and making them navigate away is where enquiries
          get lost. `projectSlug` travels with the lead so the follow-up call knows the development. */}
      <section id="enquire" className={cn('container-page pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
        <Rise as="h2" className="text-center font-heading text-h2 text-secondary max-sm:text-h2-sm">
          Get in touch
        </Rise>
        <EnquiryForm source="enquiry" projectSlug={project.slug} queryTypes className="mx-auto mt-10 max-w-[480px]" />
      </section>

      {others.length > 0 && (
        <section className="pb-32 max-lg:pb-20" aria-labelledby="other-projects">
          <Rise as="h2" id="other-projects" className="container-page text-center font-heading text-h2 text-secondary max-sm:text-h2-sm">
            Other projects you may be interested in
          </Rise>
          <div className="layout-grid mt-12 gap-y-12">
            {others.map((other) => (
              <ProjectTile
                key={other.id}
                project={other}
                aspect="aspect-[416/256]"
                compact
                sizes="(max-width: 767px) 100vw, 33vw"
                className="col-span-12 md:col-span-6 lg:col-span-4"
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
