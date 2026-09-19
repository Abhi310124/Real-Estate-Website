import { Hero } from '@/components/storey/Hero'
import { Manifesto } from '@/components/storey/Manifesto'
import { Expertise } from '@/components/storey/Expertise'
import { StudioStatement } from '@/components/storey/StudioStatement'
import { ProjectsFeature } from '@/components/storey/ProjectsFeature'
import { Testimonial } from '@/components/storey/Testimonial'
import { JournalPreview } from '@/components/storey/JournalPreview'
import { ContactIntake } from '@/components/storey/ContactIntake'
import { getFeaturedProjects, getJournalPosts } from '@/lib/data'

/**
 * The home page, as one long scroll of alternating dark and light chapters.
 *
 * Order and the black/white alternation are both deliberate and match the reference:
 *
 *   Hero              black   (full-bleed photography)
 *   Manifesto         black   (the 3D image ring)
 *   Expertise         white
 *   StudioStatement   black
 *   ProjectsFeature   white
 *   Testimonial       black
 *   JournalPreview    white
 *   ContactIntake     cream
 *   SiteFooter        black   (mounted in app/layout.tsx)
 *
 * Two consecutive navy chapters at the top is intentional — the hero and manifesto read as one
 * continuous dark opening, with the gradient in Manifesto dissolving the seam between them. After
 * that it strictly alternates, which is what gives the scroll its rhythm.
 *
 * `revalidate` stays at 30s: with no Sanity webhook able to reach localhost, this is what lets an
 * owner see a published edit appear.
 */
export const revalidate = 30

export default async function HomePage() {
  const [projects, posts] = await Promise.all([getFeaturedProjects(), getJournalPosts()])

  return (
    <>
      <Hero />
      <Manifesto projects={projects} />
      <Expertise />
      <StudioStatement />
      <ProjectsFeature />
      <Testimonial />
      <JournalPreview posts={posts} />
      <ContactIntake />
    </>
  )
}
