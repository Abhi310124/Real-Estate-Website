import { describe, expect, it } from 'vitest'
import { COLORS, contrastRatio } from '@/lib/tokens'

describe('brand tokens', () => {
  it('exposes the exact hexes from the spec', () => {
    expect(COLORS['navy-900']).toBe('#071628')
    expect(COLORS['navy-800']).toBe('#0A1A2F')
    expect(COLORS['ivory']).toBe('#F7F4EE')
    expect(COLORS['orange']).toBe('#FF4907')
    expect(COLORS['champagne']).toBe('#C9A227')
  })
})

describe('contrast rules from the spec', () => {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.15

  it('navy-800 on ivory is safe for body text', () => {
    expect(near(contrastRatio(COLORS['navy-800'], COLORS['ivory']), 15.9)).toBe(true)
  })

  it('white on navy-800 is safe for body text', () => {
    expect(near(contrastRatio('#FFFFFF', COLORS['navy-800']), 17.5)).toBe(true)
  })

  it('orange on navy-800 passes AA for body text', () => {
    expect(contrastRatio(COLORS['orange'], COLORS['navy-800'])).toBeGreaterThanOrEqual(4.5)
  })

  it('orange on ivory FAILS AA — large text and UI only', () => {
    const r = contrastRatio(COLORS['orange'], COLORS['ivory'])
    expect(r).toBeLessThan(4.5)
    expect(r).toBeGreaterThanOrEqual(3)
  })

  it('champagne on ivory is decorative only — fails even large text', () => {
    expect(contrastRatio(COLORS['champagne'], COLORS['ivory'])).toBeLessThan(3)
  })

  it('champagne on navy-800 is safe for text', () => {
    expect(contrastRatio(COLORS['champagne'], COLORS['navy-800'])).toBeGreaterThanOrEqual(4.5)
  })
})
