import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import type { SiteSettings } from '@/lib/data/types'

type Props = { settings: SiteSettings }

// Mirrors MegaMenu.tsx's own PRIMARY_LINKS. Kept as its own small literal here rather than
// exported and shared from MegaMenu.tsx: Task 8's brief scopes this file's changes to
// components/layout/Footer.tsx, app/layout.tsx and tests/e2e/footer.spec.ts, and reaching into
// MegaMenu.tsx to export a four-item array would widen that diff for a minor DRY gain. Flagged
// in batch-b-report.md as a small, known duplication rather than silently deduplicated.
const PRIMARY_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const LINK_CLASS =
  'text-sm text-ivory/80 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange rounded'

// Same visual treatment as the Eyebrow atom (.eyebrow + text-eyebrow), applied directly to an
// <h2> instead of going through that component: Eyebrow always renders a <span>, and these
// four column labels are genuine section headings for screen-reader heading navigation inside
// the footer landmark, not inline text.
const COLUMN_HEADING_CLASS = 'eyebrow text-eyebrow text-ivory/60'

/**
 * Site-wide footer: a three-pillar strip (Develop/Design/Deliver), then brand column, category
 * links, primary routes, and contact details, on a champagne-hairline-divided navy field,
 * closed by a copyright + RERA disclaimer bar. A plain server component — nothing here is
 * interactive beyond ordinary links, so unlike Header/MegaMenu it needs no 'use client' and no
 * hooks.
 */
export function Footer({ settings }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 text-ivory">
      {/* The brief's Step 3 names four columns (brand/blurb, categories, primary routes,
          contact) but its own Step 1 test requires the three pillar titles to appear in the
          footer too, which none of those four columns carry. Resolved by addition, not
          substitution: this strip sits above the four-column grid rather than displacing any
          of them — flagged in batch-b-report.md as a brief inconsistency worked around by
          best judgment, per this batch's own instructions for handling one. Champagne text is
          used for the titles: Ruling 9 bars champagne as text on ivory, not on navy, and this
          footer is navy-900 (~7.5:1 contrast either way, see lib/tokens.ts's contrastRatio). */}
      <div className="mx-auto max-w-7xl border-b border-champagne/40 px-4 py-10 sm:px-6">
        <ul className="grid gap-8 sm:grid-cols-3 sm:divide-x sm:divide-champagne/30">
          {settings.pillars.map((pillar) => (
            <li key={pillar.title} className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <p className="eyebrow text-eyebrow text-champagne">{pillar.title}</p>
              <p className="mt-2 text-sm text-ivory/80">{pillar.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
          <Logo variant="light" className="h-10" />
          <p className="max-w-xs text-sm text-ivory/80">{settings.footerBlurb}</p>

          {/* `socials: []` is a valid state, not missing data (progress.md) — degrade to
              rendering nothing at all rather than an empty heading or list. */}
          {settings.socials.length > 0 && (
            <ul className="flex flex-wrap gap-4 pt-2">
              {settings.socials.map((social) => (
                <li key={social.platform}>
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className={COLUMN_HEADING_CLASS}>Explore</h2>
          <ul className="mt-4 space-y-3">
            {settings.categories.map((category) => (
              <li key={category.value}>
                <Link href={`/projects?category=${category.value}`} className={LINK_CLASS}>
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={COLUMN_HEADING_CLASS}>Site</h2>
          <ul className="mt-4 space-y-3">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={COLUMN_HEADING_CLASS}>Contact</h2>
          <ul className="mt-4 space-y-3">
            {settings.phones.map((phone) => (
              <li key={phone}>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className={LINK_CLASS}>
                  {phone}
                </a>
              </li>
            ))}
            {/* `email` is optional and the mock omits it: an invented mailto: would silently
                swallow enquiries, so this renders only once a real address is supplied.
                Binds Tasks 8 and 18 (progress.md). */}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className={LINK_CLASS}>
                  {settings.email}
                </a>
              </li>
            )}
            <li className="text-sm text-ivory/80">{settings.address}</li>
          </ul>
        </div>
      </div>

      {/* Second champagne hairline, this one purely decorative (a border, never text) —
          separates the link columns above from the copyright/RERA bar below. */}
      <div aria-hidden="true" className="mx-auto max-w-7xl border-t border-champagne/40" />

      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-ivory/60 sm:px-6">
        <p>&copy; {year} BKR INFRA. All rights reserved.</p>
        <p className="max-w-4xl">{settings.reraDisclaimer}</p>
      </div>
    </footer>
  )
}
