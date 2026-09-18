import { ImageReveal } from '@/components/motion/ImageReveal'
import { Button } from '@/components/ui/Button'
import { JOURNAL_PREVIEW } from '@/lib/content/home'
import type { JournalPost } from '@/lib/data/types'

/**
 * White chapter: a two-column journal grid with the columns vertically staggered.
 *
 * The stagger is the reference's device — the right column starts well below the left, so the eye
 * moves diagonally down the page rather than in rows. Implemented as a `sm:mt` on odd-indexed
 * cards, which means it survives an arbitrary number of posts instead of only working for exactly
 * four.
 *
 * Each card is image → title → a dark "Read" button, with the button on its own line rather than
 * inline with the title. That vertical separation is what stops the card reading as a search
 * result.
 *
 * Dropped to a single column below `sm`, where a stagger would just look like inconsistent gaps.
 */
export function JournalPreview({ posts }: { posts: JournalPost[] }) {
  // Four is what the layout is designed around; more would break the stagger's rhythm and fewer
  // leaves a hole. Extra posts live on /journal.
  const shown = posts.slice(0, 4)

  if (shown.length === 0) return null

  return (
    <section data-journal className="w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]">
      <div className="layout-grid items-end">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          {JOURNAL_PREVIEW.title}
        </h2>
        <div className="col-span-12 mt-[3vw] flex sm:col-span-3 sm:col-start-10 sm:mt-0 sm:justify-end">
          <Button href={JOURNAL_PREVIEW.cta.href} tone="dark" className="max-sm:w-full">
            {JOURNAL_PREVIEW.cta.label}
          </Button>
        </div>
      </div>

      <ul className="layout-grid mt-[8vw] gap-y-[10vw] max-sm:mt-[14vw] max-sm:gap-y-[16vw]">
        {shown.map((post, i) => (
          <li
            key={post.slug}
            // Odd cards drop by 12vw on desktop only. `sm:mt-[12vw]` on the second column is what
            // produces the diagonal read.
            className={i % 2 === 1 ? 'col-span-12 sm:col-span-5 sm:col-start-8 sm:mt-[12vw]' : 'col-span-12 sm:col-span-5'}
          >
            <ImageReveal
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              sizes="(min-width: 640px) 42vw, 92vw"
              delayMs={i * 100}
              data-testid={`journal-image-${i + 1}`}
              className="aspect-[3/2] w-full"
            />
            <h3 className="mt-[1.6vw] text-lead font-display max-sm:mt-[5vw] max-sm:text-lead-sm">{post.title}</h3>
            <p className="mt-[1vw] text-body text-muted max-sm:mt-[3vw] max-sm:text-body-sm">{post.excerpt}</p>
            <div className="mt-[1.6vw] max-sm:mt-[5vw]">
              <Button href={`/journal/${post.slug}`} tone="dark">
                Read
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
