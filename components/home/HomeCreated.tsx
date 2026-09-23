import { Rise } from '@/components/motion/Rise'
import { ProjectTile } from '@/components/projects/ProjectTile'
import { Button } from '@/components/ui/Button'
import { CREATED } from '@/lib/content/home'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * "What we're building": the portfolio as a 2×2 of project cards under a centred heading, closed by
 * the filled pill to the full listing — the layout's "What we've created" block.
 */
export function HomeCreated({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) return null

  return (
    <section className="pb-24 pt-32 max-lg:pb-16 max-lg:pt-20">
      <Rise as="h2" className="container-page text-center font-heading text-h2 text-secondary max-sm:text-h2-sm">
        {CREATED.title}
      </Rise>

      <div className="layout-grid mt-16 gap-y-16 max-lg:mt-10 max-lg:gap-y-12">
        {projects.map((project) => (
          <ProjectTile key={project.id} project={project} className="col-span-12 md:col-span-6" />
        ))}
      </div>

      <div className="mt-16 flex justify-center max-lg:mt-12">
        <Button href={CREATED.cta.href}>{CREATED.cta.label}</Button>
      </div>
    </section>
  )
}
