import Link from 'next/link'
import { cn } from '@/lib/cn'
import { DotOrnament } from '@/components/motion/DotOrnament'

/**
 * The site's only button shape, measured off the reference:
 *
 *   inline-flex justify-between items-center · gap-[3vw] sm:gap-[2.3vw]
 *   pl-[2vw] pr-[3vw] · border-radius: 0 · black on white / white on black
 *   contents: label, then the dot ornament, pushed apart
 *
 * Two things are easy to get wrong and both change the character completely:
 *
 * 1. **Square corners.** `border-radius: 0`. Every instinct says round a button; the reference
 *    does not, and the sharp corner is what keeps it reading as architectural drafting rather
 *    than as a web control.
 * 2. **`justify-between`, not `gap`-only centring.** The label sits hard left and the ornament
 *    hard right, so the button's width is driven by its container rather than hugging its text.
 *    That is why the reference's buttons look placed rather than sized.
 *
 * Asymmetric padding (`pl` < `pr`) is deliberate too: it optically centres the pairing, because
 * the ornament is visually lighter than the text it sits opposite.
 */

export type ButtonTone = 'dark' | 'light'

/**
 * `variant` is retained purely for back-compatibility. The previous design had three variants
 * (`solid` / `outline` / `ghost`); this one has a single shape in two tones, because the reference
 * uses exactly one button. Rather than edit eight call sites for no visual gain, the old names map
 * onto the new tones: `solid` → dark, everything else → light. New code should pass `tone`.
 */
type LegacyVariant = 'solid' | 'outline' | 'ghost'

type CommonProps = {
  children: React.ReactNode
  tone?: ButtonTone
  /** @deprecated Pass `tone` instead. */
  variant?: LegacyVariant
  className?: string
  ornament?: boolean
}

type Props = CommonProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>)
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>)
  )

const BASE =
  'group inline-flex items-center justify-between rounded-none text-label sm:text-label ' +
  'gap-[3vw] sm:gap-[2.3vw] pl-[4vw] pr-[5vw] sm:pl-[2vw] sm:pr-[3vw] py-[2.6vw] sm:py-[0.65vw] ' +
  'max-sm:text-label-sm ' +
  'transition-colors duration-150 ease-in-out ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'

const TONES: Record<ButtonTone, string> = {
  // White text on black. Contrast is 21:1 — the monochrome palette makes every pairing here
  // trivially AA, which is one real benefit of losing the accent colour.
  dark: 'bg-secondary text-primary hover:bg-muted',
  light: 'bg-primary text-secondary hover:bg-hairline',
}

export function Button({ children, tone, variant, className, ornament = true, ...rest }: Props) {
  const resolved: ButtonTone = tone ?? (variant === undefined || variant === 'solid' ? 'dark' : 'light')
  const cls = cn(BASE, TONES[resolved], className)
  const inner = (
    <>
      <span>{children}</span>
      {ornament && <DotOrnament spinOnGroupHover />}
    </>
  )

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as { href: string }
    return (
      <Link href={href} className={cls} {...linkRest}>
        {inner}
      </Link>
    )
  }

  const { type = 'button', ...btnRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} className={cls} {...btnRest}>
      {inner}
    </button>
  )
}
