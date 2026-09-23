/**
 * Brand design tokens, sampled from the supplied logo artwork rather than invented.
 *
 * The logo is three colours and nothing else: a deep navy ground, warm cream letterforms, and one
 * vivid orange wedge. Those are the palette:
 *
 *   #0A1A2F  navy    the ground            ->  `secondary`, the dark chapters and the page's ink
 *   #F7F4EE  cream   the letterforms       ->  `primary`, the light chapters and the page's paper
 *   #FF4907  orange  the wedge             ->  `accent`, every clickable
 *
 * The names stay counter-intuitive on purpose: `primary` is the LIGHT surface and `secondary` the
 * DARK one. They read as "primary surface" / "secondary surface" rather than as ink colours, and
 * every component on the site is already written against them — `bg-secondary text-primary` and so
 * on — so the whole theme is these values, not fifty files.
 *
 * ── Why there are two oranges, which is arithmetic and not indecision ───────────────────────────
 *
 * A single orange cannot be body text on both grounds. To clear 4.5:1 on cream it needs a relative
 * luminance at or below 0.163; to clear 4.5:1 on navy it needs 0.220 or above. There is no value
 * that satisfies both, so the roles are split:
 *
 *   `accent`     #FF4907  fills, and text ON NAVY.  5.17:1 against navy, 3.38:1 against cream.
 *   `accentInk`  #CC3A06  text ON CREAM only.       4.58:1 against cream.
 *
 * ── The rule that has already been broken once in this project ──────────────────────────────────
 *
 * **An orange fill takes a NAVY label, never a white or cream one.** navy-on-orange is 5.17:1;
 * white-on-orange is 3.38:1 and cream-on-orange is 3.08:1. Both fail AA for body text, and the
 * white-on-orange pairing had previously shipped on every button on the site before it was measured.
 * If a button ever looks like it wants light text, the answer is a darker fill, not a lighter label.
 *
 * Every neutral below is navy mixed into cream rather than a grey off the shelf, so the ramp belongs
 * to the palette instead of sitting beside it.
 */
export const COLORS = {
  /** Cream. The logo's letterforms; this site's paper. */
  primary: '#F7F4EE',
  /** Navy. The logo's ground; this site's ink and its dark chapters. 15.92:1 against cream. */
  secondary: '#0A1A2F',
  /**
   * Orange. Every clickable: button fills, link affordances, and link text on a navy ground.
   * 5.17:1 against navy and against a navy label. NOT usable as text on cream — see `accentInk`.
   */
  accent: '#FF4907',
  /**
   * The same orange darkened 20% toward black, for orange TEXT on a light ground: 4.58:1 on cream
   * where the full-strength accent manages only 3.08:1. Use it for nothing else — on navy it drops
   * to 3.47:1, which is the wrong direction.
   */
  accentInk: '#CC3A06',
  /**
   * Secondary text on cream, at 65% navy. 5.30:1 — chosen over the 60% mix that measures 4.50:1
   * exactly, because a token sitting precisely on the threshold fails the moment anything is
   * layered over it.
   */
  muted: '#5D6672',
  /** Subtle rules on cream, at 12% navy. Non-text only. */
  hairline: '#DBDAD7',
  /**
   * Paper stock for the brochure gate and the enquiry panels, and the fill behind plan imagery
   * while it loads.
   *
   * It has to separate from `primary` now that the page itself is cream rather than white, so this
   * is a deeper cream rather than the lighter grey it used to be — a sheet laid ON the page. The
   * previous note here argued the separation had to be bought in value only because the palette had
   * no hue; it has one now, and a warm sheet on warm paper is the more honest version of the same
   * idea.
   */
  offwhite: '#EDEAE2',
  /** Section borders on cream, at 25% navy. Non-text only. */
  edge: '#BCBEBE',

  /*
   * ── The navy family ─────────────────────────────────────────────────────────────────────────────
   *
   * The layout this palette now dresses was designed around a purple ink with a family of lavenders
   * beside it: a lighter purple for its second display voice, a mid tone for rules and frame borders,
   * a pale one for ghosted headings, and a near-white tint for panels. Those roles are real and the
   * layout reads flat without them, so each gets a NAVY counterpart here — same hue as the logo's
   * ground, stepped in value.
   *
   * One of that system's lavenders is deliberately not carried over: it set small captions at about
   * 2.2:1 on its white ground, which fails AA for body text outright. Small secondary text here uses
   * `muted` (5.30:1) instead, and every token below is labelled with the job its contrast allows.
   */
  /** The second display voice — large type only (headlines, stat labels at ≥24px). 6.44:1 on cream. */
  navySoft: '#3E5A7E',
  /** Rules, frame borders, form underlines, outline chips. Non-text; 3.59:1 clears the 3:1 for UI. */
  navyLine: '#6F829A',
  /** Ghosted display type and decorative numerals. Purely decorative, 1.30:1 — never real content. */
  ghost: '#D8D8D5',
  /** Panel ground laid on the cream page: the mobile menu, the featured-post panel. */
  tint: '#EBE9E4',
  /** Gradient stops only — the light orange and the mid navy either side of the gradient's cream. */
  accentSoft: '#FF9A5C',
  navyMid: '#34507A',
} as const

/**
 * The brand gradient: orange → light orange → cream → mid navy → navy. It is the layout's signature
 * device — the thread that runs down the hero seam, the bar that draws under a card on hover, the
 * ring around every outline button, the timeline's growing bar. Stops mirror the proportions the
 * layout was built with (29% / 50% / 75%), so the cream sits dead centre and the two brand colours
 * own the ends.
 */
export const BRAND_GRADIENT_STOPS = `${COLORS.accent}, ${COLORS.accentSoft} 29%, ${COLORS.primary} 50%, ${COLORS.navyMid} 75%, ${COLORS.secondary}`
/** The ring variant runs without the cream, which would vanish against a cream button face. */
export const BRAND_RING_STOPS = `${COLORS.accent}, ${COLORS.accentSoft} 48%, ${COLORS.navyMid} 76%, ${COLORS.secondary}`

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
