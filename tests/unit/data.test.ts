import { describe, expect, it } from 'vitest'
import {
  getProjects,
  getFeaturedProjects,
  getProject,
  getAllProjectSlugs,
  getSiteSettings,
  activeSource,
} from '@/lib/data'

describe('data layer with no Sanity env vars', () => {
  it('falls back to mock so the site builds without a Sanity account', () => {
    expect(activeSource()).toBe('mock')
  })

  it('returns only published projects', async () => {
    const all = await getProjects()
    expect(all.length).toBeGreaterThan(0)
    expect(all.every((p) => p.isPublished)).toBe(true)
  })

  it('never leaks an unpublished project through getProject', async () => {
    const hidden = await getProject('unpublished-sample')
    expect(hidden).toBeNull()
  })

  it('filters by category', async () => {
    const villas = await getProjects({ category: 'villas' })
    expect(villas.length).toBeGreaterThan(0)
    expect(villas.every((p) => p.category === 'villas')).toBe(true)
  })

  it('filters by status', async () => {
    const ongoing = await getProjects({ category: undefined, status: 'ongoing' })
    expect(ongoing.every((p) => p.status === 'ongoing')).toBe(true)
  })

  it('returns featured projects sorted by order', async () => {
    const featured = await getFeaturedProjects()
    expect(featured.length).toBeGreaterThanOrEqual(3)
    const orders = featured.map((p) => p.order)
    expect([...orders].sort((a, b) => a - b)).toEqual(orders)
  })

  it('resolves a full project by slug with the fields pages depend on', async () => {
    const slugs = await getAllProjectSlugs()
    const p = await getProject(slugs[0])
    expect(p).not.toBeNull()
    expect(p!.heroImage.alt).toBeTruthy()
    expect(p!.reraNumber).toBeTruthy()
    expect(p!.keyStats.length).toBeGreaterThan(0)
  })

  it('excludes unpublished projects from the slug list', async () => {
    expect(await getAllProjectSlugs()).not.toContain('unpublished-sample')
  })

  // Ruling: publish-gating is the project's first non-negotiable — the owner hides a
  // project by flipping one switch, and it must vanish from every surface. The four tests
  // above cover getProjects, getProject and getAllProjectSlugs; this one covers
  // getFeaturedProjects so all four query surfaces are proven, not just the first three.
  // `unpublished-sample` is deliberately `featured: true` in the mock fixtures so that a
  // missing filter here would actually leak it into this assertion instead of passing by
  // accident.
  it('excludes unpublished projects from featured projects', async () => {
    const featured = await getFeaturedProjects()
    expect(featured.every((p) => p.isPublished)).toBe(true)
    expect(featured.some((p) => p.slug === 'unpublished-sample')).toBe(false)
  })
})

describe('site settings', () => {
  // Drift guard on the one rule no task may relax: these are the client's real contact
  // details, and a later task must not quietly replace them with plausible-looking
  // placeholders. `email` and `socials` are absent/empty on purpose — no verified value
  // exists for either — so consumers render those links conditionally. That degradation is
  // asserted where it is rendered (Footer, Contact), not here.
  it("exposes the client's real contact details verbatim", async () => {
    const s = await getSiteSettings()
    expect(s.phones).toEqual(['+91 6301999971', '+91 9676669923'])
    expect(s.whatsappNumber).toBe('+91 6301999971')
    expect(s.address).toBe('Flat No. 202, Mythri Apartments, Opp. BSNL Office, ECIL, Hyderabad-62')
    expect(s.reraDisclaimer).toBeTruthy()
  })
})
