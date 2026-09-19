import type { Metadata } from 'next'
import { Counter } from '@/components/motion/Counter'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { AreasOfWork } from '@/components/studio/AreasOfWork'
import { CorePrinciples } from '@/components/studio/CorePrinciples'
import { DirectorNote } from '@/components/studio/DirectorNote'
import { StudioHero } from '@/components/studio/StudioHero'
import { StudioIntro } from '@/components/studio/StudioIntro'
import { StudioProcess } from '@/components/studio/StudioProcess'
import { StudioShowcase } from '@/components/studio/StudioShowcase'
import { ContactIntake } from '@/components/storey/ContactIntake'
import { JournalPreview } from '@/components/storey/JournalPreview'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { getFeaturedProjects, getJournalPosts, getSiteSettings } from '@/lib/data'

/**
 * `/studio` — the public practice page, and the "Studio" item in the site nav.
 *
 * The URL used to belong to the embedded Sanity CMS; the CMS now lives at `/admin`
 * (`app/admin/[[...tool]]/page.tsx`) so that a visitor clicking "Studio" in the header lands on the
 * practice rather than on a login screen. `/about` is a permanent redirect here.
 *
 * ## The chapter order, and the ink it alternates on
 *
 *    1  hero            BLACK   170svh, the 3D image ring, no photograph
 *    2  intro           white   the statement, then five plates
 *    3  core principles BLACK   four numbered ruled rows, no imagery at all
 *    4  explore         white   two real projects as flush plates, plus a closing frame
 *    5  process         white   the pinned column and the second ring — the route's longest chapter
 *    6  director's note BLACK   the one real named person
 *    7  pillars         white   settings.pillars, owner-editable
 *    8  areas of work   BLACK   py-[30%], the four lines of work as an eight-tile mosaic
 *    9  at a glance     white   settings.stats
 *   10  journal         white   shared with the home page
 *   11  contact intake  white   shared with the home page
 *       footer          BLACK   mounted in app/layout.tsx
 *
 * **The route opens black.** It used to open white, which put every chapter after it on the ink the
 * chapter before it should have had — the whole page was one step out of phase from the first screen,
 * and that reads as a different design rather than as a shorter one. The reference opens /studio on the
 * same ink as its home hero and alternates from there, which is what the sequence above does.
 *
 * Two consequences of the inversion worth knowing:
 *
 *   - `SiteHeader` resolves its ink by sampling the painted stack under the wordmark on every scroll,
 *     so it inverts to white over this hero by itself. Its `firstPaintInk()` fallback is still keyed to
 *     the route name and returns dark ink for `/studio`, which costs one frame of black-on-black before
 *     hydration. That function is in `components/layout/SiteHeader.tsx`, not here.
 *   - Nothing on the route sits off the white/black ramp any more. The "at a glance" band was
 *     `bg-offwhite paper-grain`, the one 13-step-darker surface in the sequence; `lib/tokens.ts`
 *     reserves that token for lead-capture sheets the reference has no counterpart for, and a band that
 *     exists on the reference is not one of those.
 *
 * ## Chapters 5 and 4 are both white, deliberately
 *
 * The alternation is not mechanical. The reference runs its Explore showcase and its Process section on
 * the same white, because the pinned column belongs to the same held breath as the projects above it,
 * and interrupting them with a black band would make the pin read as the start of something new rather
 * than as the same thought slowed down.
 *
 * ## The numbers in chapter 9
 *
 * `settings.stats` are PLACEHOLDER figures (see the comment beside `MOCK_SETTINGS.stats` in
 * lib/data/mock.ts and section 9 of docs/OWNER-GUIDE.md — the owner must replace all four before
 * launch). They are rendered under their own labels and nothing else: no "proven", no "verified", no
 * "track record" framing, and the eyebrow says "indicative figures" out loud. That wording is
 * deliberate — this page must not become the place where unverified numbers acquire the language of
 * fact.
 *
 * ## What the route ends with
 *
 * The reference closes every interior route with the same intake block, and ours shipped it on the home
 * page only, so /studio ended with its last content band butting straight into the footer. Both shared
 * chapters are mounted here rather than reimplemented: `JournalPreview` and `ContactIntake` carry their
 * own backgrounds and their own `mt-[20vw]` approach gap. `/contact` stays as the standalone route for
 * direct links — it simply stops being the only place the form exists.
 */

