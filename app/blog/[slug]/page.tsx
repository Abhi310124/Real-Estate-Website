import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BlogCard } from '@/components/blog/BlogCard'
import { RevealImage } from '@/components/motion/RevealImage'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { EnquiryDoors } from '@/components/site/EnquiryDoors'
import { getAllJournalSlugs, getJournalPost, getJournalPosts } from '@/lib/data'
import { formatPostDate, readingTime } from '@/lib/postDate'

type Props = { params: Promise<{ slug: string }> }

// `generateStaticParams` decides which slugs are prerendered at build time, `revalidate` how long each
// is served before regenerating. A slug outside the list still reaches the render on demand, where the
// notFound() below covers it.
export const revalidate = 30

// Published slugs only — an unpublished post is never prerendered.
export async function generateStaticParams() {
  const slugs = await getAllJournalSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getJournalPost(slug)
  if (!post) return {}

  return {
    title: `${post.title} — BKR INFRA Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: post.coverImage.url, alt: post.coverImage.alt }],
    },
  }
}

/**
 * A post, as the layout sets one: "‹ All posts", the title at the 64px step, the cover as a wide plate
 * with rounded corners, then the text in a reading measure — narrower than the reference's, which runs
 * its prose about 140 characters a line; this keeps it near 75. Other posts follow, then the doors.
 */
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([getJournalPost(slug), getJournalPosts()])

  // getJournalPost() already filters on isPublished, so this one guard covers both an unknown slug and
  // a real-but-hidden post.
  if (!post) notFound()

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3)

  return (
    <>
      <article>
        <header className="container-page pt-[72px] max-lg:pt-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-body text-accentInk transition-colors duration-300 hover:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All posts
          </Link>
          <h1 className="mt-8 max-w-[1240px] font-heading text-h1 text-secondary max-sm:text-h1-sm">{post.title}</h1>
          <p className="mt-6 flex gap-4 text-small text-navySoft">
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span>{readingTime([post.excerpt, ...post.body])}</span>
          </p>
        </header>

        <div className="mt-16 px-[max(calc(var(--margin)+36px),calc((100%-1272px)/2))] max-lg:mt-10 max-lg:px-[var(--margin)]">
          <Tilt3D max={2} perspective={2200}>
            <RevealImage
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              sizes="(max-width: 1440px) 92vw, 1272px"
              preload
              className="aspect-[1272/560] rounded-[32px] max-md:aspect-[4/3] max-md:rounded-card"
            />
          </Tilt3D>
        </div>

        <div className="layout-grid mt-20 max-lg:mt-12">
          <div className="col-span-12 lg:col-span-8 lg:col-start-3">
            <p className="font-heading text-h4 text-secondary max-sm:text-h4-sm">{post.excerpt}</p>
            <div className="mt-10 max-w-[760px] space-y-6 text-body text-secondary">
              {post.body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="pb-8 pt-32 max-lg:pt-20" aria-labelledby="related-posts">
          <h2 id="related-posts" className="container-page font-heading text-h2 text-secondary max-sm:text-h2-sm">
            More from the blog
          </h2>
          <ul className="layout-grid mt-12 gap-y-16">
            {related.map((p) => (
              <li key={p.id} className="col-span-12 md:col-span-6 lg:col-span-4">
                <BlogCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <EnquiryDoors className="mt-24" />
    </>
  )
}
