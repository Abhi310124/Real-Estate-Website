import type { Metadata } from 'next'
import { ContactMap } from '@/components/contact/ContactMap'
import { Rise } from '@/components/motion/Rise'
import { EnquiryDoors } from '@/components/site/EnquiryDoors'
import { PageIntro } from '@/components/site/PageIntro'
import { Button, LineButton } from '@/components/ui/Button'
import { getSiteSettings } from '@/lib/data'
import { groupPhone, telHref } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Contact BKR INFRA — Call, WhatsApp or Visit the Office',
  description:
    'Reach BKR INFRA by phone or WhatsApp, find the Hyderabad office on the map, or send an enquiry straight to our own team.',
}

const CARD = 'flex h-full flex-col rounded-card border border-navyLine/60 bg-primary p-8 max-sm:p-6'

/**
 * `/contact`: every way to reach the office on one page, in the site's vocabulary — the page intro,
 * three channel cards (call, message, visit), the office on a map laid out as the reference lays out a
 * project's location, and the enquiry doors with the form.
 *
 * Contact facts come from settings only: the two verified numbers, the WhatsApp number and the office
 * address. The email block appears only once a real address is set.
 */
export default async function ContactPage() {
  const settings = await getSiteSettings()
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.address)}`

  return (
    <>
      <PageIntro crumb="Contact" lines={['Talk to the people', { accent: 'who build it' }]} />

      <section className="layout-grid mt-20 gap-y-6 max-lg:mt-12" aria-label="Ways to reach us">
        <div className="col-span-12 md:col-span-4">
          <div className={CARD}>
            <h2 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">Call</h2>
            <p className="mt-2 text-body text-muted">Either number reaches the office directly.</p>
            <ul className="mt-6 space-y-2">
              {settings.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={telHref(phone)}
                    className="font-heading text-h4 text-accentInk transition-colors duration-300 hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary max-sm:text-h4-sm"
                  >
                    {groupPhone(phone)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <div className={CARD}>
            <h2 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">Message</h2>
            <p className="mt-2 text-body text-muted">Send a WhatsApp and we will reply from the same number.</p>
            <div className="mt-auto pt-8">
              <Button
                href={whatsappLink(settings.whatsappNumber, "Hi BKR INFRA, I'd like to know more about your projects.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </Button>
            </div>
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="mt-4 text-body text-accentInk underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
              >
                {settings.email}
              </a>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-4">
          <div className={CARD}>
            <h2 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">Visit</h2>
            <address className="mt-2 text-body not-italic text-secondary">{settings.address}</address>
            <div className="mt-auto pt-8">
              <LineButton href={directionsHref} target="_blank" rel="noopener noreferrer">
                Get directions
              </LineButton>
            </div>
          </div>
        </div>
      </section>

      <section className="layout-grid mt-32 gap-y-8 max-lg:mt-20" aria-labelledby="office-heading">
        <Rise as="h2" id="office-heading" className="col-span-12 font-heading text-h2 text-secondary max-sm:text-h2-sm lg:col-span-3">
          The office
        </Rise>
        <div className="col-span-12 lg:col-span-9">
          <div className="flex items-baseline justify-between gap-6">
            <p className="text-body text-secondary">Hyderabad, Telangana</p>
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-body text-accentInk transition-colors duration-300 hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
            >
              Open in Maps
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5">
                <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
          <div className="mt-6">
            <ContactMap address={settings.address} />
          </div>
        </div>
      </section>

      <EnquiryDoors className="mt-24" />
    </>
  )
}
