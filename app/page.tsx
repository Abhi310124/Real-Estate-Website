import { getFeaturedProjects, getSiteSettings } from '@/lib/data'
import { Hero } from '@/components/home/Hero'
import { PillarsStrip } from '@/components/home/PillarsStrip'
import { HorizontalShowcase } from '@/components/home/HorizontalShowcase'

// Ruling 6: the <main id="main"> wrapper that used to live here now lives once, in
// app/layout.tsx, wrapping every page's {children} — this component renders only its own
// content.
//
// Ruling 7: Hero now owns the page's one and only <h1> (it renders SplitWords internally,
// text = settings.tagline) — the standalone SplitWords h1 that used to live here directly
// has been absorbed into Hero, not duplicated alongside it.
export default async function HomePage() {
  // Fetched in parallel rather than sequentially awaited: the two reads are independent, and
  // this page is already the entry point for both of them.
  const [settings, featured] = await Promise.all([getSiteSettings(), getFeaturedProjects()])
  return (
    <>
      <Hero settings={settings} />
      <PillarsStrip settings={settings} />
      <HorizontalShowcase projects={featured} />
    </>
  )
}
