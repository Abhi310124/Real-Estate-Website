import { Reveal } from '@/components/motion/Reveal'
import { SplitWords } from '@/components/motion/SplitWords'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'

// Non-fabricated: these three restate facts already established elsewhere in the site's own
// content (`MOCK_SETTINGS.footerBlurb` and `.reraDisclaimer` in lib/data/mock.ts), rather than
// inventing a new, unverified brand claim — consistent with the "never invent project/brand data"
// constraint.
const DIFFERENTIATORS = [
  {
    title: 'Clear Titles',
    description:
      'Every plot and unit comes with verified, clear title documentation — no disputes, no surprises at registration.',
  },
  {
    title: 'RERA Registered',
    description:
      'Every BKR development is registered with TS RERA, so the paperwork behind your investment is a matter of public record, not a promise.',
  },
  {
    title: 'On-Time Handover',
    description:
      'We build to the schedule we quote, and share construction updates as they happen — not after buyers start asking.',
  },
]

/** Chapter 6 of the home page (ivory, between StatsBand and CtaBand) — editorial two-column
 *  layout: a heading/intro column on the left, three differentiators separated by champagne
 *  hairlines on the right. */
export function WhyBkr() {
  return (
    <section data-why-bkr className="bg-ivory py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-2 md:gap-16 lg:px-10">
        <div>
          <Eyebrow className="text-navy-700">WHY BKR</Eyebrow>
          <SplitWords
            as="h2"
            className="mt-3 font-display-expanded text-display-md text-navy-800"
            text="Built on things that don't move"
          />
          <p className="mt-6 max-w-md text-body text-navy-700">
            Real estate rewards patience and punishes shortcuts. These are the three things we do
            not compromise on, project after project.
          </p>
        </div>
        <div>
          {DIFFERENTIATORS.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.1}
              className={cn(index > 0 && 'mt-6 border-t border-champagne/40 pt-6')}
            >
              <h3 className="font-display-expanded text-xl text-navy-800">{item.title}</h3>
              <p className="mt-2 text-body text-navy-700">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
