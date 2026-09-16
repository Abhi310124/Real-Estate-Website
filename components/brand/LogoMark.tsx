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

// Traced from docs/brand-refs/logo-wide.jpeg (pixel-measured triangle + K-leg geometry,
// hand-fit B/R geometry against the same reference — see Task 6 report for the full
// derivation). BKR reads as one interlocking monogram, not three independent letters:
// K's lower leg terminates where R's stem begins (x=122 at the shared baseline), so the two
// letters visually share that stroke rather than sitting side by side.
export function LogoMark({ animated = false, color = COLORS['navy-800'], className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 240 96"
      className={className}
      aria-hidden="true"
      data-animated={animated ? 'true' : undefined}
    >
      {/* B — squared outer edges, rounded bowl right sides, chamfer at the waist, upper
          bowl smaller than the lower. Counters are true holes (fillRule evenodd), not a
          second overlay shape. */}
      <path
        data-mark-path
        fillRule="evenodd"
        fill={color}
        d="M8,8 L44,8 C54,8 59,14 59,22 C59,28 55,32 48,34 L41,38 C56,40 62,45 62,52
           C62,60 55,68 44,68 L8,68 Z
           M19,16 L38,16 C43,16 43,20 43,23 C43,26 41,29 36,29 L19,29 Z
           M19,41 L40,41 C47,41 47,46 47,49 C47,54 43,60 36,60 L19,60 Z"
      />

      {/* K's upper arm — a solid orange right triangle filling the upper counter, right
          angle at the top-left, hypotenuse running from the stem point up to the top-right
          tip ("pointing up-right"). Pixel-measured proportions from the reference, tightened
          after the Ruling-3 visual comparison (see Task 6 report) so the monogram reads as
          compact rather than stretched. Always orange, in both variants. */}
      <path data-mark-path fill={COLORS.orange} d="M66,8 L96,8 L66,32 Z" />

      {/* K's lower leg — one bold straight diagonal descending right from the shared stem
          point, per Ruling 2. Steepened after the visual comparison: the first pass ran a
          long, shallow diagonal that made the whole mark look sprawling next to the
          reference's tight, near-square monogram. Not a second crossing stroke: the
          reference's apparent second diagonal turned out, on closer measurement, to belong
          to R reaching back into K's counter (see below) — that overlap is the
          "interlocking" the brief calls for. */}
      <path data-mark-path fill={color} d="M64,24 L82,24 L112,68 L94,68 Z" />

      {/* R — straight-legged: a vertical stem (left edge at x=100, tucked against K's leg so
          the two letters read as sharing it at the baseline), a rounded-right bowl matching
          B's bowl language, and a straight diagonal leg with no curved foot. The leg's kick
          past the shared baseline was cut back after the visual comparison — the reference's
          R sits close to level with B and K, it does not drop into a long descender. */}
      <path
        data-mark-path
        fillRule="evenodd"
        fill={color}
        d="M100,8 L124,8 C136,8 141,13 141,21 C141,29 136,34 124,34 L114,34 L114,68 L100,68 Z
           M114,15 L124,15 C130,15 132,17 132,21 C132,25 130,27 124,27 L114,27 Z"
      />
      <path data-mark-path fill={color} d="M114,34 L124,34 L146,74 L136,74 Z" />
    </svg>
  )
}
