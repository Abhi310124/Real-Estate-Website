import type { Metadata } from 'next'
import { ContactMap } from '@/components/contact/ContactMap'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { ContactIntake } from '@/components/storey/ContactIntake'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { getSiteSettings } from '@/lib/data'
import { whatsappLink } from '@/lib/whatsapp'

/**
 * The contact page: three white chapters, then the cream intake form.
 *
 *   1. intro      white   eyebrow, display line, one paragraph
 *   2. channels   white   Call / Message / Visit in three columns, under a drawn hairline
 *   3. office     white   the lazy map and an offset photograph
 *   4. intake     cream   `ContactIntake`, mounted whole
 *
 * Three decisions here are deliberate and each has a wrong-looking obvious alternative:
 *
 * **The form is not rebuilt.** `ContactIntake` already is the reference's contact page — numbered
 * fields, underline-only inputs, square checkboxes, cream paper, dark Submit — and it is mounted
 * here unchanged. Reproducing that markup with page-specific copy would fork the one form on the
 * site that has both client and server validation pointed at `/api/lead`.
 *
 * **`PageShell` is not used.** It centres its children in a `max-w-7xl` container, which is exactly
 * the thing the 12-column `.layout-grid` exists to avoid: the header and footer both bleed to the
 * page margin, so a constrained page body would break the single set of column edges the rest of
 * the site aligns to. The cost is that this page owns its own header clearance, the way `Hero` does
 * — `pt-[12vw]` clears the fixed header's ~5.2vw with room to breathe, and `max-sm:pt-[30vw]`
 * clears the taller mobile row plus its 44px Menu target.
 *
 * **The postal address is never printed here.** `SiteFooter` renders it verbatim on every route
 * including this one, and `tests/e2e/about-contact.spec.ts` asserts on it with `getByText` and no
 * `.first()` — a second element carrying the same text is a Playwright strict-mode violation, not
 * a duplicate-content nicety. The verified address still drives the directions link and the map
 * embed; it is simply never rendered as a second text node. Same reasoning drives the phone
 * grouping below.
 */

// Groups the ten trailing digits 5+5 for display only ("+91 63019 99971"). The digits are exactly
// `phone`'s own, untouched — only the spacing changes, matching the usual Indian mobile convention.
// `SiteFooter` renders the same verified number ungrouped ("+91 6301999971") on this very page, so
// this link needs a visibly different accessible name: two links sharing one name would break
// `getByRole('link', { name: /6301999971/ })`, which is strict and has no `.first()` to fall back
// on. The grouped form contains a space where the regex expects a digit, so it cannot collide.
function formatPhoneDisplay(phone: string): string {
  const match = phone.match(/^(\+\d+)\s*(\d{5})(\d{5})$/)
  return match ? `${match[1]} ${match[2]} ${match[3]}` : phone
}

// Underline rather than colour: in a palette with no accent, a link that differs from body copy
// only by weight or shade is not reliably distinguishable. `min-h-11` gives every one of these a
// 44px touch target even though the type itself is smaller than that.
const LINK =
  'inline-flex min-h-11 items-center text-body underline underline-offset-4 ' +
  'transition-opacity duration-150 ease-in-out hover:opacity-60 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ' +
  'max-sm:text-body-sm'

