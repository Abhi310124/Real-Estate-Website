import type { Metadata } from 'next'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogFeature } from '@/components/blog/BlogFeature'
import { Rise } from '@/components/motion/Rise'
import { PageIntro } from '@/components/site/PageIntro'
import { getJournalPosts } from '@/lib/data'

/**
 * `/blog` — "News and updates": the page intro, the newest post as the featured panel, and every other
 * post in a three-up grid beneath it. `/journal` (the previous name) permanently redirects here.
 *
 * Posts are the CMS's `journalPost` documents, newest first and published only.
 */
export const revalidate = 30

export const metadata: Metadata = {
  title: 'News and Updates — BKR INFRA Blog',
  description:
    'Site updates, planning notes and buying guides from BKR INFRA: how we choose land, lay out a project and hand over homes across Hyderabad.',
}

export default async function BlogPage() {
  const posts = await getJournalPosts()
  const [featured, ...rest] = posts

  return (
    <>
      <PageIntro crumb="Blog" lines={['News and updates']} />

      {featured ? (
        <div className="container-page mt-20 max-lg:mt-10">
          <BlogFeature post={featured} />
        </div>
      ) : (
        <p className="container-page mt-16 text-body text-muted">New posts are on their way. Check back soon.</p>
      )}

      {rest.length > 0 && (
        <section className="pb-32 pt-28 max-lg:pb-20 max-lg:pt-16" aria-labelledby="more-posts">
          <Rise as="h2" id="more-posts" className="container-page font-heading text-h2 text-secondary max-sm:text-h2-sm">
            More from the blog
          </Rise>
          <ul className="layout-grid mt-12 gap-y-16">
            {rest.map((post) => (
              <li key={post.id} className="col-span-12 md:col-span-6 lg:col-span-4">
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {rest.length === 0 && <div className="pb-32" />}
    </>
  )
}
