import type { Metadata } from 'next'
import { SoftTriangle } from '@/components/decor/SoftTriangle'
import { Button, LineButton } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: '404 — Page Not Found | BKR INFRA',
  robots: { index: false },
}

// No <main> here: app/layout.tsx already wraps every route's content — this one included — in the
// single <main id="main">.
export default function NotFound() {
  return (
    <section className="relative flex min-h-[70svh] flex-col items-center justify-center overflow-x-clip px-5 py-24 text-center">
      <SoftTriangle className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[680px] -translate-x-1/2 -translate-y-1/2" />
      <p className="relative font-heading text-h4 text-navySoft">404</p>
      <h1 className="relative mt-4 font-heading text-h1 text-secondary max-sm:text-h1-sm">
        This page doesn&apos;t <span className="text-accentInk">exist</span>
      </h1>
      <p className="relative mt-6 max-w-[520px] text-body text-secondary">
        The page you&apos;re looking for may have been moved, renamed, or never existed. Try one of these instead.
      </p>
      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">Back to Home</Button>
        <LineButton href="/projects" icon="none">
          Browse Projects
        </LineButton>
      </div>
    </section>
  )
}
