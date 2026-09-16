'use client'
import Link from 'next/link'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonTone = 'navy' | 'white'

type ButtonProps = {
  variant?: ButtonVariant
  /** Only consulted by `outline`/`ghost` — `solid` is always orange-on-white (Ruling 9). */
  tone?: ButtonTone
  className?: string
  children: React.ReactNode
  /** Presence of `href` decides `<a>`/`<Link>` vs `<button>` — there is no separate `as` prop. */
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  target?: string
  rel?: string
  disabled?: boolean
  'aria-label'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: React.AriaAttributes['aria-haspopup']
  'aria-controls'?: string
}

// Every animated state here is transform/opacity only, per the master prompt's animation
// constraint — active:scale and the hover opacity fade are both compositor-only properties,
// nothing that forces layout or paint.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold ' +
  'transition-opacity duration-200 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange ' +
  'disabled:pointer-events-none disabled:opacity-50'

function toneClass(variant: ButtonVariant, tone: ButtonTone): string {
  if (variant === 'solid') {
    // Ruling 9: orange is only ever paired with a white label on a filled control —
    // `tone` has nothing to choose between here.
    return 'bg-orange text-white hover:opacity-90'
  }
  if (variant === 'outline') {
    return tone === 'white'
      ? 'border border-white text-white hover:bg-white/10'
      : 'border border-navy-800 text-navy-800 hover:bg-navy-800/5'
  }
  // ghost
  return tone === 'white' ? 'text-white hover:opacity-80' : 'text-navy-800 hover:opacity-80'
}

/**
 * Shared CTA atom for the whole site — Header's "Enquire Now", FloatingActions' call/WhatsApp
 * rail, and every later task's project-card and form actions all render through this one
 * component so the three variants and the touch-target/focus-ring rules stay in exactly one
 * place. Renders a `next/link` for internal hrefs (`/...`), a plain `<a>` for external/`tel:`/
 * `wa.me` hrefs, and a `<button>` when no `href` is given at all.
 */
export function Button({
  variant = 'solid',
  tone = 'navy',
  className,
  children,
  href,
  type = 'button',
  ...rest
}: ButtonProps) {
  const cls = cn(BASE, toneClass(variant, tone), className)

  if (href) {
    if (href.startsWith('/') || href.startsWith('#')) {
      return (
        <Link href={href} className={cls} {...rest}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
