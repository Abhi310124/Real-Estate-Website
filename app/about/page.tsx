import { PageShell } from '@/components/layout/PageShell'
import { Counter } from '@/components/motion/Counter'
import { Reveal } from '@/components/motion/Reveal'
import { SplitWords } from '@/components/motion/SplitWords'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { getSiteSettings } from '@/lib/data'

// Local, not shared: mirrors StatsBand.tsx's own slugify exactly, but this page's stat cards are
// a second, independent set of DOM nodes from StatsBand's — sharing one helper across files
// wouldn't remove any duplication that Playwright actually cares about, it would just add an
// import for three lines of pure string logic.
function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Fresh copy for this page, but grounded in facts already established elsewhere in
// `MOCK_SETTINGS` (footerBlurb's "fast-growing corridors", the RERA disclaimer, and every
// project's own `reraNumber`) — restating, not inventing, per the same reasoning WhyBkr.tsx's
// DIFFERENTIATORS comment already documents for the home page.
const VALUES = [
  {
    title: 'Clear Titles, Always',
    description:
      'Every plot and unit we sell comes with verified, disputes-free title documentation — checked before it is ever listed, not after a buyer asks.',
  },
  {
    title: 'RERA Registered, By Default',
    description:
      'Every BKR development carries its own TS RERA registration number, published on its project page — a matter of public record, not a promise we ask you to take on faith.',
  },
  {
    title: 'Corridors, Not Just Cities',
    description:
      "We buy ahead of demand in Hyderabad's fastest-growing corridors, so the open plots, villas and apartments we hand over sit where the city is headed next.",
  },
]

// Ruling 4: About and Contact both wrap their content in PageShell, which owns the 144px
// clearance under the fixed announcement bar + header (see PageShell.tsx's own comment).
export default async function AboutPage() {
  const settings = await getSiteSettings()

  return (
    <PageShell>
      <Eyebrow className="text-navy-700">About BKR INFRA</Eyebrow>
      <SplitWords
        as="h1"
        text="Real estate, built the way we would want to buy it"
        className="mt-3 font-display-expanded text-display-lg text-navy-800"
      />
      <p className="mt-6 max-w-2xl text-body-lg text-navy-700">{settings.footerBlurb}</p>

      {/* Three pillars, expanded — settings.pillars verbatim (never PillarsStrip's own private
          icon set, which is unexported from components/home/PillarsStrip.tsx and scoped to the
          home page's strip), with a fresh, plainer treatment: a numeral rather than an icon.
          text-orange here sits on a numeral at display-md size (clamp 1.75rem–3rem, i.e. never
          below 28px), which the contrast law's own carve-out for display-sized text permits. */}
      <div className="mt-20 border-t border-champagne/40 pt-12">
        <h2 className="eyebrow text-eyebrow text-navy-700">Our Three Pillars</h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          {settings.pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.1}>
              <p aria-hidden="true" className="font-display-expanded text-display-md text-orange">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 font-display-expanded text-xl text-navy-800">{pillar.title}</h3>
              <p className="mt-3 text-body text-navy-700">{pillar.description}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* A signed note from the Managing Director — "B Karthik Reddy" and "Managing Director"
          each sit in their own leaf <p>, nowhere else on this page, so
          getByText(/B Karthik Reddy/i) and getByText(/Managing Director/i) each resolve to
          exactly one element without needing `.first()`. The quote itself is a values statement
          in his voice, not a new factual claim — no tenure, headcount or figure is asserted that
          isn't already in MOCK_SETTINGS. */}
      <Reveal className="mt-20 border-t border-champagne/40 pt-12">
        <figure className="max-w-2xl">
          <blockquote>
            <p className="text-body-lg text-navy-800">
              &ldquo;Every BKR INFRA project carries our name and our address. That is not a line
              for the brochure — it is how we hold ourselves to account, from the first layout
              sketch to the day a buyer walks in with a clear title in hand.&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-6">
            <p className="font-semibold text-navy-800">B Karthik Reddy</p>
            <p className="text-sm text-navy-700">Managing Director</p>
          </figcaption>
        </figure>
      </Reveal>

      <div className="mt-20 border-t border-champagne/40 pt-12">
        <h2 className="eyebrow text-eyebrow text-navy-700">What We Hold To</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 0.08}>
              <h3 className="font-display-expanded text-xl text-navy-800">{value.title}</h3>
              <p className="mt-3 text-body text-navy-700">{value.description}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-20 border-t border-champagne/40 pt-12">
        <h2 className="eyebrow text-eyebrow text-navy-700">By The Numbers</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {settings.stats.map((stat) => (
            <div key={stat.label}>
              <Counter
                value={stat.value}
                suffix={stat.suffix}
                data-testid={`about-stat-${slugify(stat.label)}`}
                className="font-display-expanded text-display-md text-navy-800"
              />
              <p className="mt-2 text-caption text-navy-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
