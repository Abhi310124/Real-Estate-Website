import { ImageReveal } from '@/components/motion/ImageReveal'
import { Button } from '@/components/ui/Button'
import { formatPostDate } from './postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * One journal card, shared by the `/journal` grid and the related-posts strip on a post page.
 *
 * Anatomy matches `components/storey/JournalPreview.tsx` so a card looks the same wherever it
 * appears: cover image → title → the mono dateline → a dark "Read" button on its own line. The
 * button sitting below rather than inline with the title is what stops the card reading as a search
 * result. (This card keeps the dateline, which the home page's four do not: a listing is ordered by
 * date and a reader browsing it is choosing partly on how recent a piece is, where the home page is
 * showing four selected pieces and the date is noise.)
 *
 * **The title is prose at the body step, not a display step.** 23.04px, weight 400, leading 1.2, in a
 * measure narrow enough to wrap it to two lines. This looks like an under-set heading until you see
 * the grid it belongs to: a card title here is an index entry, and at 31.68px / weight 500 / leading
 * 1.0 — a step built for section headings — every card announces itself as loudly as the section it
 * sits in, and four of them in a grid flatten the page's hierarchy to one level. The 1.2 leading is
 * not cosmetic either: it is the one step with enough interline space for a masked per-line reveal,
 * should a title ever need one.
 *
 * **No excerpt.** A card carries a title and a "Read" affordance and nothing else. The excerpt that
 * used to sit here was the only copy on the site with no counterpart in the design it is drawn from,
 * and it was doing the opposite of its intent: a 100-character summary directly under the title
 * answers the question the title asked, so there is less reason to open the post, not more. The
 * excerpt still earns its keep as the post's meta description and as the standfirst on the post page
 * itself (`components/journal/PostBody.tsx`), which is where a summary is genuinely wanted.
 *
 * `as` exists because the card appears under two different headings: the listing's cards sit under
 * the page `h1` (so `h2`), while the related strip sits under its own `h2` (so `h3`). Hard-coding
 * either one breaks heading order on the other page, which is an axe violation rather than a matter
 * of taste.
 *
 * The button carries an `aria-label` naming the post: a page with four links all reading "Read" is
 * navigable by sight but not by a screen reader's link list. The visible word is still the first
 * word of the accessible name, which is what WCAG's Label in Name requires.
 */
type Props = {
  post: JournalPost
  /**
   * Vestigial, both of them, and they should go together with the call sites that still pass them.
   *
   * `index` fed a per-card reveal delay. It could never produce a perceived stagger: every
   * `ImageReveal` owns its own observer, and cards in a grid sit far enough apart vertically that the
   * "staggered" frames fired whole seconds apart. Real stagger needs one trigger per group driving a
   * timeline over its children, and inside this card there is exactly one animated element — the
   * frame's uncovering scrim — so there is nothing here to stagger.
   *
   * `withExcerpt` switched off a paragraph that no longer exists on any card.
   */
  index?: number
  as?: 'h2' | 'h3'
  withExcerpt?: boolean
  imageTestId?: string
}

export function JournalCard({ post, as: Heading = 'h2', imageTestId }: Props) {
  return (
    <article>
      <ImageReveal
        src={post.coverImage.url}
        alt={post.coverImage.alt}
        // Quoted against the frame, and the photograph renders at 1.2x inside it — a 39.7vw card
        // therefore wants ~50vw of pixels rather than the frame's own width.
        sizes="(min-width: 640px) 50vw, 92vw"
        data-testid={imageTestId}
        // `saturate-[1.12]` grades the photograph. It sits on the frame because ImageReveal exposes no
        // class for its `<Image>`; a CSS filter covers the whole subtree, and the only other thing in
        // the frame is the uncovering scrim, which is pure black and unmoved by a saturation
        // multiplier. Move it onto the image and drop it here if that prop ever lands — keeping both
        // would grade the frame at saturate(2.25).
        className="aspect-[3/2] w-full saturate-[1.12]"
      />

      <Heading className="mt-[1.6vw] max-w-[32.1vw] text-body max-sm:mt-[5vw] max-sm:max-w-none max-sm:text-body-sm">
        {post.title}
      </Heading>

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
