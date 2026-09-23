import Link from 'next/link'
import { cn } from '@/lib/cn'

/**
 * The top of every interior page, as the layout sets it: a small breadcrumb, then the page's H1 at the
 * 64px step over two lines, with an optional aside (a link, a count) sitting on the H1's baseline at
 * the right.
 *
 * Lines are passed as an array so each can start its own line exactly where the design breaks it at
 * desktop widths; a line may carry an `accent` part, set in the orange that only large type may use
 * on cream.
 */

type Line = string | { text?: string; accent: string; after?: string }

export function PageIntro({
  crumb,
  lines,
  aside,
  className,
}: {
  crumb: string
  lines: readonly Line[]
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('container-page pt-[72px] max-lg:pt-12', className)}>
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-small text-navySoft">
          <li>
            <Link
              href="/"
              className="text-accentInk transition-colors duration-300 hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{crumb}</li>
        </ol>
      </nav>

      <div className="mt-10 flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-lg:gap-6">
        <h1 className="font-heading text-h1 text-secondary max-sm:text-h1-sm">
          {/* The authored breaks are for the desktop measure. Below it the lines run on as one
              sentence and wrap where the phone's width puts them — a break drawn for 1344px
              stranded single words at 390px. */}
          {lines.map((line, i) => (
            <span key={i} className="lg:block">
              {typeof line === 'string' ? (
                line
              ) : (
                <>
                  {line.text}
                  <span className="text-accentInk">{line.accent}</span>
                  {line.after}
                </>
              )}
              {i < lines.length - 1 && ' '}
            </span>
          ))}
        </h1>
        {aside && <div className="shrink-0 pb-3">{aside}</div>}
      </div>
    </section>
  )
}
