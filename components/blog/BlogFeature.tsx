import Link from 'next/link'
import { RevealImage } from '@/components/motion/RevealImage'
import { Tilt3D } from '@/components/motion/Tilt3D'
import { readingTime } from '@/lib/postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * The featured post: the layout's tinted panel, the photograph mounted on a cream card in its left
 * half, the post's title at the 40px step in its right half under a "Featured · N min read" line.
 *
 * The same gradient bar as the grid cards draws under the photograph on hover, and the card tips
 * toward the pointer in perspective.
 */
export function BlogFeature({ post }: { post: JournalPost }) {
  return (
    <article className="group">
      <Link
        href={`/blog/${post.slug}`}
        className="grid grid-cols-12 items-center gap-x-[var(--gutter)] gap-y-10 rounded-card bg-tint p-12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary max-md:p-5"
      >
        <Tilt3D className="col-span-12 md:col-span-6" max={4}>
          <div className="rounded-card bg-primary p-4 shadow-[0_24px_48px_-32px_rgba(10,26,47,0.4)]">
            <div className="relative aspect-[568/480] overflow-clip rounded-card">
              <RevealImage
                src={post.coverImage.url}
                alt={post.coverImage.alt}
                sizes="(max-width: 767px) 90vw, 42vw"
                preload
                zoom
                fill
              />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2">
                <div className="bg-brand-x h-full w-0 transition-[width] duration-[600ms] ease-door group-hover:w-full group-hover:duration-[800ms] motion-reduce:transition-none" />
              </div>
            </div>
          </div>
        </Tilt3D>
        <div className="col-span-12 md:col-span-6 md:pl-4">
          <p className="flex gap-4 text-small text-navySoft">
            <span>Featured</span>
            <span>{readingTime([post.excerpt, ...post.body])}</span>
          </p>
          <h2 className="mt-4 font-heading text-h2 text-secondary max-sm:text-h2-sm">{post.title}</h2>
          <p className="mt-5 text-body text-muted">{post.excerpt}</p>
          <span className="mt-8 inline-flex items-center gap-2 text-body text-secondary underline decoration-accent decoration-2 underline-offset-8">
            Read more
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M3 8h9M8.5 4 12.5 8l-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </Link>
    </article>
  )
}
