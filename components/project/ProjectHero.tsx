import Image from 'next/image'
import { HeroDepth } from '@/components/motion/HeroDepth'
import { resolvePhoto } from './photo'
import { STATUS_LABELS, formatPrice } from '@/lib/format'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * A project's opening screen, as the layout sets it: the photograph full-bleed under the header, a navy
 * wash rising from the foot, the project's name at the 104px step over two lines at the bottom left,
 * the locality beneath it, and a round "scroll down" disc at the bottom right.
 *
 * Under the locality sits one line the reference does not have: status, price and the RERA number.
 * The price is what a buyer came for, and the registration must be displayed — so both are on the
 * first screen, in plain sight, rather than a scroll away.
 *
 * The photograph is the LCP element, so it is a preloaded `next/image` at `100vw`. As the section
 * scrolls away it sinks and zooms slightly behind the copy (`HeroDepth`), the one piece of 3D here.
 */
export function ProjectHero({ project }: Props) {
  const hero = resolvePhoto(project.heroImage)
  const facts = [
    STATUS_LABELS[project.status],
    formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest),
    project.reraNumber ? `TS RERA ${project.reraNumber}` : null,
  ].filter(Boolean)

  return (
    <section
      data-project-hero
      className="relative h-[calc(100svh-var(--header-h))] min-h-[600px] w-full overflow-clip bg-secondary text-primary"
    >
      <HeroDepth className="absolute inset-0">
        <Image src={hero.url} alt={hero.alt} fill preload sizes="100vw" className="object-cover" />
      </HeroDepth>
      {/* A gradient, not a flat wash: the copy only needs protecting at the bottom. */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent" />

      <div className="container-page absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 pb-14 max-lg:pb-10">
        <div className="max-w-[900px]">
          <p className="text-small text-primary">{project.tagline}</p>
          <h1 className="mt-3 font-heading text-hero text-primary max-lg:text-[64px] max-sm:text-hero-sm">{project.title}</h1>
          <p className="mt-4 text-body text-primary">
            {project.location.area}, {project.location.city}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-small text-primary/80">
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </p>
        </div>

        <a
          href="#overview"
          aria-label="Scroll to the project overview"
          className="group flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-secondary transition-colors duration-300 hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary max-sm:h-12 max-sm:w-12"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5">
            <path d="M8 2.5v11M3.5 9 8 13.5 12.5 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
