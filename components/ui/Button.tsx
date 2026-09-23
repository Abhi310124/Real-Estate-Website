import Link from 'next/link'
import { cn } from '@/lib/cn'

/**
 * The site's three buttons, each taken from the layout it follows.
 *
 * `Button` — the filled pill ("View all projects ›"): fully rounded, 8/24 padding, display face, a
 * chevron that nudges forward on hover. `shape="block"` is the same button full-width at an 8px
 * radius, which is what the layout uses for a form's Submit.
 *
 * `RingButton` — "Enquire Now": a 1.6px ring of the brand gradient around a solid face, 8px radius,
 * whose colours sweep around the button on hover (see `.ring-brand`).
 *
 * `LineButton` — "Discover …": a 1px outline pill with a trailing external-link glyph, the quieter
 * call to action that sits under a headline.
 *
 * ## Colour, and the one pairing that must not change
 *
 * Every clickable is orange. A filled button is an orange FILL with a NAVY label: 5.17:1. The tempting
 * alternative — a white or cream label, which is what an orange button "usually" has — measures 3.38:1
 * and 3.08:1 and fails AA for text this size; it has already shipped on this site once by accident.
 * If a button ever looks like it wants a light label, the answer is a darker fill, not a lighter label.
 *
 * Orange LABELS on cream use `accentInk` (4.58:1) rather than the full-strength accent (3.08:1). The
 * rings and outlines are graphics, which need 3:1, so they carry the full orange.
 */

type CommonProps = {
  children: React.ReactNode
  className?: string
  /** `pill` (default) or `block` — full width at an 8px radius, for form submits. */
  shape?: 'pill' | 'block'
  /** Show the trailing chevron. On by default for pills, off for blocks. */
  chevron?: boolean
}

type LinkProps = { href: string } & Omit<React.ComponentProps<typeof Link>, 'href' | 'className' | 'children'>
type NativeProps = { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>
type Props = CommonProps & (LinkProps | NativeProps)

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary'

const BASE =
  'group inline-flex items-center justify-center gap-3 bg-accent font-heading text-nav text-secondary ' +
  'transition-[background-color,box-shadow] duration-300 ease-ring hover:shadow-[0_8px_24px_-12px_rgba(255,73,7,0.8)] ' +
  `${FOCUS} disabled:cursor-not-allowed disabled:opacity-60`

const SHAPES = {
  pill: 'min-h-10 rounded-full px-6 py-2',
  block: 'min-h-12 w-full rounded-card px-6 py-3',
}

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-ring group-hover:translate-x-1 motion-reduce:transition-none"
    >
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Button({ children, className, shape = 'pill', chevron, ...rest }: Props) {
  const showChevron = chevron ?? shape === 'pill'
  const cls = cn(BASE, SHAPES[shape], className)
  const inner = (
    <>
      <span>{children}</span>
      {showChevron && <Chevron />}
    </>
  )

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps
    return (
      <Link href={href} className={cls} {...linkRest}>
        {inner}
      </Link>
    )
  }
  const { type = 'button', ...btnRest } = rest as NativeProps
  return (
    <button type={type} className={cls} {...btnRest}>
      {inner}
    </button>
  )
}

type AnchorProps = {
  children: React.ReactNode
  href: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  target?: string
  rel?: string
}

function ExternalIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0">
      <path d="M11 3h6v6M17 3l-8 8M14 11v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function RingButton({
  children,
  href,
  className,
  face = 'light',
  scrollTarget,
  ...rest
}: AnchorProps & {
  /** The face colour — `light` (cream) on light grounds, `dark` (navy) on navy ones. */
  face?: 'light' | 'dark'
  /**
   * The id of a block this link glides to when it is on the page. Marks the link so the route wipe
   * treats that click as an in-page jump rather than covering the screen for a navigation.
   */
  scrollTarget?: string
}) {
  return (
    <Link
      href={href}
      data-scroll-target={scrollTarget}
      className={cn('ring-brand inline-flex rounded-card', FOCUS, className)}
      {...rest}
    >
      <span
        className={cn(
          'inline-flex min-h-10 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-[6.4px] px-6 py-2 font-heading text-nav',
          face === 'light' ? 'bg-primary text-accentInk' : 'bg-secondary text-accent'
        )}
      >
        {children}
      </span>
    </Link>
  )
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-[18px] w-[18px] shrink-0">
      <path d="M6.6 2.5h-2A1.6 1.6 0 0 0 3 4.2 13 13 0 0 0 15.8 17a1.6 1.6 0 0 0 1.7-1.6v-2l-3.3-1.4-1.6 1.6a9.6 9.6 0 0 1-4.2-4.2l1.6-1.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function LineButton({
  children,
  href,
  className,
  icon = 'external',
  ...rest
}: AnchorProps & {
  /** The trailing glyph: the external-link arrow ("Discover …"), a handset for `tel:` links, or none. */
  icon?: 'external' | 'phone' | 'none'
}) {
  const cls = cn(
    'inline-flex min-h-[46px] items-center gap-3 rounded-full border border-accent px-6 py-2 font-heading text-nav text-accentInk',
    'transition-colors duration-300 ease-ring hover:bg-accent hover:text-secondary',
    FOCUS,
    className
  )
  const inner = (
    <>
      <span>{children}</span>
      {icon === 'external' && <ExternalIcon />}
      {icon === 'phone' && <PhoneIcon />}
    </>
  )
  // `tel:` and `mailto:` are not routes; a plain anchor keeps the router from trying to prefetch them.
  if (!href.startsWith('/')) {
    return (
      <a href={href} className={cls} {...rest}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  )
}
