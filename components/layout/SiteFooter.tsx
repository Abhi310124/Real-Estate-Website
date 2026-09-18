import Link from 'next/link'
import { DotOrnament } from '@/components/motion/DotOrnament'
import type { SiteSettings } from '@/lib/data/types'

/**
 * Black footer with a sticky white slab beneath it.
 *
 * The slab is the reference's closing move: a `h-[20vw] sticky bottom-0 bg-primary` block that the
 * black footer scrolls up and over. Because it is sticky rather than fixed it is only revealed at
 * the very end of the document, so the page finishes on white rather than simply stopping on
 * black. It is decorative and `aria-hidden`.
 *
 * The mono labels along the bottom (`ST / CTF`, `THANK YOU`, the domain) are set at -10% tracking
 * — much tighter than the -3% used everywhere else, which is what makes them read as stamped
 * metadata rather than as body copy.
 *
 * Contact details render conditionally: `settings.email` is optional and currently unset, because
 * a `mailto:` to a mailbox that does not exist swallows an enquiry while appearing to work. Same
 * for `socials`, which is `[]`. Both appear automatically once real values are supplied.
 */

const SITE_INDEX = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/studio', label: 'Studio' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
]

const LEGAL = [
  { href: '/legal/privacy', label: 'Privacy policy' },
  { href: '/legal/terms', label: 'Terms of use' },
  { href: '/legal/cookies', label: 'Cookie policy' },
]

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-secondary pt-[10vw] text-primary max-sm:pt-[16vw]">
      <div className="layout-grid relative z-10 gap-y-[8vw] bg-secondary pb-[6vw]">
        <div className="col-span-12 sm:col-span-3">
          <h2 className="text-label text-primary/50 max-sm:text-label-sm">Site index</h2>
          <ul className="mt-[1.4vw] space-y-[0.6vw] max-sm:mt-[4vw] max-sm:space-y-[2vw]">
            {SITE_INDEX.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-label transition-opacity duration-150 ease-in-out hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-sm:text-label-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 sm:col-span-3">
          <h2 className="text-label text-primary/50 max-sm:text-label-sm">Legal</h2>
          <ul className="mt-[1.4vw] space-y-[0.6vw] max-sm:mt-[4vw] max-sm:space-y-[2vw]">
            {LEGAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-label transition-opacity duration-150 ease-in-out hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-sm:text-label-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 sm:col-span-3">
          <h2 className="text-label text-primary/50 max-sm:text-label-sm">Get in touch</h2>
          <ul className="mt-[1.4vw] space-y-[0.6vw] max-sm:mt-[4vw] max-sm:space-y-[2vw]">
            {settings.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="text-label transition-opacity duration-150 ease-in-out hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current max-sm:text-label-sm"
                >
                  {phone}
                </a>
              </li>
            ))}
            {settings.email && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-label transition-opacity duration-150 ease-in-out hover:opacity-60 max-sm:text-label-sm"
                >
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
          {settings.socials.length > 0 && (
            <ul className="mt-[1.4vw] flex gap-[1vw] max-sm:mt-[4vw] max-sm:gap-[4vw]">
              {settings.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-label hover:opacity-60 max-sm:text-label-sm"
                  >
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-span-12 sm:col-span-3">
          <h2 className="text-label text-primary/50 max-sm:text-label-sm">Office</h2>
          <p className="mt-[1.4vw] max-w-[18vw] text-label max-sm:mt-[4vw] max-sm:max-w-none max-sm:text-label-sm">
            {settings.address}
          </p>
          <div className="mt-[2vw] flex items-center gap-[0.5vw] max-sm:mt-[6vw]">
            <span className="text-label max-sm:text-label-sm">BKR</span>
            <DotOrnament />
          </div>
        </div>

        {/* Stamped metadata row. -10% tracking via `font-mono` + the `mono` size token. */}
        <div className="col-span-12 flex flex-wrap items-center justify-between gap-y-[3vw] border-t border-primary/20 pt-[2vw] font-mono text-mono uppercase text-primary/70 max-sm:pt-[6vw] max-sm:text-mono-sm">
          <span>ST / BKR</span>
          <span>Thank you</span>
          <span>© {year} BKR INFRA</span>
        </div>

        {/* text-primary/60, not /40: white at 40% over black is an effective #666, which measures
            ~4.0:1 and fails AA for text. axe flagged it on all five routes. /60 is ~8.3:1. */}
        <p className="col-span-12 text-label text-primary/60 max-sm:text-label-sm">
          {settings.reraDisclaimer}
        </p>
      </div>

      {/* The closing white slab. Sticky, so it is only uncovered at the very bottom of the
          document — the page lands on white instead of ending on black. */}
      <div aria-hidden="true" className="sticky bottom-0 h-[20vw] w-full bg-primary max-sm:h-[30vw]" />
    </footer>
  )
}
