import { cn } from '@/lib/cn'

/**
 * Standard content wrapper for every page EXCEPT the home page.
 *
 * It exists to own one number: the top offset that clears the fixed header. `app/layout.tsx`
 * renders `<AnnouncementBar>` and `<Header>` as fixed strips outside the document flow, so a
 * page that sets its own ordinary top padding slides underneath them. Measured at 390×844 and
 * 1440×900, the announcement bar (`min-h-11`, 44px) plus the header row (`min-h-16` with
 * `py-2.5`, ~83px once the vertical logo lockup is accounted for) puts the header's bottom edge
 * at 127px. Every page was using `py-24` — 96px — which left the eyebrow above each `h1`
 * rendering behind the header, with only 5px between the header's bottom and the `h1` itself.
 *
 * `pt-36` (144px) clears 127px with room to breathe, and still looks deliberate rather than
 * gappy when the announcement bar is disabled and the header's bottom edge sits at 83px.
 *
 * The home page deliberately does NOT use this: its hero is full-bleed by design and the header
 * is transparent over it (see `FULL_BLEED_HERO_ROUTES` in `Header.tsx`). Any future page whose
 * first screen is a full-bleed hero should skip this too and handle its own clearance, the way
 * `Hero.tsx` does.
 */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto max-w-7xl px-4 pb-24 pt-36 sm:px-6 lg:px-10', className)}>
      {children}
    </div>
  )
}
