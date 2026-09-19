import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { JOURNAL_PREVIEW } from '@/lib/content/home'
import type { JournalPost } from '@/lib/data/types'

/**
 * Cream chapter: four journal cards in two flush 6 + 6 rows.
 *
 * ## The rows are flush; the frames make the stagger
 *
 * Both cards in a row are `col-span-6` — 47.9vw each, starting at 1.4% and 50.7% of the viewport,
 * touching across the gutter with no empty column and no vertical offset. What produces the diagonal
 * read is that the four frames are four different shapes — 1/1, 4/3, 4/3, 6/7 — which in a 690px
 * column stand 690, 517.5, 517.5 and 805px tall. Every card top sits on its row's line and no two
 * bottoms agree, so the composition is read off the bottom edges while the top edges hold the grid.
 *
 * The obvious alternative, and the one this replaces, is `col-span-5` cards with a 12vw top offset on
 * the second column and one aspect ratio for all four frames. It gets the diagonal from the wrong
 * edge: tops disagree, so the pair stops reading as a row at all, and it leaves grid columns 6 and 7
 * empty down the entire section — a two-column trough through the middle of the page, which undoes
 * the one thing a twelve-column grid is for. Identical frames are the other half of the problem: once
 * every card is the same shape the only variation left is the offset, so the offset has to do work it
 * is bad at.
 *
 * Because of that the aspect sequence is *positional*. It is composition, not metadata, so it lives
 * here as a fixed list rather than as a field on a post — a post that moves from slot 1 to slot 2
 * should change shape, and an editor should not be asked to re-plan the grid when they publish.
 *
 * ## The header is a 7 + 4 pair, and the measure is the point
 *
 * The heading takes seven columns (56.1vw, two lines at 100.8px) and columns 9–12 carry a 31.5vw
 * block holding the intro above the "View Posts" control — 281.2px tall in total, which is six
 * 27.648px lines plus the button plus the gap between them. Four columns is load-bearing: the same
 * 212 characters across seven columns would mask three wide lines instead of six short ones, and
 * `SplitLines` faithfully animates whatever the measure produces. The split and the measure only read
 * right as a pair.
 *
 * The block is also the reason this grid is `items-start`. It is taller than the two-line heading, so
 * aligning the row on its end would lift the intro's first line ~80px above the heading's first line
 * and the heading would read as the caption.
 *
 * ## No stagger between the cards
 *
 * The frames deliberately pass no `delayMs`. Inside a card only one thing animates — the frame's
 * uncovering scrim, which `ImageReveal` owns — so a card-level timeline would have a single target
 * and nothing to stagger. And now that the rows are flush, both frames in a row cross the trigger
 * line on the same scanline, which makes a document-order delay of `i * 100`ms actively wrong: it
 * would hold the right-hand card back from a partner that is demonstrably level with it. Uncovering
 * together is what two frames sharing a top edge should do.
 *
 * Dropped to a single column below `sm`, where four different aspect ratios in one stack still give
 * the section its rhythm and a 6 + 6 row would leave each card 45vw wide.
 */

// 690x690, 690x517.5, 690x517.5 and 690x805 in a 690px column. Kept as arbitrary ratios rather than
// `aspect-square` and friends so the four read as one series at a glance.
const FRAME_ASPECTS = ['aspect-[1/1]', 'aspect-[4/3]', 'aspect-[4/3]', 'aspect-[6/7]'] as const

export function JournalPreview({ posts }: { posts: JournalPost[] }) {
  // Four, because four is how many shapes the composition has. Extra posts live on /journal.
  const shown = posts.slice(0, FRAME_ASPECTS.length)

  if (shown.length === 0) return null

  return (
    // 20px, the same value as the gutter. The reference keeps its light sections all but
    // padding-free and spends its vertical rhythm on section-level margins and overlaps instead, so
    // an internal 8vw (115.2px) here was buying a gap that belongs one level up. The mobile pair is
    // not proportional on purpose: at 390px the gutter is under 12px, and there is no section-level
    // rhythm at that width to fall back on.
    <section data-journal className="w-full bg-primary py-[var(--gutter)] text-secondary max-sm:py-[10vw]">
      <div className="layout-grid items-start">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-7">
          {JOURNAL_PREVIEW.title}
        </h2>

        <div className="col-span-12 mt-[3vw] sm:col-span-4 sm:col-start-9 sm:mt-0">
          <SplitLines text={JOURNAL_PREVIEW.intro} className="text-body text-muted max-sm:text-body-sm" />

          {/* 5.6vw = 80.6px, which is what is left of the block's measured 281.2px once six lines of
              intro and the button have taken their share. The gap is large deliberately — the intro
              and the control are two separate offers, not a paragraph with a link at the end. */}
          <div className="mt-[5.6vw] max-sm:mt-[8vw]">
            <Button href={JOURNAL_PREVIEW.cta.href} tone="dark" className="max-sm:w-full">
              {JOURNAL_PREVIEW.cta.label}
            </Button>
          </div>
        </div>
      </div>

      {/* 10vw row gap: a 690px frame plus its title and control comes to ~826px, and 144px on top of
          that reproduces the reference's 972px row pitch. */}
      <ul className="layout-grid mt-[8vw] gap-y-[10vw] max-sm:mt-[14vw] max-sm:gap-y-[16vw]">
        {shown.map((post, i) => (
          <li
            key={post.slug}
            className={
              i % 2 === 1
                ? 'col-span-12 sm:col-span-6 sm:col-start-7'
                : 'col-span-12 sm:col-span-6 sm:col-start-1'
            }
          >
            <ImageReveal
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              // Quoted against the frame, but the photograph renders at 1.2x inside it, so a 47.9vw
              // card wants ~58vw of pixels.
              sizes="(min-width: 640px) 58vw, 92vw"
              data-testid={`journal-image-${i + 1}`}
              // `saturate-[1.12]` sits on the frame rather than on the photograph because ImageReveal
              // does not expose a class for its `<Image>`. A CSS filter applies to the whole subtree,
              // and the only other thing in the frame is the uncovering scrim, which is pure black
              // and unchanged by a saturation multiplier — so this is visually identical to grading
              // the image directly. Move it onto the image and delete it here the moment that prop
              // exists; keeping both would grade every frame at saturate(2.25).
              className={cn('w-full saturate-[1.12]', FRAME_ASPECTS[i % FRAME_ASPECTS.length])}
            />
            {/* 32.1vw inside a 47.9vw card: the reference's card titles wrap to two lines at that
                measure, and letting them run the full width of the frame turns a two-line index
                entry into a one-line headline. */}
            <h3 className="mt-[1.6vw] max-w-[32.1vw] text-body max-sm:mt-[5vw] max-sm:max-w-none max-sm:text-body-sm">
              {post.title}
            </h3>
            <div className="mt-[1.6vw] max-sm:mt-[5vw]">
              <Button href={`/journal/${post.slug}`} tone="dark" aria-label={`Read ${post.title}`}>
                Read
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
