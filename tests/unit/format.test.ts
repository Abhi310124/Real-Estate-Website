import { describe, expect, it } from 'vitest'
import { formatPrice, formatArea } from '@/lib/format'
import { whatsappLink } from '@/lib/whatsapp'

describe('formatPrice', () => {
  it('renders a starting price', () => {
    expect(formatPrice(85, 'Lakh', false)).toBe('₹85 Lakh onwards')
  })
  it('renders crore', () => {
    expect(formatPrice(1.4, 'Cr', false)).toBe('₹1.4 Cr onwards')
  })
  it('honours price-on-request over any number', () => {
    expect(formatPrice(85, 'Lakh', true)).toBe('Price on request')
  })
  it('falls back to on-request when the price is missing', () => {
    expect(formatPrice(null, 'Lakh', false)).toBe('Price on request')
  })
})

describe('formatArea', () => {
  it('groups thousands', () => {
    expect(formatArea(1450, 'sq.ft')).toBe('1,450 sq.ft')
  })
})

describe('whatsappLink', () => {
  it('builds a wa.me link with an encoded message', () => {
    expect(whatsappLink('+91 63019 99971', 'Hi BKR, I am interested')).toBe(
      'https://wa.me/916301999971?text=Hi%20BKR%2C%20I%20am%20interested',
    )
  })
})
