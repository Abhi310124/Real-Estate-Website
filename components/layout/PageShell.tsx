import { cn } from '@/lib/cn'

/**
 * The wrapper every route except the home page uses to open the page below the fixed header.
 *
 * ## It owns one number, and that number is a top offset
 *
 * `SiteHeader` renders its band `fixed top-[1.5vw]` with no vertical padding of its own, so the
 * band is 41.27px of Contact button hanging 21.6px below the viewport top and its bottom edge sits
 * at 62.9px at a 1440 viewport. `pt-[20vw]` — 288px — is not that clearance plus a margin: it is
 * the reference's own opening gap on its listing routes, four and a half times the band's depth,
 * and the clearance comes free inside it. Below `sm` the band is *taller* than its desktop self (a
 * 44px Menu target under a 31.2px label) while 20vw collapses to 78px, so the mobile step is 30vw,
 * the same figure `app/contact/page.tsx` reached for its own hand-rolled clearance.
 *
 * The number this replaces was `pt-36` — 144px, argued from an `AnnouncementBar`, a `min-h-16`
 * header row and a `Header.tsx` that are all gone from the repository. It was about twice the
 * clearance it claimed to need and it was not on the site's `vw` scale.
 *
 * ## There is no centred container any more, and its absence is the point
 *
 * This used to wrap its children in `mx-auto max-w-7xl px-4 sm:px-6 lg:px-10`. No route on the
 * reference uses a centred max-width, and here that container actively broke the design: every
 * section is a `.layout-grid` carrying the page margin as its own `padding-inline`, so nesting a
 * 1280px centred box around one resolved the grid to x=120 w=1200 where the header and footer above
 * and below it run 20..1420 — the single set of column edges the whole composition aligns to,
 * broken on one route. Two of the three consumers had already voted on this: `/journal` neutralised
 * the container with `!max-w-none !px-0`, and `/contact` documents skipping this component outright
 * for exactly this reason.
 *
 * `contained` keeps the old behaviour available for the one kind of page that wants it: children
 * that are NOT built on `.layout-grid` and so have nothing else holding them off the viewport
 * edges — the 404, whose content is a centred stack rather than a grid. Its inline padding is
 * `--margin` rather than the old `px-4 sm:px-6 lg:px-10` so that even a contained page begins on
 * the same left edge as every grid on the site.
 *
 * `flush` drops the closing gap, for a route that ends in a block owning its own approach margin.
 * `ContactIntake` carries `mt-[20vw]`, and on the reference that section butts straight into the
 * footer; this wrapper's own bottom padding on top of it would be a gap the reference does not have.
 */
const CLEARANCE = 'pt-[20vw] max-sm:pt-[30vw]'
const CLOSING = 'pb-[10vw] max-sm:pb-[20vw]'
const CONTAINER = 'mx-auto max-w-7xl px-[var(--margin)]'

export function PageShell({
  children,
  className,
  contained = false,
  flush = false,
}: {
  children: React.ReactNode
  className?: string
  /** Centre the children in a max-width container. Only for content that is not on `.layout-grid`. */
  contained?: boolean
  /** Drop the bottom gap, for a page closing with a section that supplies its own approach margin. */
  flush?: boolean
}) {
  return (
    <div className={cn(CLEARANCE, !flush && CLOSING, contained && CONTAINER, className)}>
      {children}
    </div>
  )
}
