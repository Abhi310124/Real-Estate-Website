import type { Metadata } from 'next'
import { ContactMap } from '@/components/contact/ContactMap'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { EnquiryForm } from '@/components/project/EnquiryForm'
import { getSiteSettings } from '@/lib/data'
import { whatsappLink } from '@/lib/whatsapp'

const LINK_CLASS =
  'text-body font-semibold text-navy-800 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange rounded'

// Groups the ten trailing digits 5+5 for display only ("+91 63019 99971") — the digits are
// exactly `phone`'s own, untouched; only the spacing changes, matching a common Indian mobile
// formatting convention. `Footer.tsx` renders the same verified number ungrouped
// ("+91 6301999971") on every route including this one, so this page's own tel: link needs a
// visibly different accessible name — otherwise two links sharing one name would violate
// Playwright's strict-mode `getByRole('link', { name: /6301999971/ })` lookup in
// tests/e2e/about-contact.spec.ts, which intentionally has no `.first()` to fall back on.
function formatPhoneDisplay(phone: string): string {
  const match = phone.match(/^(\+\d+)\s*(\d{5})(\d{5})$/)
  return match ? `${match[1]} ${match[2]} ${match[3]}` : phone
}

// Task 23 (Ruling 11): its own unique, >10-character title. Phone numbers are deliberately left
// out of the description — they are real and verified, but restating them here would duplicate
// Footer.tsx's own text rather than add anything a search snippet needs.
export const metadata: Metadata = {
  title: 'Contact BKR INFRA — Call, WhatsApp or Visit Us',
  description:
    'Reach BKR INFRA by phone, WhatsApp or in person at our Hyderabad office, or send your enquiry directly to our team.',
}

// Ruling 4: About and Contact both wrap their content in PageShell.
export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <PageShell>
      <Eyebrow className="text-navy-700">Contact Us</Eyebrow>
      <h1 className="mt-3 font-display-expanded text-display-lg text-navy-800">
        Let&apos;s talk
      </h1>
      <p className="mt-6 max-w-2xl text-body-lg text-navy-700">
        Call, WhatsApp, or send your details below — a member of our own team gets back to you
        directly, not a call centre.
      </p>

      <div className="mt-16 grid gap-16 lg:grid-cols-2">
        {/* Task 21 replaces Task 18's markup-only form with the live one. `EnquiryForm` renders
            the same `Field` set and owns validation, submission and the success announcement. */}
        <EnquiryForm source="enquiry" />

        <div className="space-y-10">
          <div>
            <h2 className="eyebrow text-eyebrow text-navy-700">Call Us</h2>
            <ul className="mt-4 space-y-2">
              {settings.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className={LINK_CLASS}>
                    {formatPhoneDisplay(phone)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* `email` is optional and unset in the mock — an invented mailto: would silently
              swallow enquiries, so this renders only once a real address is supplied. Mirrors
              Footer.tsx's own conditional exactly (Ruling 5). */}
          {settings.email && (
            <div>
              <h2 className="eyebrow text-eyebrow text-navy-700">Email Us</h2>
              <p className="mt-4">
                <a href={`mailto:${settings.email}`} className={LINK_CLASS}>
                  {settings.email}
                </a>
              </p>
            </div>
          )}

          <div>
            <h2 className="eyebrow text-eyebrow text-navy-700">Visit Us</h2>
            {/* No repeated address text here: Footer.tsx already renders the full,
                verified address verbatim on every route including this one, and
                tests/e2e/about-contact.spec.ts asserts on it with getByText and no `.first()` —
                a second element containing the same text would be a strict-mode violation. The
                real address still drives this link and the map below; it is just never printed
                as a second text node on this page. */}
            <a
              href={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 inline-block ${LINK_CLASS}`}
            >
              Get Directions
            </a>
            <div className="mt-6">
              <ContactMap address={settings.address} />
            </div>
          </div>

          {/* `socials: []` is a valid state, not missing data — mirrors Footer.tsx's own
              conditional exactly (Ruling 5). */}
          {settings.socials.length > 0 && (
            <div>
              <h2 className="eyebrow text-eyebrow text-navy-700">Follow Us</h2>
              <ul className="mt-4 flex flex-wrap gap-4">
                {settings.socials.map((social) => (
                  <li key={social.platform}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button
            href={whatsappLink(settings.whatsappNumber, "Hi BKR INFRA, I'd like to know more.")}
            variant="outline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
