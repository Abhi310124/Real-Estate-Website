import { SoftTriangle } from '@/components/decor/SoftTriangle'
import { RevealImage } from '@/components/motion/RevealImage'
import { Rise } from '@/components/motion/Rise'
import { ScrollRotate } from '@/components/motion/ScrollRotate'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { ValuesTimeline } from '@/components/home/ValuesTimeline'
import { STORIES } from '@/lib/content/home'
import type { SiteSettings } from '@/lib/data/types'

/**
 * The story band: a ghosted two-line heading across the full width (the second line set flush
 * right), the company's story at the statement step beside a tall photograph, and then the values
 * timeline, with a soft triangle turning behind it on the right.
 *
 * The values are the owner's own pillars from settings — Develop, Design, Deliver, the three words on
 * the business card — so this block can never state a value the business has not.
 */

/** "DEVELOP" → "Develop": the pillars are stored in capitals for the card they came from. */
function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function HomeStories({ settings }: { settings: SiteSettings }) {
  const values = settings.pillars.map((p) => ({ title: titleCase(p.title), description: p.description }))

  return (
    <section className="relative overflow-x-clip pb-32 pt-32 max-lg:pb-20 max-lg:pt-20">
      <h2 className="sr-only">Our story</h2>
      {/* Ghosted type is decoration — 1.3:1 by design — so it is hidden from assistive technology and
          the section's real heading is the one above. */}
      <Rise
        as="div"
        aria-hidden="true"
        className="container-page font-heading text-mega font-medium uppercase text-ghost max-lg:text-[64px] max-sm:text-mega-sm"
      >
        <span data-line className="block">
          {STORIES.ghost[0]}
        </span>
        <span data-line className="block text-right">
          {STORIES.ghost[1]}
        </span>
      </Rise>

      <div className="layout-grid mt-24 items-start gap-y-12 max-lg:mt-12">
        <p className="col-span-12 font-heading text-h3 text-secondary max-sm:text-h3-sm lg:col-span-7">
          <span className="block">{STORIES.story.opening}</span>
          <span className="text-accentInk">{STORIES.story.accent}</span>
          {STORIES.story.after}
        </p>
        <Tilt3D className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-5 lg:col-start-8" max={4}>
          <RevealImage
            src={STORIES.image.src}
            alt={STORIES.image.alt}
            sizes="(max-width: 1023px) 90vw, 37vw"
            className="aspect-[532/630] rounded-card"
          />
        </Tilt3D>
      </div>

      <div className="relative mt-16 max-lg:mt-14">
        <ScrollRotate
          turn={180}
          className="absolute right-[-12%] top-[-6%] h-[900px] w-[860px] max-lg:right-[-40%] max-lg:top-[10%] max-lg:h-[460px] max-lg:w-[440px]"
        >
          <SoftTriangle className="h-full w-full rotate-180" />
        </ScrollRotate>
        <ValuesTimeline intro={STORIES.since} title={STORIES.valuesTitle} values={values} />
      </div>
    </section>
  )
}
