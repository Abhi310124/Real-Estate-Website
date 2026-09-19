import type { Metadata } from 'next'
import { Caveat, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { LOAD_LOCK_CLASS } from '@/components/motion/loadCues'
import { LoadSequence } from '@/components/motion/LoadSequence'
import { LoadCurtain } from '@/components/motion/LoadCurtain'
import { RouteCurtain } from '@/components/motion/RouteCurtain'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getSiteSettings } from '@/lib/data'

/*
 * One sans, one mono, one hand. Three faces, three weights in total across them.
 *
 * The reference licenses "New Grotesk", which cannot be shipped here. Inter is the closest
 * freely-available neutral grotesque and is near-indistinguishable at the sizes this design
 * uses once the -3% tracking is applied — the tracking does more work than the face does.
 * Weights are restricted to 400 and 500 deliberately: the reference ships only those two, and
 * reaching for 600/700 is the fastest way to lose the look.
 *
 * The mono carries the small letter-spaced labels (`ST / CTF`, `THANK YOU`, the domain in the
 * footer) which on the reference are set in a typewriter face at -10% tracking. It also carries
 * the giant ghost numerals and the intake panel title, which are mono at display size — that is
 * what gives those blocks their technical register instead of a second sans voice.
 *
 * The script is the reference's third face (it licenses "Biro") and it earns its request by being
 * used exactly once: a single ~26-character handwritten line on the note card. That one run is the
 * only place the page speaks in a human hand, the only run not tracked in, and the only ink that
 * steps off the grey ramp. Caveat is the closest freely-licensed pen-written match. 400 only —
 * a handwriting face at 500 looks like a marker, not a pen.
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
const script = Caveat({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
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
    /*
     * `LOAD_LOCK_CLASS` is rendered here, by the server, so the opening's scroll hold applies from the
     * first paint. It used to be applied by Lenis instead, which meant it began only once that chunk
     * resolved — measured at 148ms on one build and 1215ms on another once two mask images joined the
     * header — and every millisecond before it was a window in which a wheel scrolled the document
     * away behind a fully opaque curtain. `releaseLoadScrollLock()` removes it, and every failure path
     * in the load sequence routes through that function.
     */
    <html lang="en" className={`${sans.variable} ${mono.variable} ${script.variable} ${LOAD_LOCK_CLASS}`}>
      <head>
        {/*
          The rescue. A hold applied by markup and released by script is a trap if the script never
          runs, so with scripting off the hold is overridden outright. This is the same pattern the
          hero uses for its own from-states, and it is the reason the hold is safe to put in markup at
          all.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>html.${LOAD_LOCK_CLASS},html.${LOAD_LOCK_CLASS} body{overflow:visible!important}</style>`,
          }}
        />
      </head>
      <body className="bg-primary font-sans text-secondary antialiased">
        <a
          href="#main"
          // Above the route curtain's 999999, not merely above the header. The curtain is
          // aria-hidden and pointer-events-none so the link stays focusable and operable behind it
          // either way, but a focused control the visitor cannot SEE fails WCAG 2.4.11, and a
          // navigation's black-out lasts about a second and a half.
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000000] focus:bg-secondary focus:px-4 focus:py-2 focus:text-primary"
        >
          Skip to content
        </a>
        <LenisProvider>
          {/* One GSAP timeline owns every offset in the opening: it fades the curtain, holds the
              visitor at scrollY 0, and fires the cues the header and hero animate from. Mounted
              first so its claim on the load lands before any consumer's effect runs — a consumer
              that resolved first would fall back to its scroll trigger and fire immediately,
              which is the whole failure the cues exist to prevent. */}
          <LoadSequence />
          {/* Fixed full-viewport black panel that holds, then fades 1 → 0. Sits above the page but
              below the skip link, and is pointer-events-none throughout so it can never intercept
              a click even mid-fade. */}
          <LoadCurtain />
          {/* The same gesture for navigations rather than the first load: inert until the first
              route change, so it can never double-fade against the curtain above. Deliberately a
              second element rather than one shared panel — one element driven by two owners with
              two animation mechanisms is how a stuck curtain gets built, and since only ever one
              of them animates the result is visually identical. */}
          <RouteCurtain />
          <SiteHeader settings={settings} />
          {/*
            `overflow-x-clip` is the page's horizontal-overflow backstop, and it belongs here rather
            than on `body` because `<main>` is the direct parent of every route's sections and is
            therefore the box whose `scrollWidth` the viewport reads. Several sections deliberately
            paint outside themselves — the 3D ring is a 114.4vw stage under a 132vw perspective, every
            photograph renders at 1.2x its frame, the testimonial band is carried 391px down over the
            chapter below it — and although each of those clips itself, a clipped box still REPORTS
            its overflowing width. On a phone that is enough to widen the layout viewport: the home
            page resolved to an 812px viewport on a 390px device, so the entire mobile design rendered
            zoomed out. The reference absorbs this on its own app root; this is the equivalent.

            `clip`, never `hidden`. `overflow-x: hidden` would make this a scroll container, which
            breaks every `position: sticky` descendant — the intro's preview card, the footer's
            closing slab — and hands Lenis a scrollport it does not own. `clip` clips without creating
            one, and it does not force the other axis to compute as `auto` the way `hidden` does.
          */}
          <main id="main" className="overflow-x-clip">
            {children}
          </main>
          <SiteFooter settings={settings} />
        </LenisProvider>
      </body>
    </html>
  )
}
