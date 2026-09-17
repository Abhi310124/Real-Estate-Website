import { describe, expect, it, vi } from 'vitest'

vi.mock('@/sanity/lib/client', () => ({
  sanityClient: { fetch: vi.fn(async () => []) },
}))

describe('sanity source conforms to the DataSource contract', () => {
  it('implements every method the mock source does', async () => {
    const { sanitySource } = await import('@/lib/data/sanity')
    const { mockSource } = await import('@/lib/data/mock')
    for (const k of Object.keys(mockSource)) {
      // `DataSource` (lib/data/types.ts) is a plain interface with five named methods and no
      // index signature, so `sanitySource as Record<string, unknown>` alone is a TS2352 error
      // under this project's strict tsconfig ("neither type sufficiently overlaps with the
      // other") — caught by `tsc --noEmit`, though vitest's esbuild transform doesn't type-check
      // and would happily have run it. Routing through `unknown` first is TypeScript's own
      // documented escape hatch for exactly this case; it is a compile-time-only cast with no
      // effect on the runtime lookup the plan's version and this version both perform.
      expect(typeof (sanitySource as unknown as Record<string, unknown>)[k], `missing: ${k}`).toBe('function')
    }
  })

  it('every project query filters on isPublished', async () => {
    const q = await import('@/sanity/lib/queries')
    const projectQueries = Object.entries(q).filter(
      ([name, v]) => typeof v === 'string' && /_type\s*==\s*["']project["']/.test(v as string) && name !== 'allSlugsIncludingDrafts',
    )
    expect(projectQueries.length).toBeGreaterThan(0)
    for (const [name, query] of projectQueries) {
      expect(query as string, `${name} must filter isPublished`).toMatch(/isPublished\s*==\s*true/)
    }
  })
})
