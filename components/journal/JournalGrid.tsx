import { JournalCard } from './JournalCard'
import type { JournalPost } from '@/lib/data/types'

/**
 * The listing's two-column grid, vertically staggered.
 *
 * Same device as `components/storey/JournalPreview.tsx`, and for the same reason: the right column
 * starts 12vw below the left, so the eye travels diagonally down the page instead of scanning rows.
 * Expressed as an `sm:mt` on odd-indexed cards rather than as two hand-built columns, so it holds
 * for any number of posts — this page renders however many the owner has published, unlike the home
 * page's fixed four.
 *
 * `col-start-8` (not 7) on the odd cards is deliberate: two five-column cards with a single empty
 * column between them would read as an even two-up split. The two-column trough is what makes the
 * pair read as placed on a grid.
 *
 * Collapses to one column below `sm`, where a stagger is indistinguishable from inconsistent gaps.
 */
export function JournalGrid({ posts }: { posts: JournalPost[] }) {
  return (
    <ul className="layout-grid mt-[8vw] gap-y-[10vw] max-sm:mt-[14vw] max-sm:gap-y-[16vw]">
      {posts.map((post, i) => (
        <li
          key={post.slug}
          data-testid={`journal-card-${i + 1}`}
          className={
            i % 2 === 1
              ? 'col-span-12 sm:col-span-5 sm:col-start-8 sm:mt-[12vw]'
              : 'col-span-12 sm:col-span-5'
          }
        >
          <JournalCard post={post} index={i} imageTestId={`journal-image-${i + 1}`} />
        </li>
      ))}
    </ul>
  )
}
