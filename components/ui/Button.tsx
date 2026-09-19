import Link from 'next/link'
import { cn } from '@/lib/cn'
import { DotOrnament } from '@/components/motion/DotOrnament'

/**
 * The site's only button shape, measured off the reference at 1440:
 *
 *   inline-flex justify-between items-center · gap 33.12px (2.3vw)
 *   padding 10.08px 12.96px (0.7vw block, 0.9vw inline) · border-radius 0
 *   contents: label, then the dot ornament
 *   box 131.14 x 41.27px for a "Contact" label
 *
 * **THE DESKTOP PADDING IS SYMMETRIC.** The reference writes `pl-[2vw] pr-[3vw] sm:px-[0.9vw]`:
 * the asymmetric pair is its MOBILE rule, and from 640px up the `sm:` override replaces both sides
 * with 12.96px. It is tempting to carry the asymmetry into desktop on the theory that an ornament
 * is visually lighter than the text opposite it and so wants less room — but that theory costs
 * 46px of width (177px instead of 131px for "Contact"), and that difference is most of what
 * separates a header that reads as placed from one that reads as bulky.
 *
 * The block padding is the whole story on the cross axis: 2 x 10.08px plus the ornament cell,
 * which is the tallest item in the row — the label's line box is only 15.84px, since `text-label`
 * is line-height 1. The reference's cell is 21.11px tall, and that is what makes the box 41.27px
 * rather than 36.72px. `DotOrnament`'s fixed cell height is therefore load-bearing geometry here,
 * not decoration, and the ornament must not be wrapped in a holder of our own: the cell is inside
 * the component, and a second one would double the advance.
 *
 * `max-sm:min-h-11` is ours and not the reference's. Below 640px the reference's own `py-[1vw]` is
 * 3.9px a side at 390px, which lands the box around 20px tall — under the 24px minimum target
 * size, let alone a comfortable thumb. The floor only exists below the `sm` breakpoint, so every
 * desktop measurement above is untouched by it.
 *
 * Two structural choices, both easy to undo by accident:
 *
 * 1. **Square corners.** `border-radius: 0`. Every instinct says round a button; the reference does
 *    not, and the sharp corner is what keeps it reading as architectural drafting rather than as a
 *    web control. An e2e test asserts `0px` on every button on the home page.
 * 2. **`justify-between` AND the wide gap**, which do different jobs. At desktop the box hugs its
 *    content — 131.14px is exactly 25.92 padding + 54.9 label + 33.12 gap + 17.28 ornament cell —
 *    so `justify-between` has no free space to distribute and the 2.3vw gap is what holds the label
 *    and the ornament apart. `justify-between` bites at the call sites that stretch the box
 *    (`w-full` on mobile, a full-width form submit); there it keeps the label hard left and the
 *    ornament hard right instead of collapsing the pair into a centred pill.
 *
 * **HOVER MOVES TWO THINGS AND CHANGES NO COLOUR.** The reference's background stays rgb(0,0,0) on
 * hover — no tone shift, no border, no opacity. What happens instead is that the label slides
 * 7.2px right (0.5vw) while the ornament turns a quarter turn and contracts, both on one shared
 * ~400ms ease-out (measured 0.129 at 24ms, 0.502 at 89ms, 0.875 at 207ms, arriving at 390ms; the
 * early acceleration is the tell — an ease-in-out is barely 12% through at 207ms). Reaching for a
 * `hover:bg-*` is the obvious way to make hover "more obvious", and it is the one thing the
 * reference deliberately refuses: the gesture is the feedback, and a filled black box that
 * lightens reads as a web control again.
 *
 * The consequence is that under `prefers-reduced-motion` this button has no hover state at all —
 * the label holds still and `DotOrnament` cancels its own turn. That is the right trade: a 7.2px
 * instant jump is worse for a motion-sensitive reader than no feedback, and the reference has no
 * non-motion hover state to substitute. `cursor: pointer` and the focus ring carry it.
 *
 * The focus ring is drawn INSIDE the box. `outline-current` is the button's own text colour, so on
 * the dark tone it is white — and at a positive offset that white ring lands on the page behind the
 * button, which is usually white too, i.e. invisible exactly when a keyboard user needs it. Inset,
 * it sits on the button's own fill: 21:1 in both tones, whatever section the button is dropped on.
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
  'gap-[3vw] sm:gap-[2.3vw] pl-[2vw] pr-[3vw] sm:px-[0.9vw] py-[1vw] sm:py-[0.7vw] max-sm:min-h-11 ' +
  'max-sm:text-label-sm ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-current'

/** The label. `block` is not cosmetic: a transform does not apply to a non-replaced inline box, so
 *  without it the 0.5vw slide silently does nothing. */
const LABEL =
  'block transition-transform duration-[400ms] ease-out group-hover:translate-x-[0.5vw] ' +
  'motion-reduce:transition-none motion-reduce:group-hover:translate-x-0'

/*
 * Both tones are the ORANGE fill. That is the whole point of a button here: the accent is the
 * clickable, so a button that is not orange is not reading as a button.
 *
 * The label is NAVY in both, and this is the one value in the file that must not be changed on
 * instinct. navy-on-orange measures 5.17:1 and clears AA. The two pairings that look more natural
 * both fail: white-on-orange is 3.38:1 and cream-on-orange is 3.08:1 — and white-on-orange is not a
 * hypothetical, it had shipped on every button on this site before anyone measured it. If a button
 * ever looks like it wants a light label, the fix is a darker fill, not a lighter label.
 *
 * `dark` and `light` no longer describe the fill, because the fill is the same either way — they now
 * say which ground the button is sitting ON, which is what decides the focus ring. `outline-current`
 * would draw a navy ring on an orange fill inset 4px, which is legible on a cream page and muddy on
 * a navy one, so the dark-ground tone rings in cream instead.
 */
const TONES: Record<ButtonTone, string> = {
  /** On a navy chapter. */
  dark: 'bg-accent text-secondary focus-visible:outline-primary',
  /** On a cream chapter. */
  light: 'bg-accent text-secondary',
}

export function Button({ children, tone, variant, className, ornament = true, ...rest }: Props) {
  const resolved: ButtonTone = tone ?? (variant === undefined || variant === 'solid' ? 'dark' : 'light')
  const cls = cn(BASE, TONES[resolved], className)
  const inner = (
    <>
      <span className={LABEL}>{children}</span>
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