// Photography for the owner-editable pillar rows, keyed by index rather than by title:
// `settings.pillars` is editable, so an owner renaming DEVELOP or adding a fourth pillar must not leave
// a row with no image. The modulo keeps every row filled whatever the array length.
//
// The first entry used to be `exterior-08.jpg`, described here as a detached house behind a wide lawn.
// It is a New England shingle cottage in autumn colour — one of the seven frames
// `components/project/photo.ts` excludes as not being contemporary residential development at all, and
// the only autumnal hue left anywhere on the site.
const ROW_MEDIA = [
  {
    src: '/photography/exterior-02.jpg',
    alt: 'White rendered villa standing above a pool',
  },
  {
    src: '/photography/detail-08.jpg',
    alt: 'Dining area beside a concrete-panelled stair wall, with the kitchen beyond',
  },
  {
    src: '/photography/detail-06.jpg',
    alt: 'Completed bathroom in marble tile with an oak vanity and twin basins',
  },
] as const

export const metadata: Metadata = {
  title: 'Studio — Inside the BKR INFRA Practice, Hyderabad',
  description:
    'How BKR INFRA works: land bought early in Hyderabad’s growth corridors, homes designed for ' +
    'light and livability, and handovers that arrive when promised — develop, design, deliver.',
}

// Matches the home page and /projects: with no Sanity webhook able to reach a developer's laptop,
// 30s is what lets an owner see a published edit to Site Settings appear on this page.
export const revalidate = 30

