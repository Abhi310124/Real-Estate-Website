import { RuleDraw } from '@/components/motion/RuleDraw'
import { formatPostDate } from './postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * The post itself: a mono dateline in the left columns, the prose in a narrow measure beside it.
 *
 * `col-span-6 col-start-4` is the whole point of this section. The rest of the site spans wide
 * because it is carried by photography, but running prose across twelve columns at `body` size is
 * roughly 150 characters a line, which is unreadable. Six columns at 1.6vw lands at ~55 characters —
 * inside the 45–75 the typographic literature settles on — and starting at column 4 rather than
 * column 1 leaves the dateline a home in the margin instead of stacking it above the text.
 *
 * That margin-metadata arrangement is the same one `ProjectsFeature`'s founder note uses (mono label
 * left, content offset right), so the site has one pattern for datelines rather than two.
 *
 * ## The standfirst is the post's own excerpt, and it is set at body size
 *
 * Reusing the excerpt is what keeps this slot honest: it is already written as a one-sentence summary
 * of the post, so it says what a standfirst says without an author writing the same sentence twice,
 * and nothing is invented to fill the space.
 *
 * It is NOT set larger, and that is the part worth explaining because every instinct says a
 * standfirst should be. The step above `body` is `lead` — 31.68px at `line-height: 1` — and this is
 * 90 to 103 characters of prose, which wraps to three lines in a six-column measure. Setting 31.68px
 * text on 31.68px leading over three lines leaves nothing at all between one line's descenders and
 * the next line's ascenders; at the mobile pair (`lead-sm`, 31.2px at 390px) the same sentence runs
 * to seven or eight touching lines. The scale has exactly one wrapping-safe prose step, and that is
 * deliberate rather than an omission — `line-height: 1` is right for every step above `body` because
 * nothing above `body` is meant to carry running text.
 *
 * So the hierarchy here is positional, which is how a standfirst works in print anyway: it is the
 * paragraph above the rule. The rule is doing the work a larger size would otherwise be doing, and
 * it does it without a second prose size that the rest of the site would then have to earn. Weight
 * and colour are deliberately left alone too — 500 belongs to the two display steps only, and greying
 * a standfirst makes it recede exactly where it is supposed to lead.
 */
export function PostBody({ post }: { post: JournalPost }) {
  return (
    <section data-journal-body className="w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]">
      <div className="layout-grid">
        <p className="col-span-12 font-mono text-mono uppercase text-muted max-sm:text-mono-sm sm:col-span-3">
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        </p>

        <div className="col-span-12 mt-[3vw] sm:col-span-6 sm:col-start-4 sm:mt-0">
          <p className="text-body max-sm:text-body-sm">{post.excerpt}</p>

          <RuleDraw className="my-[3vw] text-edge max-sm:my-[8vw]" />

          {post.body.map((paragraph, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? 'text-body max-sm:text-body-sm'
                  : 'mt-[1.6vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm'
              }
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
