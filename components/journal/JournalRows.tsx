import { Fragment } from 'react'
import { cn } from '@/lib/cn'
import { JournalCard } from './JournalCard'
import { NoteProp } from './NoteProp'
import { cardFrameAspect } from './frameAspects'
import type { JournalPost } from '@/lib/data/types'

/**
 * Everything after the featured post: two cards to a row, with a sheet of notepaper dropped in after
 * the first row.
 *
 * ## Flush rows, differing frames
 *
 * Both cards in a row are `col-span-6` starting at columns 1 and 7 — 47.9vw each, touching across
 * the gutter, both with margin-top 0 so both tops sit on the row's line. The diagonal read comes
 * entirely from the four frame shapes in `./frameAspects.ts`, which stand 443, 493, 641 and 690px
 * tall in a 690px column.
 *
 * This replaces `col-span-5` cards with a 12vw offset on the second column and one aspect for every
 * frame, and the two halves of that were wrong together. The offset takes the diagonal off the wrong
 * edge — once the tops disagree the pair stops reading as a row at all — and it leaves grid columns 6
 * and 7 empty down the whole page, a two-column trough through the middle of the one thing a
 * twelve-column grid is for. Identical frames are the other half: with every card the same shape the
 * offset is the only variation left, so it is asked to do work it is bad at.
 *
 * `mt-[2vw]` between rows, not the 10vw a list of cards wants. 28.8px is almost nothing, and that is
 * the point — within the run of posts the rhythm is close and even, and the page's real breathing
 * room is spent on the 20vw gaps that separate the featured row, the cross-link and the intake. Rows
 * that are 144px apart read as four separate sections instead of as one list. Below `sm` the row
 * collapses to one column and `gap-y-[10vw]` does the separating instead, since at that width there
 * are no rows to keep tight.
 *
 * ## The note prop goes between rows, not beside them
 *
 * It is a flow sibling of the row grids rather than an absolutely-positioned overlay, so it takes its
 * own 24vw of page and then gives 5vw of it back with a negative margin — which is what makes it
 * overlap the row beneath rather than float free of the document. That also means it only appears when
 * there IS a second row to overlap; on a single row it would hang over the cross-link block, which is
 * a different composition (see `./NoteProp.tsx`).
 *
 * ## Any number of posts
 *
 * The rows are chunked from whatever `getJournalPosts()` returned, and the frame shapes cycle, so a
 * fifth or ninth published post lands in a correctly-shaped slot with no change here. An odd count
 * leaves the last row half full, with the single card at `col-start-1` — the reference's own row 1 on
 * `/projects` is a mixed, half-empty row, and a lone card stretched to twelve columns would be the
 * only full-bleed frame on the page.
 *
 * The rows are `div`s and not a `ul`, which is a change from the single list this replaces. The note
 * prop has to sit *between* two rows in flow for its negative bottom margin to overlap the second one,
 * and nothing but an `li` may be a child of a `ul` — so a list here can only be two lists of two,
 * which announces "list, 2 items" twice for what is one run of four posts. Each card is already an
 * `<article>`, which carries the grouping honestly without asserting a count that is an artefact of the
 * layout.
 */

/** Cards to a row. Two, everywhere the reference lists posts. */
const PER_ROW = 2

export function JournalRows({ posts }: { posts: JournalPost[] }) {
  if (posts.length === 0) return null

  const rows: JournalPost[][] = []
  for (let i = 0; i < posts.length; i += PER_ROW) rows.push(posts.slice(i, i + PER_ROW))

  return (
    <>
      {rows.map((row, r) => (
        <Fragment key={row[0].slug}>
          <div className="layout-grid mt-[2vw] max-sm:mt-[10vw] max-sm:gap-y-[10vw]">
            {row.map((post, c) => {
              // Slot index across the whole run, offset by one for the featured post above, so the
              // test ids read as one continuous series with it and the shapes keep cycling across
              // row boundaries rather than restarting every row.
              const slot = r * PER_ROW + c

              return (
                <div
                  key={post.slug}
                  data-testid={`journal-card-${slot + 2}`}
                  className={cn(
                    // `h-fit` so the card hugs its own content: a grid item stretches by default,
                    // and a stretched card would take its height from the taller card beside it,
                    // which is exactly the height difference the composition is built on.
                    'col-span-12 h-fit sm:col-span-6',
                    c === 1 ? 'sm:col-start-7' : 'sm:col-start-1'
                  )}
                >
                  {/* `sizes` is left to the card's own default, which is already quoted at 58vw —
                      1.2x a 47.9vw column, which is what these cards are. */}
                  <JournalCard
                    post={post}
                    frameClassName={cardFrameAspect(slot)}
                    imageTestId={`journal-image-${slot + 2}`}
                  />
                </div>
              )
            })}
          </div>

          {r === 0 && rows.length > 1 ? <NoteProp /> : null}
        </Fragment>
      ))}
    </>
  )
}
