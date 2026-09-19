import { ImageReveal } from '@/components/motion/ImageReveal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatPostDate } from './postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * One journal card, shared by the `/journal` grid and the related-posts strip on a post page.
 *
 * Reading order is cover image → title → mono dateline → a dark "Read" button on its own line. The
 * button sitting below rather than inline with the title is what stops the card reading as a search
 * result.
 *
 * **This card is the listing's card, and it is deliberately one element longer than the home page's.**
 * `components/storey/JournalPreview.tsx` renders its own four cards — cover, title, "Read", no
 * dateline — and the difference is the dateline, which belongs to a listing and not to a selection.
 * A reader browsing `/journal` is choosing partly on how recent a piece is; the home page is showing
 * four chosen pieces in a fixed composition, where a date under each is metadata nobody came for.
 * Two components rather than one card with a `withDateline` switch, because a boolean that adds or
 * removes a whole element is a component that has not decided what it is — and the home page's four
 * cards live inside a section whose composition they are part of, not in a reusable slot.
 *
 * Frame shape, by contrast, IS a prop (`frameClassName`), and the difference is worth naming: the
 * dateline is what the card *is*, while the shape is where the card *sits*. Every row that renders
 * these runs flush `col-span-6` pairs on a shared top edge, so the whole diagonal read comes from the
 * two frames standing at different heights — which makes the ratio a property of the slot, decided by
 * the row, and not something this component or the post could know.
 *
 * **The title is prose at the body step, not a display step.** 23.04px, weight 400, leading 1.2, in a
 * measure narrow enough to wrap it to two lines. This looks like an under-set heading until you see
 * the grid it belongs to: a card title here is an index entry, and at 31.68px / weight 500 / leading
 * 1.0 — a step built for section headings — every card announces itself as loudly as the section it
 * sits in, and four of them in a grid flatten the page's hierarchy to one level. The 1.2 leading is
 * not cosmetic either: it is the one step with enough interline space for a masked per-line reveal,
 * should a title ever need one.
 *
 * **No excerpt, which is why the "Read" control has to stay a filled button.** A card carries a
 * title, a date and one affordance. A 100-character summary directly under the title answers the
 * question the title asked, so it gives a reader less reason to open the post rather than more — and
 * the excerpt still earns its keep as the post's meta description and as the standfirst in
 * `components/journal/PostBody.tsx`, which is where a summary is genuinely wanted. But removing it
 * also removed the card's mass: what is left is a photograph, two lines of prose at body size and a
 * date, none of which looks clickable. `Button` with `tone="dark"` is the site's one control shape —
 * black fill, square corners, the ornament, and a hover that moves the label — so "Read" is
 * unmistakably a control at a glance, and at `text-label` (15.84px) it is also the size the
 * reference's own card affordance is. An underlined text link here would be correct in the abstract
 * and wrong in this grid: it is the only interactive thing on the card and it has to look it.
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
  /**
   * The cover frame's shape, as an `aspect-*` class. Which shape a card takes is a property of its
   * *slot* rather than of the post — the listing and the related strip both run flush `col-span-6`
   * pairs with a shared top edge, so all of the diagonal in those rows comes from the frames standing
   * at different heights, and a post moving from slot 1 to slot 2 should change shape. That makes it
   * the row's decision, not this component's, which is why it arrives as a prop.
   *
   * It REPLACES the default rather than merging with it. `lib/cn.ts` is a plain join with no
   * tailwind-merge, so passing `aspect-[14/9]` alongside a hard-coded `aspect-[3/2]` would emit both
   * and let Tailwind's stylesheet order decide which one wins.
   */
  frameClassName?: string
  /**
   * The `sizes` hint, which only the caller can get right — it depends on the column span the card
   * is placed in, and a card does not know its own width. The default is quoted for the `col-span-6`
   * (47.9vw) placement both current call sites use; a five-column card is 39.7vw and wants
   * `(min-width: 640px) 50vw, 92vw`.
   *
   * Both numbers are ~1.2x the frame's own width on purpose, not a safety margin. `ImageReveal`
   * renders the photograph at `scale(1.2)` inside its frame, so a hint quoted at the frame width
   * asks the browser for a candidate 20% too small and the picture is visibly soft.
   */
  sizes?: string
}

export function JournalCard({
  post,
  as: Heading = 'h2',
  imageTestId,
  frameClassName,
  sizes = '(min-width: 640px) 58vw, 92vw',
}: Props) {
  return (
    <article>
      <ImageReveal
        src={post.coverImage.url}
        alt={post.coverImage.alt}
        sizes={sizes}
        data-testid={imageTestId}
        // `saturate-[1.12]` grades the photograph. It sits on the frame because ImageReveal exposes no
        // class for its `<Image>`; a CSS filter covers the whole subtree, and the only other thing in
        // the frame is the uncovering scrim, which is pure black and unmoved by a saturation
        // multiplier. Move it onto the image and drop it here if that prop ever lands — keeping both
        // would grade the frame at saturate(2.25).
        //
        // `3/2` is a fallback for a caller that does not place the card in a shaped row, not a
        // designed shape: the rows that exist all pass their own slot's ratio.
        className={cn('w-full saturate-[1.12]', frameClassName ?? 'aspect-[3/2]')}
      />

      {/* 32.1vw is an absolute measure, not a fraction of the card: it is the width at which the
          reference's longest card title (49 characters) breaks onto its second line, and that is the
          same number whichever column span the card is dropped into. Removed below `sm`, where the
          card is the full page measure and a cap would leave a ragged column against the frame. */}
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
