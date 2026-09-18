import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { LoadCurtain } from '@/components/motion/LoadCurtain'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getSiteSettings } from '@/lib/data'

/*
 * One sans, one mono, two weights between them.
 *
 * The reference licenses "New Grotesk", which cannot be shipped here. Inter is the closest
 * freely-available neutral grotesque and is near-indistinguishable at the sizes this design
 * uses once the -3% tracking is applied — the tracking does more work than the face does.
 * Weights are restricted to 400 and 500 deliberately: the reference ships only those two, and
 * reaching for 600/700 is the fastest way to lose the look.
 *
 * The mono carries the small letter-spaced labels (`ST / CTF`, `THANK YOU`, the domain in the
 * footer) which on the reference are set in a typewriter face at -10% tracking.
 */
const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'BKR INFRA — Contemporary Residential Development, Hyderabad',
  description:
    'BKR INFRA develops open plots, villas, apartments and independent houses across Hyderabad, shaped through simplicity and material-led thinking.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-primary font-sans text-secondary antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[130] focus:bg-secondary focus:px-4 focus:py-2 focus:text-primary"
        >
          Skip to content
        </a>
        <LenisProvider>
          {/* Fixed full-viewport black panel that fades 1 → 0 on first paint. Sits above the
              page but below the skip link, and is pointer-events-none throughout so it can
              never intercept a click even mid-fade. */}
          <LoadCurtain />
          <SiteHeader settings={settings} />
          <main id="main">{children}</main>
          <SiteFooter settings={settings} />
        </LenisProvider>
      </body>
    </html>
  )
}
