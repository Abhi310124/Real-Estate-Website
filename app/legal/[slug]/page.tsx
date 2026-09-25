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
    title: 'Privacy Policy',
    lede: 'How BKR INFRA handles the details you share through this website.',
  },
  terms: {
    title: 'Terms of Use',
    lede: 'The terms on which this website and its content are made available.',
  },
  cookies: {
    title: 'Cookie Policy',
    lede: 'What this website stores on your device, and why.',
  },
} as const

type Slug = keyof typeof DOCUMENTS

/**
 * The enquiry forms' actual payload, read off `components/site/EnquiryDoors.tsx`,
 * `components/project/EnquiryForm.tsx` and the `/api/lead` route. Listing it is a factual description
 * of the software; it is the only concrete claim these pages make, and it is the one a visitor most
 * needs.
 */
const COLLECTED = [
  'Your name',
  'Your phone number',
  'Your email address, if you give one',
  'The kinds of property you tick, if any',
  'Anything you type into the message field',
  'Which project page you were on, when you enquire from one',
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
    <section className="pb-32 max-lg:pb-20">
      <div className="container-page pt-[104px] max-lg:pt-12">
        <p className="text-small text-navySoft">Legal</p>
        <h1 className="mt-6 font-heading text-h1 text-secondary max-sm:text-h1-sm">{doc.title}</h1>
        <p className="mt-6 max-w-[640px] text-body text-secondary">{doc.lede}</p>
      </div>

      <div className="layout-grid mt-20 gap-y-12 max-lg:mt-12">
        <div className="col-span-12 border-t border-hairline pt-8 lg:col-span-6">
          <h2 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">This document is being finalised</h2>
          <p className="mt-4 text-body text-secondary">
            We would rather leave this page honest than fill it with text we have not had reviewed. If you need to know
            how your details will be handled before you send them, please ask us directly and we will tell you.
          </p>
          <Button href="/contact" className="mt-8">
            Contact us
          </Button>
        </div>

        <div className="col-span-12 border-t border-hairline pt-8 lg:col-span-5 lg:col-start-8">
          <h2 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">What the enquiry forms send</h2>
          <p className="mt-4 text-body text-secondary">When you submit an enquiry on this site, it sends us:</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-body text-secondary marker:text-accent">
            {COLLECTED.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
