import { getFeaturedProjects, getProjects, getSiteSettings } from '@/lib/data'
import type { SiteSettings } from '@/lib/data/types'
import { Hero } from '@/components/home/Hero'
import { PillarsStrip } from '@/components/home/PillarsStrip'
import { HorizontalShowcase } from '@/components/home/HorizontalShowcase'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { StatsBand } from '@/components/home/StatsBand'
import { WhyBkr } from '@/components/home/WhyBkr'
import { CtaBand } from '@/components/home/CtaBand'

// Ruling 11 (Task 20): this page has no dynamic params and no request-time API calls
// (searchParams/cookies/headers), so it is otherwise a plain static page — Next prerenders it
// once at build time and would serve that same HTML forever. Adding `revalidate` turns that into
// ISR: still served from the static cache on every request, but Next revalidates it in the
// background at most once every 30 seconds, and sanity/lib/queries.ts's `next: { tags: [...] } }`
// fetch tags let app/api/revalidate/route.ts force that sooner the moment an editor publishes a
// change. In local dev, Sanity's webhook has no way to reach localhost, so the 30s poll is the
// only path to freshness here — see the report for how this was verified.
export const revalidate = 30

// Same fallback/duplication rationale as app/layout.tsx's own SITE_URL (see its comment).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

// The home page inherits app/layout.tsx's title/description metadata unchanged — Ruling 12
// there is additive-only, and this page never had its own `metadata` export to begin with, so
// there is nothing to add here beyond the JSON-LD below.

// Task 23's plan calls for "Organization + LocalBusiness on the home page" by name; combined into
// one block via an array @type rather than two separate <script> tags, since LocalBusiness is
// already an Organization subtype in schema.org's own hierarchy and every field below is true of
// both. Every field is a real, already-verified fact from MOCK_SETTINGS — phones, address and
// email/socials mirror Footer.tsx's own conditional rendering (Ruling 5): email/sameAs are only
// present once a real value exists, never a placeholder. `logo` points at app/icon.svg, the
// site's own real favicon asset, not a new file.
function organizationJsonLd(settings: SiteSettings, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${baseUrl}/#organization`,
    name: 'BKR INFRA',
    description: settings.footerBlurb,
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
    },
    contactPoint: settings.phones.map((phone) => ({
      '@type': 'ContactPoint',
      telephone: phone,
      contactType: 'sales',
      areaServed: 'IN',
    })),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.socials.length > 0 ? { sameAs: settings.socials.map((s) => s.url) } : {}),
  }
}

// Ruling 6: the <main id="main"> wrapper that used to live here now lives once, in
// app/layout.tsx, wrapping every page's {children} — this component renders only its own
// content.
//
// Ruling 7: Hero now owns the page's one and only <h1> (it renders SplitWords internally,
// text = settings.tagline) — the standalone SplitWords h1 that used to live here directly
// has been absorbed into Hero, not duplicated alongside it.
//
// Task 12 (Ruling 5): purely additive — Hero, PillarsStrip and HorizontalShowcase above are
// untouched, and there is still no second <main>. Four new chapters follow the showcase, keeping
// the approved rhythm: hero(navy) -> pillars(navy) -> showcase(ivory) -> categories(ivory) ->
// stats(navy) -> cta(navy) -> footer(navy-900, rendered by layout.tsx outside this page).
export default async function HomePage() {
  // Fetched in parallel rather than sequentially awaited: the reads are independent, and this
  // page is already the entry point for all of them. `getProjects()` (every published project,
  // unfiltered) is new here — CategoryGrid uses it to find one representative image per category;
  // see the comment on `representativeImage` in components/home/CategoryGrid.tsx for why.
  const [settings, featured, allProjects] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getProjects(),
  ])
  return (
    <>
      <script
        type="application/ld+json"
        // Same dangerouslySetInnerHTML rationale as app/projects/[slug]/page.tsx's own JSON-LD
        // script: this is JSON.stringify() of our own server-side settings, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings, SITE_URL)) }}
      />
      <Hero settings={settings} />
      <PillarsStrip settings={settings} />
      <HorizontalShowcase projects={featured} />
      <CategoryGrid categories={settings.categories} projects={allProjects} />
      <StatsBand />
      <WhyBkr />
      <CtaBand settings={settings} />
    </>
  )
}
