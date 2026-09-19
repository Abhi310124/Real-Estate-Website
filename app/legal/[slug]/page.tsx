import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'

/**
 * The three documents the footer's Legal column links to.
 *
 * These routes existed as links long before they existed as pages: `SiteFooter` has always pointed
 * at `/legal/privacy`, `/legal/terms` and `/legal/cookies`, and none of them resolved. That is a
 * worse failure than it looks — Next prefetches links in the viewport, so every single page load
 * fired three 404s, and a visitor clicking "Privacy policy" in the footer of a form that collects
 * their phone number landed on a not-found page.
 *
 * **What these pages deliberately do NOT contain is invented policy text.** A privacy policy or a
 * set of terms is a binding statement about what a real business does with real people's personal
 * data, and BKR INFRA's actual undertakings are not knowable from this repository. Authoring
 * plausible-looking clauses would be worse than the 404: a 404 is obviously broken, whereas a page
 * headed "Privacy Policy" that a visitor reads and relies on is a misrepresentation, and under the
 * DPDP Act it is the company, not the page, that carries the consequence.
 *
 * So each page states plainly that the document is pending, and then says the one thing that IS
 * verifiable from the code: exactly which fields the enquiry form submits. That is a description of
 * this software, not a legal undertaking, and it is the part a visitor actually wants before typing
 * their number in.
 *
 * Replace each `pending` block with the client's own reviewed text when it arrives. Until then
 * `robots: noindex` keeps an incomplete legal page out of search results.
 */

const DOCUMENTS = {
  privacy: {
    title: 'Privacy policy',
    lede: 'How BKR INFRA handles the details you share through this website.',
  },
  terms: {
    title: 'Terms of use',
    lede: 'The terms on which this website and its content are made available.',
  },
  cookies: {
    title: 'Cookie policy',
    lede: 'What this website stores on your device, and why.',
  },
} as const

type Slug = keyof typeof DOCUMENTS

/**
 * The enquiry form's actual payload, read off `components/storey/ContactIntake.tsx` and the
 * `/api/lead` route. Listing it is a factual description of the software; it is the only concrete
 * claim these pages make, and it is the one a visitor most needs.
 */
const COLLECTED = [
  'Your name',
  'Your phone number',
  'Your email address, if you give one',
  'The locality and timeline you are interested in',
  'The kind of property you are looking for',
  'Anything you type into the message field',
] as const

export function generateStaticParams() {
  return Object.keys(DOCUMENTS).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = DOCUMENTS[slug as Slug]
  if (!doc) return { title: 'Not found | BKR INFRA' }
  return {
    title: `${doc.title} | BKR INFRA`,
    description: doc.lede,
    // These pages are honest about being incomplete. That is fine for a visitor who followed a
    // footer link and needs to know where things stand; it is not something to put in an index.
    robots: { index: false },
  }
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = DOCUMENTS[slug as Slug]
  if (!doc) notFound()

  return (
    <section className="w-full bg-primary pb-[12vw] pt-[14vw] text-secondary max-sm:pb-[24vw] max-sm:pt-[34vw]">
      <div className="layout-grid">
        <p className="col-span-12 font-mono text-mono uppercase text-muted max-sm:text-mono-sm">
          Legal
        </p>
        <h1 className="col-span-12 mt-[1.6vw] text-display-lg font-display max-sm:mt-[5vw] max-sm:text-display-sm-lg sm:col-span-7">
          {doc.title}
        </h1>
        <p className="col-span-12 mt-[2vw] text-body max-sm:mt-[7vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-9">
          {doc.lede}
        </p>
      </div>

      <div className="layout-grid mt-[8vw] max-sm:mt-[16vw]">
        <div className="col-span-12 border-t border-edge pt-[2vw] max-sm:pt-[6vw] sm:col-span-6 sm:col-start-1">
          <h2 className="text-lead max-sm:text-lead-sm">This document is being finalised</h2>
          <p className="mt-[1.4vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm">
            We would rather leave this page honest than fill it with text we have not had reviewed.
            If you need to know how your details will be handled before you send them, please ask us
            directly and we will tell you.
          </p>
          <Button href="/contact" className="mt-[2.4vw] max-sm:mt-[8vw]">
            Contact us
          </Button>
        </div>

        <div className="col-span-12 mt-[4vw] border-t border-edge pt-[2vw] max-sm:mt-[12vw] max-sm:pt-[6vw] sm:col-span-4 sm:col-start-8 sm:mt-0">
          <h2 className="text-lead max-sm:text-lead-sm">What the enquiry form sends</h2>
          <p className="mt-[1.4vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm">
            When you submit the enquiry form on this site, it sends us:
          </p>
          <ul className="mt-[1.4vw] space-y-[0.5vw] max-sm:mt-[5vw] max-sm:space-y-[2vw]">
            {COLLECTED.map((item) => (
              <li key={item} className="w-fit text-label-flow max-sm:text-label-flow-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
