import Link from 'next/link'
import type { SiteSettings } from '@/lib/data/types'

type Props = { settings: SiteSettings }

// Fixed height in Tailwind's default scale (2.75rem / 44px, also satisfying the min-h-11
// touch-target rule for the link variant). Header.tsx offsets itself below this bar with a
// literal `top-11` class matched to the same 2.75rem step — Tailwind's JIT content scanner
// needs each class as a literal string in its own file, so this constant cannot actually be
// shared across files without breaking that scan; if this number ever changes, `top-11` in
// Header.tsx must be updated by hand to match.
const ANNOUNCEMENT_BAR_HEIGHT_CLASS = 'min-h-11'

/**
 * Thin brand strip above the header, rendered only while `settings.announcementBar.enabled`
 * is true — there is no dismiss affordance and no independent client state, so this stays a
 * server component. Fixed at the very top (z-80, the header's own slot in the fixed
 * z-index budget — this bar and the header form one fixed chrome stack, never both fixed
 * independently at top:0).
 */
export function AnnouncementBar({ settings }: Props) {
  const { announcementBar } = settings
  if (!announcementBar.enabled) return null

  const text = <span className="text-xs font-medium tracking-wide">{announcementBar.text}</span>

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[80] flex ${ANNOUNCEMENT_BAR_HEIGHT_CLASS} items-center justify-center bg-navy-900 px-4 text-center text-ivory`}
    >
      {announcementBar.link ? (
        <Link
          href={announcementBar.link}
          className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          {text}
        </Link>
      ) : (
        text
      )}
    </div>
  )
}
