/**
 * Monochrome design tokens, measured off the reference design.
 *
 * The names are deliberately counter-intuitive and match the reference: `primary` is WHITE and
 * `secondary` is BLACK. They read as "primary surface" / "secondary surface" rather than as ink
 * colours. Keeping the reference's own naming means a class like `bg-secondary text-primary`
 * transfers between the two codebases without a mental flip every time.
 *
 * There is no accent colour. That is the point of the palette, not an omission — the layout is
 * carried by photography, whitespace and type, so any accent would be the loudest thing on a
 * page and would fight the imagery.
 */
export const COLORS = {
  primary: '#FFFFFF',
  secondary: '#000000',
  muted: '#3D3D3D',
  hairline: '#E6E6E6',
  /**
   * Paper stock for the intake form. #F2F2F2, not the #FEFEFE originally measured off the
   * reference's DOM: at #FEFEFE the surface was indistinguishable from the page's own white, so
   * the form read as a section rather than as a sheet laid on it. The reference's paper is
   * visibly warmer than its page, but a warm cream has unequal RGB channels — which is hue, and
   * this palette has none by design (see the tokens test). A neutral light grey buys the same
   * separation without opening the door to an accent.
   */
  offwhite: '#F2F2F2',
  edge: '#BFBFBF',
} as const

/** Translucent overlays, kept as literals because Tailwind's `/opacity` syntax cannot express
 *  the exact rgba() values the reference uses over photography. */
export const OVERLAYS = {
  scrim: 'rgba(61, 61, 61, 0.5)',
  veil: 'rgba(255, 255, 255, 0.3)',
} as const

function channel(v: number): number {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA)
  const b = relativeLuminance(hexB)
  const [light, dark] = a >= b ? [a, b] : [b, a]
  return (light + 0.05) / (dark + 0.05)
}
