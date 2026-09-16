import { COLORS } from '@/lib/tokens'

type LogoMarkProps = {
  /**
   * Flags the mark as a candidate for Task 9's intro animation. LogoMark itself holds no
   * animation logic — it only exposes `[data-mark-path]` elements (real `<path>`s with real
   * geometry, so `getTotalLength()` is meaningful) for a future controller to drive via
   * `stroke-dashoffset`. That controller is Task 9's job and Task 9 also owns the
   * `useReducedMotion()` gating for whatever timeline it builds; wiring reduced-motion logic
   * in here for an animation that does not yet exist would be dead code with nothing to gate.
   */
  animated?: boolean
  /** Ink colour for every stroke except the orange triangle, which is fixed brand orange in
   *  both variants (Task 6 spec + Ruling 4: colour comes from props, never a hand-typed hex,
   *  except the triangle). Defaults to navy so the mark is usable stand-alone on a light
   *  background without a wrapping `Logo`. */
  color?: string
  className?: string
}

/*
 * Geometry derived by pixel-measuring docs/brand-refs/logo-wide.jpeg and cross-checking every
 * ratio against docs/brand-refs/logo-square.jpeg, which renders the same monogram at 36% of
 * the size. The coordinate system below is the reference's own, normalised so that cap height
 * is exactly 100 units: every number here is a measured reference distance multiplied by
 * 100/199 (the wide reference's cap height in px). The viewBox is tight to the artwork, so
 * setting the SVG's height sets cap height directly.
 *
 *   measured ratio (cap = 1.00)        wide.jpeg      square.jpeg     built to
 *   monogram width                     4.181          3.944           4.170
 *   B / K / R cell width               1.296 1.276 1.251              1.280 1.276 1.240
 *   inter-glyph gap                    0.191 / 0.166  0.167 / 0.125   0.210 / 0.170
 *   stroke weight                      0.221-0.231    0.222           0.220-0.240
 *   orange triangle w (of K cell)      0.382          0.389           0.381
 *   orange triangle h (of cap)         0.432          0.417           0.430
 *   white channel triangle->K arm      0.343          0.333           0.348
 *
 * Two things the measurement settled that are easy to get wrong by eye, and that the first
 * attempt at this mark got wrong:
 *
 * 1. BKR is three separate glyphs with real letter-spacing, NOT an interlocking monogram.
 *    Columns 640..677 and 932..964 of the wide reference contain zero ink over the whole cap
 *    height — the glyphs never touch, in either reference. Nothing shares a stem.
 *
 * 2. Both the B and the R have an OPEN upper-left counter: the upper counter is a slot cut
 *    clean through to the left edge, so the top bar and the middle bar are joined only by the
 *    bowl's right side, and the left stem exists solely in the lower half. That single device,
 *    used identically on both letters, is what gives the reference mark its character. Drawing
 *    conventional closed-counter letters instead is what made the previous version read as a
 *    generic fat B. The lower counter, by contrast, IS closed by a left stem.
 *
 * Vertical rhythm, shared by B and R. Every edge below was pinned to the row it actually
 * changes on in the wide reference, then converted: top-bar bottom edge is ref y=255 → 21.1,
 * upper-counter bottom is ref y=291 → 39.2, lower-counter top is ref y=333 → 60.3, its bottom
 * is ref y=369 → 78.4. That yields a strikingly regular rhythm — bars 21.1 / 21.1 / 21.6,
 * counters 18.1 / 18.1 — which is why the integers below are what they are:
 *   0..21 top bar · 21..39 open upper counter · 39..60 middle bar · 60..78 lower counter
 *   (B only; the R's stem runs unbroken from 39 to the baseline) · 78..100 bottom bar
 */
const CAP = 100
const MONOGRAM_WIDTH = 418

export function LogoMark({ animated = false, color = COLORS['navy-800'], className }: LogoMarkProps) {
  return (
    <svg
      viewBox={`0 0 ${MONOGRAM_WIDTH} ${CAP}`}
      className={className}
      aria-hidden="true"
      data-animated={animated ? 'true' : undefined}
    >
      {/* B — x 0..128. Outer silhouette: square left edge and square top/bottom-left corners,
          a generously rounded top-right (r=24) and bottom-right (r=26) matching the
          reference's measured corner radii, and a shallow straight chamfer pinching the waist
          in to x=119 at y=48 (the reference's waist minimum, measured at 0.60 of the bowl's
          full projection — not a full semicircle returning to the stem). The two counters are
          true holes via fillRule evenodd: the upper one reaches x=0, which is what severs the
          left stem across y 22..40 and produces the open counter described above. */}
      <path
        data-mark-path
        fillRule="evenodd"
        fill={color}
        d="M0,0 H104 C112,0 128,11 128,24 V36 Q124,42 119,48 Q126,54 129,62 V78
           C129,90 113,100 105,100 H0 Z
           M0,21 H104 V39.4 H0 Z
           M23,60 H104 V78.4 H23 Z"
      />

      {/* K's orange accent — a right triangle with the right angle at the TOP-LEFT (confirmed
          in both references by corner-density sampling: the bottom-right quadrant holds zero
          orange pixels). Its vertical left edge sits exactly on the K cell's left edge, i.e.
          the line a conventional K's stem would occupy, and its hypotenuse runs down-left from
          the cap line to a point at 0.43 of cap height, filling the K's upper-left counter.
          The reference keeps a white channel of ~0.34 of the K's width between this hypotenuse
          and the arm rather than letting the two meet, so the arm's left edge below is placed
          to preserve that channel. Always orange, in both variants. */}
      <path data-mark-path fill={COLORS.orange} d="M149,0 H197.5 L149,43 Z" />

      {/* K's arm — one continuous diagonal band (horizontal width 34, slope dx/dy = -1.21)
          running the full cap height from the cell's top-right corner down to its bottom-left,
          where it is cut off square by the cell's left edge at x=149. It does not stop at the
          vertex: in the reference this stroke carries on below the junction and becomes the
          lower half of the K's implied stem, with the orange triangle standing in for the
          upper half. */}
      <path data-mark-path fill={color} d="M242,0 H276 L155,100 H149 V77 Z" />

      {/* K's leg — the second diagonal, springing from the arm at the vertex (y=48, mid cap
          height) and descending right to land its outer corner exactly on the cell's right
          edge at the baseline. Its flat top edge lies along the arm's cross-section at y=48,
          so the two overlap rather than abut and the union reads as one welded joint. */}
      <path data-mark-path fill={color} d="M184,48 H218 L276,100 H242 Z" />

      {/* R — x 293..417. Same vertical rhythm and the same open upper counter as the B, so the
          two letters read as one alphabet: bowl squared on the left, rounded r=22 at both
          right corners, bottom of the bowl at y=59, and the stem running unbroken from the
          bowl's underside to the baseline. The counter cut reaches x=293 for the same reason
          it reaches x=0 on the B. */}
      <path
        data-mark-path
        fillRule="evenodd"
        fill={color}
        d="M293,0 H396 C404,0 418,10 418,23 V36 C418,49 404,60 396,60 H316 V100 H293 Z
           M293,21 H394 V39.4 H293 Z"
      />

      {/* R's leg — a straight diagonal of the same 23-unit stroke weight as the stem, with no
          curved foot, starting inside the bowl at y=55 so it welds rather than abuts and
          finishing flush with the monogram's right edge on the baseline. */}
      <path data-mark-path fill={color} d="M345,56 H377 L418,100 H386 Z" />
    </svg>
  )
}
