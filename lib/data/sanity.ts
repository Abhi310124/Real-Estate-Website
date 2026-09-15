import type { DataSource } from './types'

// Placeholder so `lib/data/index.ts` can `await import('./sanity')` without `tsc --noEmit`
// failing before a Sanity project exists. Task 20 replaces this file wholesale with a real
// `next-sanity` client-backed implementation — keep this minimal, not a head start on that work.
const notConfigured = (): never => {
  throw new Error('Sanity source not configured')
}

export const sanitySource: DataSource = {
  async getProjects() {
    return notConfigured()
  },
  async getFeaturedProjects() {
    return notConfigured()
  },
  async getProject() {
    return notConfigured()
  },
  async getAllProjectSlugs() {
    return notConfigured()
  },
  async getSiteSettings() {
    return notConfigured()
  },
}
