import type { Metadata } from 'next'
import { PageShell } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'

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
      <Eyebrow className="text-navy-700">404</Eyebrow>
      <h1 className="mt-3 font-display-expanded text-display-lg text-navy-800">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-4 max-w-md text-body text-navy-700">
        The page you&apos;re looking for may have been moved, renamed, or never existed. Try one
        of these instead.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">Back to Home</Button>
        <Button href="/projects" variant="outline">
          Browse Projects
        </Button>
      </div>
    </PageShell>
  )
}
