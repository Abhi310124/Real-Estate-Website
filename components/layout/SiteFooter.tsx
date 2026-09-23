import Link from 'next/link'
import { LogoMark } from '@/components/brand/LogoMark'
import { groupPhone, telHref } from '@/lib/format'
import type { ProjectSummary, SiteSettings } from '@/lib/data/types'

/**
 * The footer, in the reference's construction: one navy band, three columns, a legal row.
 *
 *   logo | Redefining               Company        Projects
 *          Real Estate Excellence   Home           BKR Lakeview Enclave
 *                                   About          BKR Skyline Residences
 *   Corporate Office                Contact        …
 *   <address>                       Projects
 *   <PROJECT> Details               Blog
 *   TS RERA : P0220…
 *   rera.telangana.gov.in
 *   Phone:  +91 6301 999 971
 *           +91 9676 669 923
 *
 *   © 2026 BKR INFRA. All rights reserved.            Privacy policy  Terms of use  Cookie policy
 *
 * **The registration blocks are data, not copy.** Each one is a project's own `reraNumber`, for the
 * projects currently being marketed (upcoming and ongoing) — a registration number belongs beside the
 * name of the project it registers, and a project that is sold out or handed over is no longer
 * being offered. They appear, change and disappear as the owner edits projects; nothing here is typed.
 *
 * **What is deliberately absent.** `settings.email` and `settings.socials` are unset — no verified
 * mailbox or handle was supplied, and a `mailto:` to an inbox that does not exist loses an enquiry
 * while appearing to work. Both blocks render the moment real values are entered.
 *
 * Every link is orange, per the brief: full-strength accent reads at 5.17:1 on navy, so the footer
 * can use the brand orange itself where the cream grounds need the darker `accentInk`.
 */

const COMPANY = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
]

const LEGAL = [
  { href: '/legal/privacy', label: 'Privacy policy' },
  { href: '/legal/terms', label: 'Terms of use' },
  { href: '/legal/cookies', label: 'Cookie policy' },
]

/** The regulator's own portal, where any registration number above can be checked. */
const RERA_PORTAL = 'https://rera.telangana.gov.in'

const FOCUS = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
const LINK = `text-accent transition-colors duration-300 hover:text-primary ${FOCUS}`

/** "Redefining Real Estate Excellence" → ["Redefining", "Real Estate Excellence"], set on two lines. */
function splitTagline(tagline: string): [string, string] {
  const i = tagline.indexOf(' ')
  return i === -1 ? [tagline, ''] : [tagline.slice(0, i), tagline.slice(i + 1)]
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-heading text-[20px] leading-[1.3]">{children}</h2>
}

export function SiteFooter({ settings, projects }: { settings: SiteSettings; projects: ProjectSummary[] }) {
  const year = new Date().getFullYear()
  const [taglineHead, taglineTail] = splitTagline(settings.tagline)
  const registered = projects.filter((p) => p.reraNumber && (p.status === 'upcoming' || p.status === 'ongoing'))

  return (
    <footer className="bg-secondary text-primary">
      <div className="layout-grid gap-y-12 py-12">
        <div className="col-span-12 lg:col-span-6">
          <div className="flex items-center gap-12 max-sm:gap-6">
            <Link href="/" aria-label="BKR INFRA — home" className={`shrink-0 text-primary ${FOCUS}`}>
              <LogoMark className="w-[140px] max-sm:w-[112px]" />
            </Link>
            <span aria-hidden="true" className="h-14 w-px shrink-0 bg-primary/40" />
            <p className="font-heading text-h4 leading-[1.1] max-sm:text-h4-sm">
              {taglineHead}
              {taglineTail && (
                <>
                  <br />
                  {taglineTail}
                </>
              )}
            </p>
          </div>

          <div className="mt-10 space-y-6 text-small">
            <div>
              <Heading>Corporate Office</Heading>
              <address className="mt-2 max-w-[300px] not-italic leading-[1.5]">{settings.address}</address>
            </div>

            {registered.map((p) => (
              <div key={p.id}>
                <Heading>
                  <span className="uppercase">{p.title}</span> Details
                </Heading>
                <p className="mt-2">TS RERA : {p.reraNumber}</p>
              </div>
            ))}
            {registered.length > 0 && (
              <p>
                <a href={RERA_PORTAL} target="_blank" rel="noopener noreferrer" className={LINK}>
                  rera.telangana.gov.in
                </a>
              </p>
            )}

            {settings.phones.length > 0 && (
              <div className="flex items-baseline gap-2">
                <Heading>Phone:</Heading>
                <ul className="space-y-1.5">
                  {settings.phones.map((phone) => (
                    <li key={phone}>
                      <a href={telHref(phone)} className={LINK}>
                        {groupPhone(phone)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {settings.email && (
              <div>
                <Heading>Write to Us:</Heading>
                <a href={`mailto:${settings.email}`} className={`mt-2 inline-block ${LINK}`}>
                  {settings.email}
                </a>
              </div>
            )}

            {settings.socials.length > 0 && (
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {settings.socials.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className={LINK}>
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <nav aria-label="Company" className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-7 lg:pl-12">
          <Heading>Company</Heading>
          <ul className="mt-3 space-y-3 text-small">
            {COMPANY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {projects.length > 0 && (
          <nav aria-label="Projects" className="col-span-12 sm:col-span-6 lg:col-span-3 lg:col-start-10 lg:justify-self-end">
            <Heading>Projects</Heading>
            <ul className="mt-3 space-y-3 text-small">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.slug}`} className={LINK}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {settings.reraDisclaimer && (
          <p className="col-span-12 max-w-[880px] text-caption leading-[1.6] text-primary/70">{settings.reraDisclaimer}</p>
        )}

        <div className="col-span-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 text-small text-primary/70 max-md:flex-col max-md:items-start">
          <p>© {year} BKR INFRA. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-3 max-md:flex-col">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={LINK}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
