import { cn } from '@/lib/cn'

/**
 * The ring of eight dots that sits beside the wordmark and inside every button.
 *
 * Built as eight small squares placed ON a circle, not as eight bars radiating from the centre.
 * That distinction is the whole appearance: the reference reads as a dotted ring, and spokes long
 * enough to reach the centre fuse into a solid asterisk instead — which is what a first attempt
 * here produced. Each dot is centred in the box and then pushed out to the radius:
 *
 *   transform: translate(-50%, -50%) rotate(θ) translateY(-radius)
 *
 * Reading right to left, as CSS applies them: move out along the dot's own vertical axis, rotate
 * that offset into position, then re-centre. Doing it this way means the radius is one number and
 * the dots stay square rather than being rotated rectangles.
 *
 * Measured sizes: the box is 1.15vw and each dot 0.17vw at the small scale used by the wordmark and
 * buttons. Sizing in `vw` keeps the ornament proportional to the type beside it, which is also
 * `vw` — a rem-sized ornament drifts as the viewport changes.
 *
 * `aria-hidden`: pure ornament, and the adjacent label already says everything it could.
 */

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

/*
 * Each dimension is floored with `max()`. The measured values are pure `vw`, which is correct on a
 * desktop viewport and falls apart below it: 1.15vw is 4.5px at 390px wide, so the ring collapsed
 * into a single speck next to the wordmark. The floors keep the ornament proportional wherever `vw`
 * is large enough to be legible and stop it vanishing where it is not.
 *
 * `max()` rather than a `max-sm:` variant because this is one continuous constraint, not a
 * breakpoint change — there is no width at which the ornament should jump size.
 */
const SIZES = {
  sm: { box: 'max(1.15vw, 11px)', dot: 'max(0.17vw, 1.6px)', radius: 'max(0.42vw, 4px)' },
  lg: { box: 'max(13.8vw, 90px)', dot: 'max(1.8vw, 12px)', radius: 'max(5.2vw, 34px)' },
} as const

type Props = {
  size?: keyof typeof SIZES
  className?: string
  /** Rotate on hover of an ancestor marked `group`. Off by default — the reference's ornaments are
   *  static at rest; this is only an affordance for interactive parents. */
  spinOnGroupHover?: boolean
}

export function DotOrnament({ size = 'sm', className, spinOnGroupHover = false }: Props) {
  const { box, dot, radius } = SIZES[size]

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block shrink-0',
        spinOnGroupHover &&
          'transition-transform duration-500 ease-in-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0',
        className
      )}
      style={{ width: box, height: box }}
    >
      {ANGLES.map((deg) => (
        <span
          key={deg}
          className="absolute left-1/2 top-1/2 block bg-current"
          style={{
            width: dot,
            height: dot,
            transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${radius})`,
          }}
        />
      ))}
    </span>
  )
}
