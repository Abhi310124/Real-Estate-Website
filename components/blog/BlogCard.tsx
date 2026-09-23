import Link from 'next/link'
import { RevealImage } from '@/components/motion/RevealImage'
import { formatPostDate, readingTime } from '@/lib/postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * A post in the blog's grid.
 *
 * Hover is the layout's blog-card gesture: an 8px bar in the brand gradient draws across the foot of
 * the photograph over 800ms on the `door` curve (and retracts in 600ms), and an arrow appears beside
 * "Read more". The whole card is the link; it is all CSS on the card's `group`.
 */
export function BlogCard({ post, headingLevel: Heading = 'h3' }: { post: JournalPost; headingLevel?: 'h2' | 'h3' }) {
  return (
    <article className="group h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
      >
        <div className="relative aspect-[416/280] overflow-clip rounded-card">
          <RevealImage src={post.coverImage.url} alt={post.coverImage.alt} sizes="(max-width: 767px) 100vw, 33vw" zoom fill />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2">
            <div className="bg-brand-x h-full w-0 transition-[width] duration-[600ms] ease-door group-hover:w-full group-hover:duration-[800ms] motion-reduce:transition-none" />
          </div>
        </div>
        <p className="mt-5 flex gap-4 text-small text-navySoft">
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span>{readingTime([post.excerpt, ...post.body])}</span>
        </p>
        <Heading className="mt-2 font-heading text-h4 text-secondary max-sm:text-h4-sm">{post.title}</Heading>
        <p className="mt-3 text-body text-muted">{post.excerpt}</p>
        <span className="mt-auto flex items-center gap-2 pt-5 text-body text-accentInk">
          Read more
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-4 w-4 -translate-x-1 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <path d="M3 8h9M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </article>
  )
}
