import { cn } from '@/lib/cn'

/**
 * The ring of eight dots that sits beside the wordmark and inside every button.
 *
 * Built as eight small squares placed ON a circle, not as eight bars radiating from the centre.
 * That distinction is the whole appearance: the reference reads as a dotted ring, and spokes long
 * enough to reach the centre fuse into a solid asterisk instead — which is what a first attempt
 * here produced. Each dot is centred in the box and then pushed out to the radius:
 *
 *   transform: translate(-50%, -50%) rotate(θ) translateY(calc(-1 * var(--dot-radius)))
 *
 * Reading right to left, as CSS applies them: move out along the dot's own vertical axis, rotate
 * that offset into position, then re-centre. Doing it this way means the radius is one number and
 * the dots stay square rather than being rotated rectangles.
 *
 * THE NEGATION MUST BE `calc(-1 * …)`, NEVER A LEADING MINUS. `translateY(-max(0.5vw, 4.8px))` is
 * not valid CSS: a unary minus is only part of a number or dimension token, so it cannot sit in
 * front of a math function. The argument fails to parse, the browser throws away the WHOLE
 * `transform` declaration, and every dot falls back to `transform: none` — all eight stack at the
 * box centre and the ring renders as a single 2.44px square. That is exactly what shipped once,
 * and it was invisible in tests because jsdom does not validate CSS values. Multiplying by -1
 * inside calc() is the only form that survives a `max()` floor.
 *
 * TWO GEOMETRIES, because the reference uses two:
 *   `sm` — the asterisk inside every button. Ring 16.56px across (radius 7.2px, dots 2.16px),
 *          sitting right-aligned in a 17.28px-wide holder.
 *   `md` — the ornament beside the wordmark, where the reference draws an SVG spray of eight
 *          irregular blobs 24.48 x 21.06px, dropped 3.6px below the cap line. We substitute the
 *          ring at that size rather than forging their artwork: the ring's diameter is the spray's
 *          measured 21.06px height, the dots are its mean blob (3.34px), and the holder carries
 *          the full 24.48px advance so the wordmark's spacing is unaffected by the substitution.
 *
 * HOVER (`spinOnGroupHover`) mirrors the reference's button gesture: 0 → 90deg while the radius
 * halves, both over 400ms on an ease-out, shrinking the ring 16.56px → 9.36px. Three things about
 * those numbers are deliberate. 90deg rather than 45deg, because an eight-point ring is symmetric
 * under 45deg — the turn is imperceptible either way, so what matters is the box, and only a
 * quarter turn leaves the square axis-aligned (45deg inflates its bounding box by √2, which reads
 * as the ornament swelling). Ease-out rather than ease-in-out, because the reference is 87% of the
 * way there at 207ms where an ease-in-out has barely left the start. And the contraction is the
 * part that actually reads, so it is not optional decoration on top of the rotation.
 *
 * The radius has to be a custom property to do that. It lives inside each dot's own transform, so
 * no class on a child can reach it; setting `--dot-radius` on the holder and overriding it on
 * `group-hover` moves all eight dots and the ring box from one declaration. Custom properties do
 * not interpolate, but the `transform`/`width`/`height` they feed do, so transitioning those
 * properties animates the change — no JS, no measurement, and `motion-reduce:` can cancel it.
 *
 * WHY A HOLDER AROUND THE RING: the ring's box is what shrinks, so if it were also the layout box
 * the button would narrow by 7.2px mid-hover — and shorten, since the ornament is the tallest thing
 * in it. The reference avoids that by parking its ornament in a fixed `w-[1.2vw]` cell and letting
 * it collapse toward the right-centre of that cell (measured: the ink's right edge stays put while
 * its centre drifts 3.6px right). The holder here is that cell, fixed on both axes.
 *
 * `aria-hidden`: pure ornament, and the adjacent label already says everything it could.
 */

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

/** Ring box: the dots sit at the radius, so the ink spans a diameter plus one dot. */
const RING = 'calc(2 * var(--dot-radius) + var(--dot-size))'

/*
 * Every dimension is floored at two thirds of its desktop value with `max()`. The measured values
 * are pure `vw`, which is correct on a desktop viewport and falls apart below it: the `sm` ring is
 * 4.5px at 390px wide, a speck rather than an ornament. Two thirds is where the ring still reads as
 * eight separate marks; below roughly 960px the floors take over and it stops shrinking.
 *
 * `max()` rather than a `max-sm:` variant because this is one continuous constraint, not a
 * breakpoint change — there is no width at which the ornament should jump size.
 *
 * The var declarations are written out as whole class strings because Tailwind scans source text:
 * a class assembled from a template literal is never generated.
 */
const SIZES = {
  // Button asterisk. Ring 1.15vw = 16.56px in a 1.2vw = 17.28px holder; halves to 0.65vw = 9.36px.
  sm: {
    holder: 'h-[max(1.15vw,11.04px)] w-[max(1.2vw,11.52px)] justify-end',
    rest: '[--dot-size:max(0.15vw,1.44px)] [--dot-radius:max(0.5vw,4.8px)]',
    contract:
      'group-hover:[--dot-radius:max(0.25vw,2.4px)] motion-reduce:group-hover:[--dot-radius:max(0.5vw,4.8px)]',
  },
  // Wordmark. Ring 1.4626vw = 21.06px centred in a 1.7vw = 24.48px holder, 0.25vw = 3.6px down.
  md: {
    holder:
      'h-[max(1.7126vw,16.45px)] w-[max(1.7vw,16.32px)] justify-center pt-[max(0.25vw,2.4px)]',
    rest: '[--dot-size:max(0.232vw,2.23px)] [--dot-radius:max(0.6153vw,5.91px)]',
    contract:
      'group-hover:[--dot-radius:max(0.3077vw,2.96px)] motion-reduce:group-hover:[--dot-radius:max(0.6153vw,5.91px)]',
  },
  // Display scale, for an ornament used as artwork rather than as punctuation.
  lg: {
    holder: 'h-[max(13.8vw,90px)] w-[max(13.8vw,90px)] justify-center',
    rest: '[--dot-size:max(1.8vw,12px)] [--dot-radius:max(5.2vw,34px)]',
    contract:
      'group-hover:[--dot-radius:max(2.6vw,17px)] motion-reduce:group-hover:[--dot-radius:max(5.2vw,34px)]',
  },
} as const

type Props = {
  size?: keyof typeof SIZES
  className?: string
  /** Rotate a quarter turn and contract on hover of an ancestor marked `group`. Off by default —
   *  the reference's ornaments are static at rest; this is only an affordance for interactive
   *  parents. */
  spinOnGroupHover?: boolean
}

export function DotOrnament({ size = 'sm', className, spinOnGroupHover = false }: Props) {
  const { holder, rest, contract } = SIZES[size]

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center',
        holder,
        rest,
        spinOnGroupHover && contract,
        className
      )}
    >
      <span
        className={cn(
          'relative block shrink-0',
          spinOnGroupHover &&
            'transition-[transform,width,height] duration-[400ms] ease-out group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0'
        )}
        style={{ width: RING, height: RING }}
      >
        {ANGLES.map((deg) => (
          <span
            key={deg}
            className={cn(
              'absolute left-1/2 top-1/2 block bg-current',
              spinOnGroupHover &&
                'transition-transform duration-[400ms] ease-out motion-reduce:transition-none'
            )}
            style={{
              width: 'var(--dot-size)',
              height: 'var(--dot-size)',
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(calc(-1 * var(--dot-radius)))`,
            }}
          />
        ))}
      </span>
    </span>
  )
}
