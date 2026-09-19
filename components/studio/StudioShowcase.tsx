import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { resolvePhoto } from '@/components/project/photo'
import { STUDIO_SHOWCASE } from '@/lib/content/studio'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * Cream chapter: two real projects as flush-aligned plates, then one closing frame.
 *
 * ## The pair is flush-aligned and the frames carry the asymmetry
 *
 * Both plates start at the same y and all of the difference is in their shapes — `aspect-[115/168]`
 * beside `aspect-[115/96]`, which at a 690px column is 1008px against 576px. Written as ratios rather
 * than heights so the proportion survives a change of viewport. Pushing the second column down to
 * "break the grid" is the obvious move and it is wrong here: once one frame is 432px taller than its
 * partner, an offset on top of that difference stops reading as composition and starts reading as a
 * mistake. Same rule, same reasoning as `components/storey/ProjectsFeature.tsx`, which is the home
 * page's version of this row.
 *
 * Mobile does not inherit the desktop proportion. A 115/168 frame at `col-span-12` is 134vw tall —
 * most of a phone screen of one photograph — so both take shallower fixed crops instead.
 *
 * ## The projects are real and the third frame is not
 *
 * The two plates come from `getFeaturedProjects()`, so the title, the locality and the link are CMS
 * facts. Nothing here states a price, an area, a unit count or a completion date — the chapter's whole
 * claim is "these exist and you can go and look at them", and the button is what carries it.
 *
 * The fixtures still point their hero images at `/placeholder/...`, which is generated navy-and-orange
 * vector art with the project name burnt into the pixels — the last coloured thing left in the
 * codebase. `resolvePhoto` swaps it for one of the curated real photographs at render time, which is
 * what `/projects` and the project detail route already do. The `alt` is carried through untouched: it
 * is the project's own authored description and it is what the a11y suite checks, so the photograph is
 * the stand-in, never the description.
 *
 * If there are fewer than two published projects the chapter renders nothing rather than half a row.
 * An empty grid cell beside a single plate reads as a failed image load.
 */
export function StudioShowcase({ projects }: { projects: ProjectSummary[] }) {
  const [first, second] = projects
  if (!first || !second) return null

  const plates = [
    { project: first, aspect: 'aspect-[115/168] max-sm:aspect-auto max-sm:h-[100vw]' },
    { project: second, aspect: 'aspect-[115/96] max-sm:aspect-auto max-sm:h-[80vw]' },
  ]

  return (
    <section data-studio-showcase className="w-full bg-primary py-[var(--gutter)] text-secondary max-sm:py-[10vw]">
      <div className="layout-grid items-start">
        <Eyebrow className="col-span-12">{STUDIO_SHOWCASE.eyebrow}</Eyebrow>

        <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-7">
          {STUDIO_SHOWCASE.heading}
        </h2>

        <SplitLines
          text={STUDIO_SHOWCASE.intro}
          className="col-span-12 mt-[2.5vw] text-body text-muted max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>

      <div className="layout-grid mt-[8vw] gap-y-[8vw] max-sm:mt-[14vw]">
        {plates.map(({ project, aspect }, i) => {
          const hero = resolvePhoto(project.heroImage, i)
          return (
            <div key={project.slug} className="col-span-12 sm:col-span-6">
              <ImageReveal
                src={hero.url}
                alt={hero.alt}
                // 58vw, not 48: the photograph renders at 1.2x the frame to supply the overhang the
                // scrub travels into, so a hint quoted against the column is 20% short.
                sizes="(min-width: 640px) 58vw, 110vw"
                data-testid={`studio-showcase-image-${i + 1}`}
                className={`w-full [&_img]:saturate-[1.12] ${aspect}`}
              />

              <h3 className="mt-[1.6vw] text-lead max-sm:mt-[5vw] max-sm:text-lead-sm">{project.title}</h3>
              {/* Locality and city, which are verified CMS fields. Deliberately not the price or the
                  unit count — this chapter is an invitation to visit, not a listing. */}
              <p className="mt-[0.8vw] text-label text-muted max-sm:mt-[3vw] max-sm:text-label-sm">
                {project.location.area}, {project.location.city}
              </p>
              <div className="mt-[1.4vw] max-sm:mt-[5vw]">
                <Button href={`/projects/${project.slug}`} tone="dark">
                  Explore Project
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Columns 8-12, so the closing frame answers the taller plate diagonally across the grid
          rather than sitting under it. Inside a `layout-grid` rather than positioned with margins of
          its own — the page has no ad-hoc containers, which is why everything on it stays optically
          aligned down one set of column edges. */}
      <div className="layout-grid mt-[10vw] max-sm:mt-[14vw]">
        <ImageReveal
          src={STUDIO_SHOWCASE.closingImage.src}
          alt={STUDIO_SHOWCASE.closingImage.alt}
          sizes="(min-width: 640px) 48vw, 110vw"
          data-testid="studio-showcase-image-3"
          className="col-span-12 aspect-[3/2] w-full [&_img]:saturate-[1.12] sm:col-span-5 sm:col-start-8"
        />
      </div>
    </section>
  )
}
