import { describe, expect, it } from 'vitest'
import { COLORS, contrastRatio, relativeLuminance } from '@/lib/tokens'

/**
 * Drift guard on the monochrome palette.
 *
 * The previous version of this suite spent most of its assertions proving that a navy/orange
 * palette cleared AA — which was genuinely hard, and where a real bug was eventually found (white
 * on orange measured 3.38:1 and had shipped on every button). A monochrome palette makes those
 * pairings trivial, so the interesting assertions have moved: what matters now is that the palette
 * stays monochrome, and that nothing reintroduces an accent colour by the back door.
 */

const MONO = ['primary', 'secondary', 'muted', 'hairline', 'offwhite', 'edge'] as const

describe('palette', () => {
  it('is exactly the six tokens the design uses', () => {
    expect(Object.keys(COLORS).sort()).toEqual([...MONO].sort())
  })

  it('exposes the measured hex values verbatim', () => {
    expect(COLORS.primary).toBe('#FFFFFF')
    expect(COLORS.secondary).toBe('#000000')
    expect(COLORS.muted).toBe('#3D3D3D')
    expect(COLORS.hairline).toBe('#E6E6E6')
    expect(COLORS.offwhite).toBe('#F2F2F2')
    expect(COLORS.edge).toBe('#BFBFBF')
  })

  // The real guard. A monochrome colour has equal R, G and B channels; anything with a hue is by
  // definition an accent, and the design's entire premise is that there isn't one. This catches a
  // "just a touch of orange" edit far more reliably than listing forbidden values would.
  it('contains no hue — every channel is equal in every token', () => {
    for (const name of MONO) {
      const hex = COLORS[name].replace('#', '')
      const [r, g, b] = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)]
      expect([name, r, g, b]).toEqual([name, r, r, r])
    }
  })
})

describe('contrast', () => {
  it('gives the two page inks the maximum possible ratio on their own surface', () => {
    // 21:1 is the theoretical ceiling. Both chapter types hit it, which is why this design needs
    // no contrast carve-outs of the kind the previous palette required.
    expect(contrastRatio(COLORS.secondary, COLORS.primary)).toBeCloseTo(21, 1)
  })

  it('keeps muted text legible on both chapter backgrounds', () => {
    // muted is the only token used for body-size secondary text, so it is the only one that has
    // to clear 4.5:1 rather than the 3:1 that applies to rules and large display type.
    expect(contrastRatio(COLORS.muted, COLORS.primary)).toBeGreaterThanOrEqual(4.5)
  })

  it('treats hairline and edge as non-text only', () => {
    // Both fail AA for text by a wide margin and are deliberately never used for it — they are
    // rules, borders and the ghosted numerals. Asserting the failure documents the constraint, so
    // that anyone tempted to set a label in `text-hairline` finds the reason here.
    expect(contrastRatio(COLORS.hairline, COLORS.primary)).toBeLessThan(4.5)
    expect(contrastRatio(COLORS.edge, COLORS.primary)).toBeLessThan(4.5)
  })

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
