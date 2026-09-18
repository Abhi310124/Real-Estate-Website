import { mockSource } from './mock'
import type { DataSource } from './types'

export * from './types'

// Source selection is one compile-time-checkable switch: set NEXT_PUBLIC_SANITY_PROJECT_ID
// and every page that imports from `lib/data` (never from `lib/data/sanity` or `lib/data/mock`
// directly) starts reading real content instead of the mock fallback. Because both sources
// implement the same `DataSource` interface, drift between them is a compile error, not a
// runtime surprise.
export function activeSource(): 'mock' | 'sanity' {
  return process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? 'sanity' : 'mock'
}

async function source(): Promise<DataSource> {
  if (activeSource() === 'sanity') {
    const { sanitySource } = await import('./sanity')
    return sanitySource
  }
  return mockSource
}

export const getProjects: DataSource['getProjects'] = async (f) => (await source()).getProjects(f)
export const getFeaturedProjects: DataSource['getFeaturedProjects'] = async () => (await source()).getFeaturedProjects()
export const getProject: DataSource['getProject'] = async (s) => (await source()).getProject(s)
export const getAllProjectSlugs: DataSource['getAllProjectSlugs'] = async () => (await source()).getAllProjectSlugs()
export const getSiteSettings: DataSource['getSiteSettings'] = async () => (await source()).getSiteSettings()
export const getJournalPosts: DataSource['getJournalPosts'] = async () => (await source()).getJournalPosts()
export const getJournalPost: DataSource['getJournalPost'] = async (s) => (await source()).getJournalPost(s)
export const getAllJournalSlugs: DataSource['getAllJournalSlugs'] = async () => (await source()).getAllJournalSlugs()
