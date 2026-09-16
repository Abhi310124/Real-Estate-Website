import { getFeaturedProjects, getProjects, getSiteSettings } from '@/lib/data'
import { Hero } from '@/components/home/Hero'
import { PillarsStrip } from '@/components/home/PillarsStrip'
import { HorizontalShowcase } from '@/components/home/HorizontalShowcase'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { StatsBand } from '@/components/home/StatsBand'
import { WhyBkr } from '@/components/home/WhyBkr'
import { CtaBand } from '@/components/home/CtaBand'

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
