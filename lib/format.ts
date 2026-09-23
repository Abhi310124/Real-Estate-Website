import type { ProjectCategory, ProjectStatus } from './data/types'

// Indian number/currency formatting, per master prompt §6. Prices use the Lakh/Cr shorthand
// real-estate buyers expect (no thousands grouping); areas and counters use `en-IN` grouping.
export function formatPrice(from: number | null, unit: 'Lakh' | 'Cr', onRequest: boolean): string {
  if (onRequest || from === null) return 'Price on request'
  return `₹${from} ${unit} onwards`
}

export function formatArea(v: number, unit: string): string {
  return `${v.toLocaleString('en-IN')} ${unit}`
}

// Display labels for the two project enums. The category labels mirror `SiteSettings.categories`
// (the filter bar reads those), so a card and the filter that selects it always use the same word.
export const STATUS_LABELS = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  completed: 'Completed',
  'sold-out': 'Sold Out',
} as const satisfies Record<ProjectStatus, string>

export const CATEGORY_LABELS = {
  'open-plots': 'Open Plots',
  villas: 'Villas',
  apartments: 'Apartments',
  'independent-houses': 'Independent Houses',
  developers: 'Developers',
} as const satisfies Record<ProjectCategory, string>

/**
 * "+91 6301999971" → "+91 6301 999 971": the grouping the site shows a phone number in, for the eye
 * only. Anything that is not a ten-digit number (after an optional country code) is returned as given.
 */
export function groupPhone(raw: string, withCountryCode = true): string {
  const digits = raw.replace(/\D/g, '')
  const local = digits.slice(-10)
  if (local.length !== 10) return raw
  const cc = withCountryCode && digits.length > 10 ? `+${digits.slice(0, -10)} ` : ''
  return `${cc}${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`
}

/** The dialable form of a displayed number: digits and a leading `+` only. */
export function telHref(raw: string): string {
  return `tel:${raw.replace(/[^\d+]/g, '')}`
}
