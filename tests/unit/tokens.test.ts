import { describe, expect, it } from 'vitest'
import { COLORS, contrastRatio, relativeLuminance } from '@/lib/tokens'

/**
 * Drift guard on the brand palette.
 *
 * This suite has now been written three times, and the history is the reason it is shaped the way it
 * is. The first version tried to prove a navy/orange palette cleared AA and missed the one pairing
 * that mattered: white on orange measured 3.38:1 and had shipped on every button on the site. The
 * second version, for the monochrome rebuild, asserted the opposite thing — that no token had any
 * hue at all — which made contrast trivial and the assertions uninteresting.
 *
 * The palette is derived from the logo again, so the dangerous pairing is back. These assertions are
 * therefore aimed squarely at it: hue is allowed, but only the logo's hues, and every pairing a
 * clickable can actually produce has to clear its real threshold.
 */

const TOKENS = [
  'primary',
  'secondary',
  'accent',
  'accentInk',
  'muted',
  'hairline',
  'offwhite',
  'edge',
  'navySoft',
  'navyLine',
  'ghost',
  'tint',
  'accentSoft',
  'navyMid',
] as const

/** The orange family: the logo's wedge, its text-on-cream darkening and the gradient's light stop. */
const ORANGES = ['accent', 'accentInk', 'accentSoft'] as const

/** WCAG 2.1: 4.5:1 for body text, 3:1 for large text and for non-text UI indicators. */
const AA_TEXT = 4.5
const AA_NON_TEXT = 3

describe('palette', () => {
  it('is exactly the fourteen tokens the design uses', () => {
    expect(Object.keys(COLORS).sort()).toEqual([...TOKENS].sort())
  })

  it('exposes the logo-derived hex values verbatim', () => {
    // The three sampled from the logo artwork. If the logo is ever redrawn, these are the
    // values that have to move with it — and everything below re-checks the consequences.
    expect(COLORS.secondary).toBe('#0A1A2F')
    expect(COLORS.primary).toBe('#F7F4EE')
    expect(COLORS.accent).toBe('#FF4907')
    // Derived.
    expect(COLORS.accentInk).toBe('#CC3A06')
    expect(COLORS.muted).toBe('#5D6672')
    expect(COLORS.hairline).toBe('#DBDAD7')
    expect(COLORS.offwhite).toBe('#EDEAE2')
    expect(COLORS.edge).toBe('#BCBEBE')
    // The navy family the layout's lavender roles map onto, and the gradient's two inner stops.
    expect(COLORS.navySoft).toBe('#3E5A7E')
    expect(COLORS.navyLine).toBe('#6F829A')
    expect(COLORS.ghost).toBe('#D8D8D5')
    expect(COLORS.tint).toBe('#EBE9E4')
    expect(COLORS.accentSoft).toBe('#FF9A5C')
    expect(COLORS.navyMid).toBe('#34507A')
  })

  it('confines hue to the logo’s two: the oranges, and navy at any strength', () => {
    // The palette is allowed colour, but not arbitrary colour. Every token outside the orange family
    // is either a near-neutral (the creams and the ghost grey) or sits on the logo navy's own hue —
    // the navy family is navy stepped in value, never a blue of its own. A token that drifts into a
    // third hue fails here.
    const rgb = (hex: string) => (hex.replace('#', '').match(/\w\w/g) ?? []).map((h) => parseInt(h, 16))
    const spread = (hex: string) => {
      const [r, g, b] = rgb(hex)
      return Math.max(r, g, b) - Math.min(r, g, b)
    }
    const hue = (hex: string) => {
      const [r, g, b] = rgb(hex)
      const max = Math.max(r, g, b)
      const d = max - Math.min(r, g, b)
      if (d === 0) return 0
      const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
      return (h * 60 + 360) % 360
    }
    const navyHue = hue(COLORS.secondary)

    for (const name of TOKENS) {
      if ((ORANGES as readonly string[]).includes(name)) {
        expect([name, Math.abs(hue(COLORS[name]) - hue(COLORS.accent)) < 8]).toEqual([name, true])
        continue
      }
      const neutral = spread(COLORS[name]) <= 12
      const navyFamily = Math.abs(hue(COLORS[name]) - navyHue) < 8
      expect([name, neutral || navyFamily]).toEqual([name, true])
    }
  })
})

describe('the two page inks', () => {
  it('read on each other far above the floor', () => {
    expect(contrastRatio(COLORS.secondary, COLORS.primary)).toBeGreaterThanOrEqual(15)
  })
})

