import { getSiteSettings } from '@/lib/data'
import { Hero } from '@/components/home/Hero'
import { PillarsStrip } from '@/components/home/PillarsStrip'

// Ruling 6: the <main id="main"> wrapper that used to live here now lives once, in
// app/layout.tsx, wrapping every page's {children} — this component renders only its own
// content.
//
// Ruling 7: Hero now owns the page's one and only <h1> (it renders SplitWords internally,
// text = settings.tagline) — the standalone SplitWords h1 that used to live here directly
// has been absorbed into Hero, not duplicated alongside it.
export default async function HomePage() {
  const settings = await getSiteSettings()
  return (
    <>
      <Hero settings={settings} />
      <PillarsStrip settings={settings} />
    </>
  )
}