// The stamped mono label used for each channel heading — -10% tracking via the `mono` size token.
const MONO_HEADING = 'font-mono text-mono uppercase text-muted max-sm:text-mono-sm'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Contact BKR INFRA — Call, WhatsApp or Visit the Office',
  description:
    'Reach BKR INFRA by phone or WhatsApp, find the Hyderabad office on the map, or send an enquiry straight to our own team.',
}

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.address)}`

  return (
    <>
      <section
        data-contact-intro
        className="w-full bg-primary pb-[6vw] pt-[12vw] text-secondary max-sm:pb-[14vw] max-sm:pt-[30vw]"
      >
        <div className="layout-grid">
          <Eyebrow className="col-span-12">Contact</Eyebrow>

          <h1 className="col-span-12 mt-[1.6vw] text-display-lg font-display max-sm:mt-[5vw] max-sm:text-display-sm-lg sm:col-span-7">
            Talk to the people who build it.
          </h1>

          {/* Sits in the same grid row as the heading, out at columns 9–12: the asymmetry is what
              keeps this from reading as a centred page header. */}
          <p className="col-span-12 mt-[1.6vw] text-body max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-4 sm:col-start-9">
            Call either number, send a WhatsApp, or use the form below. Every enquiry reaches our own
            team in Hyderabad, and we answer it ourselves.
          </p>
        </div>
      </section>

      <section
        data-contact-channels
        className="w-full bg-primary pb-[8vw] text-secondary max-sm:pb-[16vw]"
      >
        <div className="layout-grid">
          <RuleDraw className="col-span-12 mb-[3vw] text-edge max-sm:mb-[8vw]" />

          <div className="col-span-12 sm:col-span-3">
            <h2 className={MONO_HEADING}>Call</h2>
            <ul className="mt-[0.8vw] max-sm:mt-[3vw]">
              {settings.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className={LINK}>
                    {formatPhoneDisplay(phone)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 mt-[6vw] sm:col-span-3 sm:col-start-5 sm:mt-0">
            <h2 className={MONO_HEADING}>Message</h2>
            <div className="mt-[1.2vw] max-sm:mt-[4vw]">
              <Button
                href={whatsappLink(
                  settings.whatsappNumber,
                  "Hi BKR INFRA, I'd like to know more about your projects."
                )}
                tone="dark"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                WhatsApp us
              </Button>
            </div>

            {/* `settings.email` is optional and currently unset: a `mailto:` to a mailbox that does
                not exist swallows an enquiry while looking like it worked. Mirrors `SiteFooter`'s
                own conditional, and appears automatically once a real address is supplied. */}
            {settings.email && (
              <div className="mt-[0.8vw] max-sm:mt-[3vw]">
                <a href={`mailto:${settings.email}`} className={LINK}>
                  {settings.email}
                </a>
              </div>
            )}
          </div>

          <div className="col-span-12 mt-[6vw] sm:col-span-3 sm:col-start-9 sm:mt-0">
            <h2 className={MONO_HEADING}>Visit</h2>
            <p className="mt-[0.8vw] text-body max-sm:mt-[3vw] max-sm:text-body-sm">
              The map below marks our door, and the full postal address sits at the foot of every
              page.
            </p>
            <div className="mt-[1.6vw] max-sm:mt-[5vw]">
              <Button
                href={directionsHref}
                tone="dark"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                Get directions
              </Button>
            </div>
          </div>

          {/* `socials: []` is a valid state, not missing data — again mirroring `SiteFooter`. */}
          {settings.socials.length > 0 && (
            <div className="col-span-12 mt-[6vw] max-sm:mt-[12vw]">
              <h2 className={MONO_HEADING}>Follow</h2>
              <ul className="mt-[0.8vw] flex flex-wrap gap-x-[2vw] max-sm:mt-[3vw] max-sm:gap-x-[6vw]">
                {settings.socials.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={LINK}
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section data-contact-office className="w-full bg-primary pb-[8vw] text-secondary max-sm:pb-[16vw]">
        {/* Own grid rather than a child of the pair below, because that grid carries `gap-y` and a
            rule placed inside it would inherit the row gap on top of its own `mb`. Same reason
            `ProjectsFeature` isolates its divider. */}
        <div className="layout-grid">
          <RuleDraw className="col-span-12 mb-[3vw] text-edge max-sm:mb-[8vw]" />
        </div>

        <div className="layout-grid gap-y-[6vw] max-sm:gap-y-[10vw]">
          {/* The map's `src` is only set once it intersects, so nothing on this page waits on
              Google — and no e2e assertion here depends on the embed having loaded. */}
          <div className="col-span-12 sm:col-span-7">
            <ContactMap address={settings.address} />
            <p className={`mt-[1.2vw] max-sm:mt-[4vw] ${MONO_HEADING}`}>Office — Hyderabad</p>
          </div>

          {/* Offset 6vw below the map and cropped to a smaller frame, the way the home page's
              feature pair is: two equal boxes side by side would read as a template. The aspect
              matches the source file's own 4:3, so `object-cover` is not silently cropping the
              composition it was chosen for. */}
          <div className="col-span-12 sm:col-span-4 sm:col-start-9 sm:mt-[6vw]">
            <ImageReveal
              src="/photography/detail-08.jpg"
              alt="Dining space open to a stair against a concrete wall, with a timber screen beyond"
              sizes="(min-width: 640px) 33vw, 92vw"
              className="aspect-[4/3] w-full"
            />
          </div>
        </div>
      </section>

      <ContactIntake />
    </>
  )
}
