// Both read from the two public env vars documented in .env.example — safe to expose to the
// browser, and safe to leave unset. Leaving them unset is a fully supported, tested state:
// activeSource() in lib/data/index.ts falls back to 'mock' and never constructs a Sanity
// client, so nothing here needs to throw just because a Sanity project hasn't been created yet.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Sanity's API versioning is calendar-based ("lock to the API shape as of this date"), not tied
// to this project's own release date — pinning it avoids silently picking up breaking API
// changes from Sanity's side.
export const apiVersion = '2026-01-01'
