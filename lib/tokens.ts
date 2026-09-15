export const COLORS = {
  'navy-900': '#071628',
  'navy-800': '#0A1A2F',
  'navy-700': '#16233A',
  'navy-600': '#1D2733',
  ivory: '#F7F4EE',
  'ivory-warm': '#FBF9F5',
  orange: '#FF4907',
  'orange-600': '#E63F05',
  champagne: '#C9A227',
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
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}
