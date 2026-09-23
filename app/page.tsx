import { HomeCreated } from '@/components/home/HomeCreated'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeIntro } from '@/components/home/HomeIntro'
import { HomeStatistics } from '@/components/home/HomeStatistics'
import { HomeStories } from '@/components/home/HomeStories'
import { Showcase3D } from '@/components/home/Showcase3D'
import { EnquiryDoors } from '@/components/site/EnquiryDoors'
import { SHOWCASE } from '@/lib/content/home'
import { getFeaturedProjects, getProjects, getSiteSettings } from '@/lib/data'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * The home page, in the order of the layout it follows:
 *
 *   hero            split: headline and the project in focus | the photograph, with the gradient seam
 *   intro           the statement, with the thread dropping through it
 *   showcase        the 3D photographic drum, in the frame the reference gives its film
 *   what we build   the portfolio as a 2×2, and the pill to the listing
 *   statistics      four numbers computed from the portfolio, and the testimonials
 *   stories         the ghosted heading, the story, the values timeline
 *   enquiry         the doors
 *   footer          (app/layout.tsx)
 *
 * `revalidate` stays at 30s: with no Sanity webhook able to reach localhost, this is what lets an
 * owner see a published edit appear.
 */
export const revalidate = 30

/**
 * Four cards for the 2×2. `featured` + `order` is the site's showcase selector, so featured projects
 * lead in the owner's order; if fewer than four are featured the grid is completed from the rest of
 * the published portfolio, in the same order, rather than left with a hole in it.
 */
function portfolio(featured: ProjectSummary[], all: ProjectSummary[], size = 4): ProjectSummary[] {
  const picked = featured.slice(0, size)
  for (const p of all) {
    if (picked.length >= size) break
    if (!picked.some((q) => q.id === p.id)) picked.push(p)
  }
  return picked
}

export default async function HomePage() {
  const [featured, all, settings] = await Promise.all([getFeaturedProjects(), getProjects(), getSiteSettings()])

  return (
    <>
      <HomeHero project={featured[0] ?? all[0]} />
      <HomeIntro />
      <Showcase3D panels={SHOWCASE.panels} label={SHOWCASE.label} hint={SHOWCASE.hint} />
      <HomeCreated projects={portfolio(featured, all)} />
      <HomeStatistics projects={all} />
      <HomeStories settings={settings} />
      <EnquiryDoors />
    </>
  )
}