describe('clickables', () => {
  // This block is the reason the file exists.

  it('puts a NAVY label on an orange fill, which is the only pairing that passes', () => {
    expect(contrastRatio(COLORS.secondary, COLORS.accent)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('proves the two tempting light labels on orange do NOT pass', () => {
    // Asserting the failure is the point. A future edit that "brightens the button text" has to
    // delete one of these lines to go green, which is a much louder act than changing a class.
    expect(contrastRatio('#FFFFFF', COLORS.accent)).toBeLessThan(AA_TEXT)
    expect(contrastRatio(COLORS.primary, COLORS.accent)).toBeLessThan(AA_TEXT)
  })

  it('lets the full-strength accent be text on navy but not on cream', () => {
    expect(contrastRatio(COLORS.accent, COLORS.secondary)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrastRatio(COLORS.accent, COLORS.primary)).toBeLessThan(AA_TEXT)
  })

  it('uses the darkened accent for orange text on cream, and only there', () => {
    expect(contrastRatio(COLORS.accentInk, COLORS.primary)).toBeGreaterThanOrEqual(AA_TEXT)
    // And it is the wrong token on navy — which is why there are two rather than one.
    expect(contrastRatio(COLORS.accentInk, COLORS.secondary)).toBeLessThan(AA_TEXT)
  })

  it('still clears the non-text floor where the accent is a rule rather than a word', () => {
    // The link underline and the logo's wedge are graphics, so 3:1 applies, on both grounds.
    expect(contrastRatio(COLORS.accent, COLORS.primary)).toBeGreaterThanOrEqual(AA_NON_TEXT)
    expect(contrastRatio(COLORS.accent, COLORS.secondary)).toBeGreaterThanOrEqual(AA_NON_TEXT)
  })

  it('cannot be satisfied by one orange, which is why the split is arithmetic not taste', () => {
    // To be body text on cream an orange needs luminance <= 0.163; on navy it needs >= 0.220. The
    // ranges do not overlap, so no single value can do both jobs and the pair is forced.
    const maxForCream = (1.05 - 0.05 * AA_TEXT) / AA_TEXT
    const minForNavy = AA_TEXT * (relativeLuminance(COLORS.secondary) + 0.05) - 0.05
    expect(maxForCream).toBeLessThan(minForNavy)
  })
})

describe('body and secondary text', () => {
  it('keeps muted legible on the cream chapters', () => {
    expect(contrastRatio(COLORS.muted, COLORS.primary)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('leaves muted a real margin rather than sitting on the threshold', () => {
    // The 60%-navy mix measures 4.50:1 exactly. A token pinned to the boundary fails the moment
    // anything is layered over it, so the shipped value is the 65% mix.
    expect(contrastRatio(COLORS.muted, COLORS.primary)).toBeGreaterThan(5)
  })
})

describe('the navy family', () => {
  it('lets navySoft carry text on cream, as the second display voice', () => {
    expect(contrastRatio(COLORS.navySoft, COLORS.primary)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('keeps navyLine to rules and outlines: above the UI floor, below the text floor', () => {
    expect(contrastRatio(COLORS.navyLine, COLORS.primary)).toBeGreaterThanOrEqual(AA_NON_TEXT)
    expect(contrastRatio(COLORS.navyLine, COLORS.primary)).toBeLessThan(AA_TEXT)
  })

  it('keeps ghost decorative — it may never carry content', () => {
    expect(contrastRatio(COLORS.ghost, COLORS.primary)).toBeLessThan(AA_NON_TEXT)
  })
})

describe('the tinted panel', () => {
  it('separates from the page it sits on', () => {
    expect(contrastRatio(COLORS.tint, COLORS.primary)).toBeGreaterThan(1.05)
  })

  it('keeps muted and navy text legible on it', () => {
    expect(contrastRatio(COLORS.muted, COLORS.tint)).toBeGreaterThanOrEqual(AA_TEXT)
    expect(contrastRatio(COLORS.navySoft, COLORS.tint)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it('allows orange text on it only at large sizes', () => {
    // accentInk manages 4.16:1 on the tint — enough for 24px type (3:1), not for body text. The mobile
    // menu sets its links at 24px for exactly this reason.
    expect(contrastRatio(COLORS.accentInk, COLORS.tint)).toBeGreaterThanOrEqual(AA_NON_TEXT)
    expect(contrastRatio(COLORS.accentInk, COLORS.tint)).toBeLessThan(AA_TEXT)
  })
})

describe('non-text tokens', () => {
  it('treats hairline, edge and offwhite as surfaces and rules only', () => {
    // All three fail AA for text by a wide margin and are deliberately never used for it. Asserting
    // the failure documents the constraint where someone tempted to set a label in `text-hairline`
    // will actually find it.
    expect(contrastRatio(COLORS.hairline, COLORS.primary)).toBeLessThan(AA_TEXT)
    expect(contrastRatio(COLORS.edge, COLORS.primary)).toBeLessThan(AA_TEXT)
    expect(contrastRatio(COLORS.offwhite, COLORS.primary)).toBeLessThan(AA_TEXT)
  })

  it('still separates the paper panel from the page it sits on', () => {
    // Its whole job is to read as a sheet laid on the page. At 1.00 it would be invisible; the
    // previous monochrome value was chosen for exactly this reason and then had to be revisited.
    expect(contrastRatio(COLORS.offwhite, COLORS.primary)).toBeGreaterThan(1.05)
  })
})

describe('contrastRatio', () => {
  it('is symmetric regardless of argument order', () => {
    expect(contrastRatio(COLORS.primary, COLORS.muted)).toBeCloseTo(
      contrastRatio(COLORS.muted, COLORS.primary),
      10
    )
  })
})

describe('relativeLuminance', () => {
  it('anchors at the two extremes', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 6)
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 6)
  })
})
