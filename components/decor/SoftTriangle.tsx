import { useId } from 'react'
import { COLORS } from '@/lib/tokens'

/**
 * The layout's soft triangle: a large, round-cornered triangle washed from the warm end of the
 * palette to the cool end, at very low strength, sitting behind a section. The reference's is pink
 * into lavender; this one is the brand orange into the navy, each mixed nearly all the way to cream,
 * so it reads as light falling across the page rather than as a shape competing with the copy.
 *
 * The rounding is a stroke, not geometry: the polygon is stroked in its own fill at a wide width with
 * `stroke-linejoin: round`, which rounds all three corners by exactly half the stroke width and keeps
 * the path trivially simple. The strength is applied once, on the group, rather than on the gradient
 * stops — with translucent stops the band where stroke overlaps fill would composite twice and draw a
 * visible rim just inside the edge.
 */
export function SoftTriangle({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 600 560" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-wash`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={COLORS.accentSoft} />
          <stop offset="55%" stopColor={COLORS.primary} />
          <stop offset="100%" stopColor={COLORS.navyLine} />
        </linearGradient>
      </defs>
      <g opacity="0.24">
        <polygon
          points="300,70 540,490 60,490"
          fill={`url(#${id}-wash)`}
          stroke={`url(#${id}-wash)`}
          strokeWidth="110"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
