import Link from 'next/link'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Rule } from '@/components/ui/Rule'
import type { ProjectCategory, ProjectSummary, SiteSettings } from '@/lib/data/types'

type Props = {
  categories: SiteSettings['categories']
  projects: ProjectSummary[]
}

// The brief's documented signature is `<CategoryGrid categories={SiteSettings['categories']} />`,
// but every card also needs a representative thumbnail, and `SiteSettings['categories']` is only
// `{ label, value }` pairs — no image lives on it. Inventing a stand-alone "category tile" image
// asset would sit outside `scripts/generate-placeholders.mjs` (which only emits files it can
// regex-parse out of `mock.ts`'s own project fixtures), so it would show a picture the mock data
// cannot back up. Judgment call: reuse each category's own representative published project
// instead — `app/page.tsx` already fetches the project list for the showcase above, so it costs
// nothing extra to pass down here too. Flagged in the batch report as a brief gap, not a silent
// workaround.
function representativeImage(category: ProjectCategory, projects: ProjectSummary[]) {
  return projects
    .filter((project) => project.category === category)
    .sort((a, b) => a.order - b.order)[0]?.heroImage
}

/**
 * Chapter 4 of the home page (ivory, between the showcase and StatsBand) — one card per
 * `settings.categories` entry, each a single stretched `<Link>` into `/projects?category=...`
 * so the whole tile is clickable and the link's accessible name is just the category label.
 */
export function CategoryGrid({ categories, projects }: Props) {
  return (
    <section data-categories className="bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Eyebrow className="text-navy-700">EXPLORE BY CATEGORY</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-navy-800">
          Built to fit how you live
        </h2>
        <Rule className="mt-4" />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const image = representativeImage(category.value, projects)
            return (
              <Link
                key={category.value}
                href={`/projects?category=${category.value}`}
                className="group relative flex min-h-11 flex-col overflow-hidden rounded-sm bg-ivory-warm ring-1 ring-navy-800/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange"
              >
                {/* bg-navy-800 well, matching HorizontalShowcase's card convention, so the tile
                    reads as a deliberate panel until the image resolves. */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-navy-800">
                  {image ? (
                    <ImageReveal
                      src={image.url}
                      alt={image.alt}
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 90vw"
                      // Overrides ImageReveal's shared default testid — five instances on one
                      // page would otherwise violate Playwright's strict mode together.
                      data-testid={`category-image-${category.value}`}
                      className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <p className="font-display-expanded text-lg leading-tight text-navy-800">
                    {category.label}
                  </p>
                  {/* A local hover-rule rather than the shared `Rule` atom: `Rule`'s default is a
                      fixed `w-10` accent, but this one needs to grow from 0 to the full card width
                      on hover — a `w-full` override on top of `Rule`'s own `w-10` would depend on
                      Tailwind's CSS source order rather than JSX prop order to win, which is
                      fragile. Built inline instead, same pattern as fixing `Pill` at the call site
                      (Ruling 9) rather than distorting the shared atom. */}
                  <span
                    aria-hidden="true"
                    className="mt-3 block h-[2px] w-full origin-left scale-x-0 bg-orange transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:transition-none"
                  />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
