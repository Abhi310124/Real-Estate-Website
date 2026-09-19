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
   * Paper stock for the brochure gate and the enquiry panels, and the neutral fill sitting behind
   * plan and master-plan imagery while it loads.
   *
   * This one has no reference counterpart: every light band on the reference is flat #FFFFFF, so a
   * tinted surface is ours, and it is only legitimate on the lead-capture blocks the reference does
   * not have. Those blocks ask a visitor for something, and a sheet that reads as laid ON the page
   * rather than cut OUT of it is what separates a form from the editorial around it. Any section
   * that does exist on the reference stays `primary` white — the strict white/black alternation is
   * load-bearing, and one 13-step-darker band in the sequence is immediately legible as a mistake.
   *
   * #F2F2F2 rather than a near-white: at #FEFEFE the surface is indistinguishable from the page and
   * buys nothing. Warm cream would be closer to real stock, but unequal RGB channels are hue and
   * this palette has none by design (see the tokens test), so the separation is bought in value
   * only.
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
