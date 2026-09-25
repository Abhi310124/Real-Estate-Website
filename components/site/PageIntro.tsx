import { cn } from '@/lib/cn'

/**
 * The top of every interior page, as the layout sets it: the page's name as a small section label
 * ("About", "Projects", "Blog" — Montserrat at 500, in the second display voice), then the page's H1
 * at the 64px step over two lines, with an optional aside (a link, a count) sitting on the H1's
 * baseline at the right. The label sits 64px under the header and 24px above the H1, as measured.
 *
 * Lines are passed as an array so each can start its own line exactly where the design breaks it at
 * desktop widths; a line may carry an `accent` part, set in the orange that only large type may use
 * on cream.
 */

type Line = string | { text?: string; accent: string; after?: string }

export function PageIntro({
  label,
  lines,
  aside,
  className,
}: {
  label: string
  lines: readonly Line[]
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('container-page pt-16 max-lg:pt-12', className)}>
      <p className="text-small font-medium text-navySoft">{label}</p>

      <div className="mt-6 flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-lg:gap-6">
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
