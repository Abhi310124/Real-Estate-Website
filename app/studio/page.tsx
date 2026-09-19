import type { Metadata } from 'next'
import Image from 'next/image'
import { Counter } from '@/components/motion/Counter'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { getSiteSettings } from '@/lib/data'

/**
 * `/studio` — the public practice page, and the "Studio" item in the site nav.
 *
 * The URL used to belong to the embedded Sanity CMS; the CMS now lives at `/admin`
 * (`app/admin/[[...tool]]/page.tsx`) so that a visitor clicking "Studio" in the header lands on the
 * practice rather than on a login screen. `/about` is a permanent redirect here.
 *
 * Built as alternating chapters, the same way the home page is:
 *
 *   1  intro       white   — title block, then a full-bleed photograph
 *   2  approach    black   — the page's one `display-xl` statement
 *   3  pillars     white   — settings.pillars as numbered rows with ghost numerals
 *   4  note        black   — a signed note from the Managing Director
 *   5  figures     paper   — the at-a-glance numbers and the two closing actions
 *
 * ── Why the page does not open with the photograph itself ──────────────────────────────────────
 * `SiteHeader` picks its ink by ROUTE, not by scroll position, and `/studio` is not in its
 * `isFullBleedRoute()` list — so the header renders in BLACK ink over the top of this page. A
 * photograph starting at y=0 would put black nav type over an arbitrary image. So the top band is
 * paper, carrying the eyebrow and the h1, and the full-bleed photograph starts below it. The photo
 * is still edge-to-edge (it sits outside `.layout-grid`, so no page margin applies to it), which is
 * the part that matters visually.
 *
 * ── The numbers ───────────────────────────────────────────────────────────────────────────────────
 * `settings.stats` are PLACEHOLDER figures (see the comment beside `MOCK_SETTINGS.stats` in
 * lib/data/mock.ts and section 9 of docs/OWNER-GUIDE.md — the owner must replace all four before
 * launch). They are rendered here under their own labels and nothing else: no "proven", no
 * "verified", no "track record" framing, and the eyebrow says "indicative figures" out loud. That
 * wording is deliberate — this page must not become the place where unverified numbers acquire the
 * language of fact.
 */

