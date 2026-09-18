import { ImageReveal } from '@/components/motion/ImageReveal'
import { Button } from '@/components/ui/Button'
import { formatPostDate } from './postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * One journal card, shared by the `/journal` grid and the related-posts strip on a post page.
 *
 * Anatomy is lifted verbatim from `components/storey/JournalPreview.tsx` so a card looks identical
 * on the home page and on the listing: cover image → title at `lead` → excerpt at `body` in
 * `muted` → the mono dateline → a dark "Read" button on its own line. The button sitting below
 * rather than inline with the title is what stops the card reading as a search result.
 *
 * Two props exist only because the card appears in two contexts:
 *
 * - `as` — the listing's cards sit under the page `h1` (so `h2`), while the related strip sits
 *   under its own `h2` (so `h3`). Hard-coding either one breaks heading order on the other page,
 *   which is an axe violation rather than a matter of taste.
 * - `withExcerpt` — the related strip omits it. Two full excerpts directly under the post the
 *   reader has just finished is more reading than a "what's next" row should ask for.
 *
 * The button carries an `aria-label` naming the post: a page with four links all reading "Read" is
 * navigable by sight but not by a screen reader's link list. The visible word is still the first
 * word of the accessible name, which is what WCAG's Label in Name requires.
 */
type Props = {
  post: JournalPost
  /** Position within the group. Feeds the reveal stagger only. */
  index?: number
  as?: 'h2' | 'h3'
  withExcerpt?: boolean
  imageTestId?: string
}

export function JournalCard({ post, index = 0, as: Heading = 'h2', withExcerpt = true, imageTestId }: Props) {
  return (
    <article>
      <ImageReveal
        src={post.coverImage.url}
        alt={post.coverImage.alt}
        sizes="(min-width: 640px) 42vw, 92vw"
        delayMs={index * 100}
        data-testid={imageTestId}
        className="aspect-[3/2] w-full"
      />

      <Heading className="mt-[1.6vw] text-lead font-display max-sm:mt-[5vw] max-sm:text-lead-sm">
        {post.title}
      </Heading>

      {withExcerpt && (
        <p className="mt-[1vw] text-body text-muted max-sm:mt-[3vw] max-sm:text-body-sm">{post.excerpt}</p>
      )}

      <p className="mt-[1.4vw] font-mono text-mono uppercase text-muted max-sm:mt-[4vw] max-sm:text-mono-sm">
        <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
      </p>

      <div className="mt-[1.4vw] max-sm:mt-[5vw]">
        <Button href={`/journal/${post.slug}`} tone="dark" aria-label={`Read ${post.title}`}>
          Read
        </Button>
      </div>
    </article>
  )
}
