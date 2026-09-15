// Indian number/currency formatting, per master prompt §6. Prices use the Lakh/Cr shorthand
// real-estate buyers expect (no thousands grouping); areas and counters use `en-IN` grouping.
export function formatPrice(from: number | null, unit: 'Lakh' | 'Cr', onRequest: boolean): string {
  if (onRequest || from === null) return 'Price on request'
  return `₹${from} ${unit} onwards`
}

export function formatArea(v: number, unit: string): string {
  return `${v.toLocaleString('en-IN')} ${unit}`
}
