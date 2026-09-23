import type { Metadata } from 'next'
import { Archivo, Montserrat } from 'next/font/google'
import './globals.css'
import { LenisProvider } from '@/components/motion/LenisProvider'
import { LOAD_LOCK_CLASS } from '@/components/motion/loadCues'
import { LoadSequence } from '@/components/motion/LoadSequence'
import { LoadCurtain } from '@/components/motion/LoadCurtain'
import { RouteCurtain } from '@/components/motion/RouteCurtain'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getProjects, getSiteSettings } from '@/lib/data'

/*
 * Two faces: one to read, one to look at.
 *
 * Body copy is Montserrat at 400 and 500 — exactly the face and the two weights the layout this site
 * follows was set in, so it is a like-for-like match rather than a substitute.
 *
 * Display type is Archivo. The layout's own display face is a commercial grotesque that cannot be
 * shipped here; Archivo is the closest freely-licensed match, and the reason is its `wdth` axis.
 * The reference face is wide, and a wide face is not something a normal-width grotesque can be
 * tracked into — spacing letters apart makes a narrow face look spaced, not wide. Archivo's width
 * axis runs to 125%, and at 116% the same headline set in both faces comes out at the same line
 * length with the same round, single-storey-g construction. Loading the axis rather than fixed
 * weights is also what lets one file serve both the 400 headings and the 500 ghosted type.
 */
const sans = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})
const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-display',
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
  const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()])

  return (
    /*
     * `LOAD_LOCK_CLASS` is rendered here, by the server, so the opening's scroll hold applies from the
     * first paint. It used to be applied by Lenis instead, which meant it began only once that chunk
     * resolved — measured at 148ms on one build and 1215ms on another once two mask images joined the
     * header — and every millisecond before it was a window in which a wheel scrolled the document
     * away behind a fully opaque curtain. `releaseLoadScrollLock()` removes it, and every failure path
     * in the load sequence routes through that function.
     */
    <html lang="en" className={`${sans.variable} ${display.variable} ${LOAD_LOCK_CLASS}`}>
      <head>
        {/*
          The rescue. Two things in the markup are only ever undone by script — the scroll hold, and
          the opening panel covering the viewport — and both are traps if the script never runs. With
          scripting off the hold is overridden and the panel is removed outright. Without the second
          rule a visitor with JavaScript disabled saw a navy screen and nothing else.
        */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<style>html.${LOAD_LOCK_CLASS},html.${LOAD_LOCK_CLASS} body{overflow:visible!important}[data-load-curtain]{display:none!important}</style>`,
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
          {/* One GSAP timeline owns every offset in the opening: it runs the counter and the rule,
              holds the visitor at scrollY 0, wipes the panel away and fires the cues the hero
              animates from. Mounted first so its claim on the load lands before any consumer's
              effect runs — a consumer that resolved first would fall back to its scroll trigger
              and fire immediately, which is the whole failure the cues exist to prevent. */}
          <LoadSequence />
          {/* The loading panel: a fixed full-viewport navy sheet with the counter and the brand line,
              wiped off to the right. Sits above the page but below the skip link, and is
              pointer-events-none throughout so it can never intercept a click even mid-wipe. */}
          <LoadCurtain />
          {/* The same gesture for navigations rather than the first load: inert until the first
              route change, so it can never double up with the panel above. Deliberately a second
              element rather than one shared panel — one element driven by two owners is how a
              stuck curtain gets built. */}
          <RouteCurtain />
          <SiteHeader settings={settings} />
          {/*
            `overflow-x-clip` is the page's horizontal-overflow backstop, and it belongs here rather
            than on `body` because `<main>` is the direct parent of every route's sections and is
            therefore the box whose `scrollWidth` the viewport reads. Several sections deliberately
            paint outside themselves — the soft triangles run past both edges, the hero photograph is
            tipped in 3D — and although each of those clips itself, a clipped box still REPORTS its
            overflowing width. On a phone that is enough to widen the layout viewport, so the entire
            mobile design renders zoomed out. This clip is the backstop against that.

            `clip`, never `hidden`. `overflow-x: hidden` would make this a scroll container, which
            breaks every `position: sticky` descendant — the project page's section nav among
            them — and hands Lenis a scrollport it does not own. `clip` clips without creating
            one, and it does not force the other axis to compute as `auto` the way `hidden` does.
          */}
          <main id="main" className="overflow-x-clip">
            {children}
          </main>
          <SiteFooter settings={settings} projects={projects} />
        </LenisProvider>
      </body>
    </html>
  )
}
