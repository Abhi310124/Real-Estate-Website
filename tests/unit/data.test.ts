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

  it('returns null for a slug that does not exist at all', async () => {
    expect(await getProject('no-such-project')).toBeNull()
  })

  it('applies the category and status filters together, not just one at a time', async () => {
    const both = await getProjects({ category: 'villas', status: 'ongoing' })
    expect(both.length).toBeGreaterThan(0)
    expect(both.every((p) => p.category === 'villas' && p.status === 'ongoing')).toBe(true)
  })

  // `bkr-skyline-residences` is the deliberately sparse fixture: later tasks render the
  // optional project blocks against it to prove they degrade instead of crashing. Fetching
  // it here is what keeps it sparse — if someone later fills in its `masterPlan`, the
  // fixture stops proving anything and the absent-masterplan path loses its only coverage,
  // which would surface as a confusing failure several tasks downstream instead of here.
  it('resolves the sparse fixture with its optional blocks genuinely absent', async () => {
    const sparse = await getProject('bkr-skyline-residences')
    expect(sparse).not.toBeNull()
    expect(sparse!.masterPlan).toBeUndefined()
    expect(sparse!.heroImage.alt).toBeTruthy()
    expect(sparse!.reraNumber).toBeTruthy()
    expect(sparse!.overview.length).toBeGreaterThan(0)
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
  // Drift guard on the contact details that ARE verified facts: a later task must not
  // quietly replace them with plausible-looking placeholders. Deliberately silent about
  // `email` and `socials`, which are unset because no verified value exists today —
  // asserting their absence would make this test fail the day the client supplies one. Why
  // they are unset lives as a comment beside them in lib/data/mock.ts, and the conditional
  // rendering it forces is asserted where it happens (Footer, Contact).
  it("exposes the client's real contact details verbatim", async () => {
    const s = await getSiteSettings()
    expect(s.phones).toEqual(['+91 6301999971', '+91 9676669923'])
    expect(s.whatsappNumber).toBe('+91 6301999971')
    expect(s.address).toBe('Flat No. 202, Mythri Apartments, Opp. BSNL Office, ECIL, Hyderabad-62')
    expect(s.reraDisclaimer).toBeTruthy()
  })
})
