import { RuleDraw } from '@/components/motion/RuleDraw'
import { JournalCard } from './JournalCard'
import type { JournalPost } from '@/lib/data/types'

/**
 * End of the post: a drawn hairline, then the two most recent other posts.
 *
 * Two, not three or four. The reader has just finished one essay, and the job here is to offer the
 * obvious next one rather than to rebuild the listing at the bottom of every page — `/journal`
 * already exists for browsing. The pair sits on the same 5 / 5-with-a-two-column-trough footprint
 * as the listing grid so the cards look placed on the same grid, minus the vertical stagger, which
 * needs a run of cards to read as anything.
 *
 * Renders nothing at all when there are no other posts. An empty "More from the journal" heading
 * over blank space is worse than ending on the prose, and with a single published post that is
 * exactly what a header-first implementation produces.
 *
 * The heading is a real `h2` styled as a mono label: it comes after the post's `h1` and before the
 * cards' `h3`s, so the outline stays in order while the label keeps its stamped-metadata size.
 */
export function MoreFromJournal({ posts }: { posts: JournalPost[] }) {
  if (posts.length === 0) return null

  return (
    <section data-journal-related className="w-full bg-primary pb-[10vw] text-secondary max-sm:pb-[20vw]">
      <div className="layout-grid">
        <RuleDraw className="col-span-12 mb-[3vw] text-edge max-sm:mb-[8vw]" />
        <h2 className="col-span-12 font-mono text-mono uppercase text-muted max-sm:text-mono-sm sm:col-span-3">
          More from the journal
        </h2>
      </div>

      <ul className="layout-grid mt-[4vw] gap-y-[10vw] max-sm:mt-[10vw] max-sm:gap-y-[16vw]">
        {posts.map((post, i) => (
          <li
            key={post.slug}
            data-testid={`journal-related-${i + 1}`}
            className={i === 1 ? 'col-span-12 sm:col-span-5 sm:col-start-8' : 'col-span-12 sm:col-span-5'}
          >
            <JournalCard
              post={post}
              index={i}
              as="h3"
              withExcerpt={false}
              imageTestId={`journal-related-image-${i + 1}`}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