export default async function StudioPage() {
  const [settings, projects, posts] = await Promise.all([
    getSiteSettings(),
    getFeaturedProjects(),
    getJournalPosts(),
  ])

  return (
    <>
      <StudioHero projects={projects} />
      <StudioIntro />
      <CorePrinciples />
      <StudioShowcase projects={projects} />
      <StudioProcess projects={projects} />
      <DirectorNote address={settings.address} />

      {/* ── 7. The owner's three pillars, white ─────────────────────────────────────────────── */}
      <section data-studio-pillars className="w-full bg-primary py-[var(--gutter)] text-secondary max-sm:py-[10vw]">
        <div className="layout-grid">
          <Eyebrow className="col-span-12">The way we work</Eyebrow>
          <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-8">
            One process, in three parts
          </h2>
        </div>

        {/* Row anatomy from components/storey/Expertise.tsx: title at `lead` in columns 1-3, a 216px
            mono ghost numeral below it, the plate and the copy in the right half, and a static
            full-bleed `border-t` across the top of every row. The numeral is `aria-hidden` — ordinal
            decoration, where a screen reader announcing "one" before each heading adds nothing the
            list order already carries. The rule sits OUTSIDE `layout-grid` because the grid carries the
            page margin as `padding-inline`, so a rule placed inside it stops 20px short of both
            viewport edges.

            These three rows differ from chapter 3's four in exactly the way the reference's two
            numbered lists differ: the principles are prose on black with nothing beside them, and these
            carry a photograph. Two identical lists on one route would be the failure; two lists that
            are read differently are the composition. */}
        <ul className="mt-[10vw] max-sm:mt-[14vw]">
          {settings.pillars.map((pillar, i) => {
            const media = ROW_MEDIA[i % ROW_MEDIA.length]
            return (
              <li key={pillar.title} className="flex w-full flex-col gap-[10vw] border-t border-edge">
                <div className="layout-grid pt-[var(--gutter)]">
                  <h3 className="col-span-12 text-lead max-sm:text-lead-sm sm:col-span-3">{pillar.title}</h3>
                  {/* `settings.pillars` descriptions are owner-editable free text, so they are the one
                      prose block on the route whose length nobody here controls. `SplitLines` masks
                      whatever the browser laid out, so it degrades gracefully to however many lines an
                      edit produces. */}
                  <SplitLines
                    text={pillar.description}
                    className="col-span-12 mt-[6vw] text-body text-muted max-sm:text-body-sm sm:col-span-3 sm:col-start-7 sm:mt-0"
                  />
                </div>

                <div className="layout-grid pb-[4vw] pt-[var(--gutter)] max-sm:pb-[8vw]">
                  <span
                    aria-hidden="true"
                    className="col-span-12 font-mono text-numeral text-hairline sm:col-span-3"
                  >
                    {i + 1}
                  </span>
                  <ImageReveal
                    src={media.src}
                    alt={media.alt}
                    // 30vw, not 23: the frame renders its photograph at 1.2x to supply the overhang the
                    // scrub travels into, so a hint quoted against the column asks for a candidate 20%
                    // too small.
                    sizes="(min-width: 640px) 30vw, 110vw"
                    data-testid={`studio-pillar-image-${i + 1}`}
                    // `self-start` is not cosmetic: the numeral's 216px line box sets this grid row's
                    // height, and a stretched grid item takes a definite height from its row, which
                    // overrides the aspect ratio and renders the photograph at 1.55:1.
                    className="col-span-12 mt-[6vw] aspect-[5/3] w-full self-start [&_img]:saturate-[1.12] sm:col-span-3 sm:col-start-7 sm:mt-0"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <AreasOfWork />

      {/* ── 9. At a glance, white ───────────────────────────────────────────────────────────── */}
      <section data-studio-figures className="w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]">
        <div className="layout-grid">
          <Eyebrow className="col-span-12">At a glance — indicative figures</Eyebrow>

          <ul className="col-span-12 mt-[4vw] grid grid-cols-2 gap-x-[var(--gutter)] gap-y-[6vw] max-sm:mt-[10vw] max-sm:gap-y-[10vw] sm:grid-cols-4">
            {settings.stats.map((stat, i) => (
              <li key={stat.label}>
                <Counter
                  value={stat.value}
                  suffix={stat.suffix}
                  data-testid={`studio-stat-${i + 1}`}
                  // Off-scale on purpose: `display-lg` (7vw) would overflow a three-column stat
                  // like "22 Lakh+", and `lead` (2.2vw) is too small to read as a figure. Same
                  // treatment as the scale tokens otherwise — leading 1, tracking -3%.
                  className="block font-display leading-none tracking-[-0.03em] text-[3.4vw] tnum max-sm:text-[9vw]"
                />
                <p className="mt-[1vw] text-label text-muted max-sm:mt-[3vw] max-sm:text-label-sm">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>

          {/* One control, not two. The second used to be "Start a Conversation", and the intake form it
              pointed at is now two chapters below on this same page — a button that scrolls the visitor
              past a journal preview to reach a form they will meet anyway is a worse offer than no
              button. `max-sm:min-h-11` only below `sm`: Button's own vertical padding lands a touch
              target at roughly 33px on a 390px screen and 44px is the floor for a thumb, while at `sm`
              and up the same floor would make this taller than every other button on the site. */}
          <div className="col-span-12 mt-[6vw] border-t border-edge pt-[3vw] max-sm:mt-[12vw] max-sm:pt-[8vw] sm:col-span-6">
            <Button href="/projects" tone="dark" className="max-sm:min-h-11 max-sm:w-full">
              View Projects
            </Button>
          </div>
        </div>
      </section>

      <JournalPreview posts={posts} />
      <ContactIntake contact={settings.phones[0]} />
    </>
  )
}
