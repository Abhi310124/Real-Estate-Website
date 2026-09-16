import Image from 'next/image'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Pill } from '@/components/ui/Pill'
import { Rule } from '@/components/ui/Rule'
import { SplitWords } from '@/components/motion/SplitWords'
import { formatPrice } from '@/lib/format'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * Full-bleed hero for a single project's detail page (Ruling 1) — the same structural
 * convention as `components/home/Hero.tsx` (`min-h-[100svh]`, `items-end`, a raw
 * `next/image` with `priority`+`fill` for the LCP background rather than `ImageReveal`,
 * which starts clipped and would race the first paint, and a navy scrim strong enough
 * that white text over it clears 4.5:1 regardless of the photo underneath), so the
 * header can sit transparently over it exactly as it does on the home page. That only
 * holds because `/projects/<slug>` is listed in `isFullBleedHeroRoute` in
 * `components/layout/Header.tsx` (Ruling 2) — without it the header would paint its own
 * navy background here and double up on the scrim.
 */
export function ProjectHero({ project }: Props) {
  return (
    <section data-project-hero className="relative flex min-h-[100svh] items-end overflow-hidden bg-navy-800">
      <Image
        src={project.heroImage.url}
        alt={project.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Navy scrim: white text over it clears 4.5:1 regardless of what sits underneath —
          same gradient as components/home/Hero.tsx. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/40 to-navy-900/20"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Pill status={project.status} />
          <Eyebrow className="text-champagne">{project.category.replace(/-/g, ' ').toUpperCase()}</Eyebrow>
        </div>

        <SplitWords
          as="h1"
          text={project.title}
          className="mt-5 font-display-expanded text-display-xl text-white"
        />

        <p className="mt-4 text-body-lg text-white/90">
          {project.location.area}, {project.location.city}
        </p>

        <Rule className="mt-6" />

        <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-2">
          <p className="tnum font-display-expanded text-2xl text-white">
            {formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest)}
          </p>
          {project.unitTypes.length > 0 && (
            <p className="text-body text-white/80">{project.unitTypes.join(' · ')}</p>
          )}
        </div>

        {/* RERA display is a legal requirement, not a design choice (master prompt) — kept
            plain and always on-screen rather than in a footnote or tooltip a buyer could miss. */}
        <p className="mt-4 text-caption text-white/70">RERA No. {project.reraNumber}</p>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/60 p-1 motion-safe:animate-bounce">
          <span className="h-2 w-1 rounded-full bg-white/80" />
        </div>
      </div>
    </section>
  )
}
