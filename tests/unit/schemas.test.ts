import { describe, expect, it } from 'vitest'
import { schemaTypes } from '@/sanity/schemas'

const byName = (n: string) => schemaTypes.find((s: { name: string }) => s.name === n)
const fields = (n: string) =>
  (byName(n) as { fields: Array<{ name: string }> }).fields.map((f) => f.name)

describe('project schema', () => {
  it('exists', () => expect(byName('project')).toBeTruthy())

  it('declares every field the site reads', () => {
    const f = fields('project')
    for (const name of [
      'title', 'slug', 'category', 'status', 'isPublished', 'featured', 'order',
      'tagline', 'location', 'priceFrom', 'priceUnit', 'priceOnRequest', 'unitTypes',
      'keyStats', 'overview', 'heroImage', 'gallery', 'amenities', 'floorPlans',
      'masterPlan', 'specifications', 'constructionUpdates', 'connectivity',
      'brochure', 'reraNumber', 'seo',
    ]) {
      expect(f, `missing field: ${name}`).toContain(name)
    }
  })

  it('defaults isPublished to false so nothing goes live by accident', () => {
    const f = (byName('project') as { fields: Array<{ name: string; initialValue?: unknown }> }).fields
    expect(f.find((x) => x.name === 'isPublished')?.initialValue).toBe(false)
  })

  it('offers exactly the five brand categories', () => {
    const f = (byName('project') as { fields: Array<{ name: string; options?: { list?: Array<{ value: string }> } }> }).fields
    const list = f.find((x) => x.name === 'category')?.options?.list ?? []
    expect(list.map((o) => o.value).sort()).toEqual(
      ['apartments', 'developers', 'independent-houses', 'open-plots', 'villas'],
    )
  })
})

describe('other documents', () => {
  it('defines amenity, siteSettings and lead', () => {
    for (const n of ['amenity', 'siteSettings', 'lead']) expect(byName(n)).toBeTruthy()
  })
})
