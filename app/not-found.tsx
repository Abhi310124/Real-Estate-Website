import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: '404 — Page Not Found | BKR INFRA',
  robots: { index: false },
}

// Ruling 10 (which is Ruling 6 applied specifically to this file): no <main> here.
// app/layout.tsx already wraps every route's content — this one included — in a single
// <main id="main">, so this file renders a plain PageShell, the same wrapper /about, /contact
// and /projects use for their own non-hero content, rather than a second, nested <main>.
export default function NotFound() {
  return (
    <PageShell className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      {/* Every class on this page previously came from the retired navy/orange palette —
          `text-navy-700`, `text-navy-800` and `font-display-expanded` — none of which resolve to a
          key in the config any more, so they emitted nothing at all and the page had been silently
          rendering at default body colour with no display weight. Dead classes are invisible
          precisely because they fail open. */}
      <p className="font-mono text-mono uppercase text-muted max-sm:text-mono-sm">404</p>
      <h1 className="mt-[1.6vw] text-display-lg font-display max-sm:mt-[5vw] max-sm:text-display-sm-lg">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-[1.6vw] max-w-[36vw] text-body max-sm:mt-[5vw] max-sm:max-w-none max-sm:text-body-sm">
        The page you&apos;re looking for may have been moved, renamed, or never existed. Try one
        of these instead.
      </p>
      <div className="mt-[3vw] flex flex-wrap items-center justify-center gap-[1.4vw] max-sm:mt-[8vw] max-sm:gap-[4vw]">
        <Button href="/">Back to Home</Button>
        <Button href="/projects" tone="light">
          Browse Projects
        </Button>
      </div>
    </PageShell>
  )
}