// Photography per pillar row, by index rather than by title: `settings.pillars` is owner-editable,
// so an owner renaming DEVELOP or adding a fourth pillar must not leave a row with no image. The
// modulo keeps every row filled whatever the array length.
const ROW_MEDIA = [
  {
    src: '/photography/exterior-08.jpg',
    alt: 'Detached house set well back behind a wide lawn, seen from the street',
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

// Authored marketing copy for BKR INFRA, in the same register as `lib/content/home.ts` — a voice,
// not a set of new factual claims. Every concrete assertion here already exists in the CMS's own
// text (`footerBlurb`'s "fast-growing corridors of Hyderabad", the three `pillars`) or in the
// verified contact facts (the office address, the Managing Director's name). No tenure, headcount,
// area or delivery figure is stated anywhere in this prose.
const APPROACH = {
  eyebrow: 'How we think',
  statement: 'A home is only as good as the ground it stands on.',
  body:
    'Before an elevation is drawn we walk the site — for access, for water, for where the light ' +
    'falls in the afternoon, and for the direction the city is growing. The land we buy sits in ' +
    'corridors well ahead of the demand that will reach them, which is why our layouts read as ' +
    'considered rather than squeezed.',
} as const

const NOTE = {
  eyebrow: 'A note from the Managing Director',
  // Written for him rather than quoted from him — he is a real, named person, so this is copy in
  // his voice that is worth his approval before launch, exactly as flagged for the home page's
  // own note in lib/content/home.ts. The two facts it leans on — our name, our office address —
  // are both verified and both already published in the footer.
  body:
    'Every project we take on carries our name on it and our own office address behind it. That ' +
    'is deliberate. If something is not right, you know which door to knock on — and we would far ' +
    'rather hear it from you while we can still fix it.',
  name: 'B Karthik Reddy',
  role: 'Managing Director, BKR INFRA',
  image: {
    src: '/photography/interior-07.jpg',
    alt: 'Bedroom in a completed home, city skyline beyond full-height glazing',
  },
} as const

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
  const settings = await getSiteSettings()

  return (
    <>
      {/* ── 1. Intro, white ─────────────────────────────────────────────────────────────────── */}
      <section data-studio-intro className="w-full bg-primary pt-[9vw] text-secondary max-sm:pt-[30vw]">
        <div className="layout-grid">
          <Eyebrow className="col-span-12">Studio — Hyderabad</Eyebrow>

          <h1 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-9">
            Land bought early. Homes drawn carefully. Keys handed over on time.
          </h1>

          <RuleDraw className="col-span-12 mt-[5vw] text-edge max-sm:mt-[10vw]" />

          {/* The blurb is the CMS's own standing description of the business, not a second version
              of it written for this page — one sentence, owner-editable, already used in the
              footer. */}
          <p className="col-span-12 mt-[2.5vw] text-body text-muted max-sm:mt-[7vw] max-sm:text-body-sm sm:col-span-6 sm:col-start-7">
            {settings.footerBlurb}
          </p>
        </div>

        {/* Full-bleed: deliberately outside `.layout-grid`, so the page margin does not apply and
            the photograph runs edge to edge. `priority` — at this position it is the LCP element. */}
        <div className="relative mt-[6vw] h-[78svh] w-full max-sm:mt-[12vw] max-sm:h-[62svh]">
          <Image
            src="/photography/exterior-07.jpg"
            alt="Two-storey residence with a deep first-floor verandah, a timber-clad garden room and a pool terrace"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* ── 2. Approach, black ──────────────────────────────────────────────────────────────── */}
      <section
        data-studio-approach
        className="w-full bg-secondary py-[11vw] text-primary max-sm:py-[20vw]"
      >
        <div className="layout-grid">
          {/* A raw mono label rather than `<Eyebrow>` on the dark chapters: Eyebrow's own colour is
              `text-muted` (#3D3D3D), and `cn()` is a plain join with no tailwind-merge, so a colour
              passed via className does not reliably win the cascade — it would be a coin-flip
              between white and near-black text on black. Same markup Eyebrow renders, minus the
              gamble. This is what ProjectsFeature.tsx does with its own note label. */}
          <p className="col-span-12 font-mono text-mono uppercase text-primary/60 max-sm:text-mono-sm">
            {APPROACH.eyebrow}
          </p>

          <h2 className="col-span-12 mt-[2.5vw] text-display-xl font-display max-sm:mt-[8vw] max-sm:text-display-sm-xl sm:col-span-10">
            {APPROACH.statement}
          </h2>

          <RuleDraw className="col-span-12 mt-[7vw] text-primary/40 max-sm:mt-[14vw]" />

          <p className="col-span-12 mt-[2.5vw] text-body max-sm:mt-[7vw] max-sm:text-body-sm sm:col-span-5 sm:col-start-7">
            {APPROACH.body}
          </p>
        </div>
      </section>

      {/* ── 3. Pillars, white ───────────────────────────────────────────────────────────────── */}
      <section data-studio-pillars className="w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]">
        <div className="layout-grid">
          <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
            The way we work, in three parts
          </h2>
        </div>

        {/* Row anatomy lifted from components/storey/Expertise.tsx verbatim — title at `lead` in
            cols 1–4, a ~11vw `hairline` ghost numeral below it with deep space above, image and
            copy in cols 7–10, a drawn hairline across the top of every row, and each row mostly
            empty by design. The numeral is aria-hidden: it is ordinal decoration, and a screen
            reader announcing "one" before each heading adds nothing the list order already gives. */}
        <ul className="mt-[6vw] max-sm:mt-[14vw]">
          {settings.pillars.map((pillar, i) => {
            const media = ROW_MEDIA[i % ROW_MEDIA.length]
            return (
              <li key={pillar.title}>
                <div className="layout-grid">
                  <RuleDraw delayMs={i * 90} className="col-span-12 text-edge" />
                </div>

                <div className="layout-grid min-h-[30vw] pb-[6vw] pt-[2vw] max-sm:min-h-0 max-sm:pb-[12vw] max-sm:pt-[6vw]">
                  <div className="col-span-12 sm:col-span-4">
                    <h3 className="text-lead max-sm:text-lead-sm">{pillar.title}</h3>
                    <span
                      aria-hidden="true"
                      className="mt-[6vw] block leading-none text-hairline max-sm:mt-[8vw]"
                      style={{ fontSize: '11vw', fontWeight: 500 }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  <div className="col-span-12 mt-[4vw] sm:col-span-4 sm:col-start-7 sm:mt-0">
                    <ImageReveal
                      src={media.src}
                      alt={media.alt}
                      sizes="(min-width: 640px) 33vw, 92vw"
                      delayMs={i * 90}
                      data-testid={`studio-pillar-image-${i + 1}`}
                      className="aspect-[3/2] w-full"
                    />
                    <p className="mt-[1.6vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ── 4. The Managing Director's note, black ──────────────────────────────────────────── */}
      <section data-studio-note className="w-full bg-secondary py-[10vw] text-primary max-sm:py-[18vw]">
        <div className="layout-grid">
          <RuleDraw className="col-span-12 mb-[3vw] text-primary/40 max-sm:mb-[8vw]" />

          <p className="col-span-12 font-mono text-mono uppercase text-primary/60 max-sm:text-mono-sm sm:col-span-3">
            {NOTE.eyebrow}
          </p>

          {/* `blockquote` + `figcaption` rather than styled paragraphs: it is an attributed
              statement. Name and role sit in separate leaf elements so each resolves to exactly one
              node for a test, without needing `.first()`. */}
          <figure className="col-span-12 max-sm:mt-[6vw] sm:col-span-5 sm:col-start-5">
            <blockquote>
              <p className="text-lead max-sm:text-lead-sm">{NOTE.body}</p>
            </blockquote>
            <figcaption className="mt-[2vw] max-sm:mt-[6vw]">
              <p className="text-label max-sm:text-label-sm">{NOTE.name}</p>
              <p className="mt-[0.6vw] text-label text-primary/60 max-sm:mt-[2vw] max-sm:text-label-sm">
                {NOTE.role}
              </p>
              {/* The verified office address, restated because the note itself points at it. */}
              <p className="mt-[1.6vw] font-mono text-mono uppercase text-primary/60 max-sm:mt-[5vw] max-sm:text-mono-sm">
                {settings.address}
              </p>
            </figcaption>
          </figure>

          <div className="col-span-12 mt-[6vw] sm:col-span-3 sm:col-start-10 sm:mt-0">
            <ImageReveal
              src={NOTE.image.src}
              alt={NOTE.image.alt}
              sizes="(min-width: 640px) 25vw, 92vw"
              data-testid="studio-note-image"
              className="aspect-[4/5] w-full"
            />
          </div>
        </div>
      </section>

      {/* ── 5. At a glance + the two closing actions, paper ─────────────────────────────────── */}
      <section
        data-studio-figures
        className="paper-grain w-full bg-offwhite py-[8vw] text-secondary max-sm:py-[16vw]"
      >
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

          <RuleDraw className="col-span-12 mt-[7vw] text-edge max-sm:mt-[14vw]" />

          {/* `max-sm:min-h-11` only below `sm`: Button's own vertical padding lands a touch target
              at roughly 33px on a 390px screen, and 44px is the floor for a thumb. Deliberately not
              applied at `sm` and up, where it would make these two taller than every other button
              on the site — the shape belongs to the component, not to this page. */}
          <div className="col-span-12 mt-[3vw] flex flex-wrap gap-[1.4vw] max-sm:mt-[8vw] max-sm:flex-col max-sm:gap-[5vw] sm:col-span-6">
            <Button href="/projects" tone="dark" className="max-sm:min-h-11 max-sm:w-full">
              View Projects
            </Button>
            <Button href="/contact" tone="dark" className="max-sm:min-h-11 max-sm:w-full">
              Start a Conversation
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
