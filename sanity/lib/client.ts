import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

// `createClient` throws synchronously ("Configuration must contain `projectId`") when projectId
// is undefined — confirmed empirically against the installed @sanity/client. That is fine here:
// this module is only ever reached two ways, and both already guarantee a real projectId first.
//   1. lib/data/index.ts's `source()` only does `await import('./sanity')` (which imports this
//      file) when `activeSource() === 'sanity'`, i.e. NEXT_PUBLIC_SANITY_PROJECT_ID is set.
//   2. tests/unit/sanity-source.test.ts mocks this whole module with `vi.mock('@/sanity/lib/client', ...)`
//      before anything imports it, so the real createClient() call here never executes in tests.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // Published marketing pages have no reason to bypass Sanity's CDN — useCdn: true trades a
  // little eventual-consistency lag (seconds) for materially faster reads, and the on-demand
  // revalidation webhook (app/api/revalidate/route.ts) is what actually keeps the site fresh.
  useCdn: true,
  // Server-only (see .env.example) — never read on the client. Every query this project runs
  // already filters `isPublished == true` (sanity/lib/queries.ts), so this token is not needed
  // for the dataset to work today; it exists so a token can be dropped in later without a code
  // change if the dataset is ever switched from public to private. undefined is a valid,
  // fully-supported value for an unauthenticated client against a public dataset — Ruling 3's
  // "must still work with no env vars set" applies to this variable too.
  token: process.env.SANITY_API_READ_TOKEN,
})
