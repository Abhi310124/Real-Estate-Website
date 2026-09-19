import { cn } from '@/lib/cn'
import { JournalCard } from './JournalCard'
import { cardFrameAspect } from './frameAspects'
import type { JournalPost } from '@/lib/data/types'

/**
 * End of the post: a hairline, then the two most recent other posts.
 *
 * Two, not three or four. The reader has just finished one essay, and the job here is to offer the
 * obvious next one rather than to rebuild the listing at the bottom of every page — `/journal` already
 * exists for browsing.
 *
 * The pair sits on the listing's own footprint: `col-span-6` cards at columns 1 and 7, flush at the
 * top, with the two frame shapes that open the listing's first row (443 and 493px tall in a 690px
 * column). It used to be `col-span-5` with the second card at `col-start-8`, which left grid columns
 * 6 and 7 empty between them; the argument for that trough was that two five-column cards with a
 * single gap would read as an even split, and it is the wrong way round — the trough is what makes a
 * pair read as two things placed near each other, where cards touching across the gutter read as a
 * row. Sharing the listing's shapes is also what makes a card look the same wherever it appears,
 * which was the original intent.
 *
 * The rule is a static `border-t` on the section, outside `.layout-grid` so it runs the full width of
 * the viewport: the grid carries the page margin as `padding-inline`, and a rule placed inside it
 * stops 20px short at each end. 1px, and it does not animate. A drawn-on-enter hairline has no
 * counterpart anywhere on the reference, and the `.in-out-line` thickness it used — `max(0.1vw, 1px)`,
 * 1.44px here — belongs to the link underline it was measured from, not to a structural rule.
 *
 * Renders nothing at all when there are no other posts. An empty "More from the journal" heading over
 * blank space is worse than ending on the prose, and with a single published post that is exactly
 * what a header-first implementation produces.
 *
 * The heading is a real `h2` styled as a mono label: it comes after the post's `h1` and before the
 * cards' `h3`s, so the outline stays in order while the label keeps its stamped-metadata size.
 *
 * Worth recording that the reference has no block like this. Its post pages close the way its listing
 * does — a cross-link into the projects, two plates, then the enquiry intake — so the better long-term
 * answer is `components/journal/ProjectsCrossLink.tsx` here instead of, or above, this strip. That is a
 * change to the post route rather than to this component.
 */
export function MoreFromJournal({ posts }: { posts: JournalPost[] }) {
  if (posts.length === 0) return null

  return (
    <section
      data-journal-related
      className="w-full border-t border-edge bg-primary pb-[10vw] pt-[var(--gutter)] text-secondary max-sm:pb-[20vw]"
    >
      <div className="layout-grid">
        <h2 className="col-span-12 font-mono text-mono uppercase text-muted max-sm:text-mono-sm sm:col-span-3">
          More from the journal
        </h2>
      </div>

      <ul className="layout-grid mt-[4vw] max-sm:mt-[10vw] max-sm:gap-y-[16vw]">
        {posts.map((post, i) => (
          <li
            key={post.slug}
            data-testid={`journal-related-${i + 1}`}
            className={cn(
              // `h-fit` so each card hugs its own content — a stretched grid item would take its
              // height from the taller card beside it, flattening the difference the two frame
              // shapes exist to create.
              'col-span-12 h-fit sm:col-span-6',
              i === 1 ? 'sm:col-start-7' : 'sm:col-start-1'
            )}
          >
            <JournalCard
              post={post}
              as="h3"
              frameClassName={cardFrameAspect(i)}
              imageTestId={`journal-related-image-${i + 1}`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
