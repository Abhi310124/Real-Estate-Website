import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MoreFromJournal } from '@/components/journal/MoreFromJournal'
import { PostBody } from '@/components/journal/PostBody'
import { PostCover } from '@/components/journal/PostCover'
import { getAllJournalSlugs, getJournalPost, getJournalPosts } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

// Same ISR pairing as /projects/[slug]: `generateStaticParams` decides which slugs get a prerendered
// file at build time, `revalidate` decides how long each is served before being regenerated. A slug
// outside the list still reaches this function on demand, where the notFound() below covers it.
export const revalidate = 30

// Published slugs only — an unpublished post is never in this list, so it is never prerendered and
// always falls through to the runtime guard when requested.
export async function generateStaticParams() {
  const slugs = await getAllJournalSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Built from the post's own title and excerpt. Every title here is well over 10 characters and
// unique per route, and the excerpt is already a one-sentence summary written for the post, so
// nothing is authored specifically for SEO. Returning `{}` for a missing post lets the route fall
// back to the layout's metadata while the page itself 404s — matching /projects/[slug].
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getJournalPost(slug)
  if (!post) return {}

  return {
    title: `${post.title} — BKR INFRA Journal`,
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

// No <main> (app/layout.tsx owns the single <main id="main">) and no PageShell either: PostCover is
// full-bleed like the home hero, so this route handles its own top clearance by having none — the
// header sits over the photograph in light ink, which `isFullBleedRoute` in SiteHeader.tsx already
// matches for `/journal/[slug]`.
export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params

  // Both fetches start together: the related strip needs the full published list regardless of
  // whether this slug resolves, and awaiting them in sequence would serialise two independent reads.
  const [post, allPosts] = await Promise.all([getJournalPost(slug), getJournalPosts()])

  // getJournalPost() already filters on isPublished, so this one guard covers both an unknown slug
  // and a real-but-hidden post — neither can leak a 200.
  if (!post) notFound()

  // getJournalPosts() is newest-first, so "the two most recent other posts" is just the current one
  // removed and the first two taken. Filtering by slug rather than by id because slug is what the
  // route is keyed on, and a mismatch between the two would show the reader the post they are on.
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <>
      <PostCover post={post} />
      <PostBody post={post} />
      <MoreFromJournal posts={related} />
    </>
  )
}
