import { ImageReveal } from '@/components/motion/ImageReveal'
import { Button } from '@/components/ui/Button'
import { formatPostDate } from './postDate'
import type { JournalPost } from '@/lib/data/types'

/**
 * The newest post, given the whole twelve-column width: a label at the top of the left half, the
 * title and its control at the bottom of it, and one photograph filling the right half.
 *
 * ## The empty half is the composition
 *
 * The left column is `sm:aspect-[14/12]` — the *same* ratio as the photograph opposite it — with
 * `justify-between` pushing its two items to the top and bottom edges of that box. So the eyebrow
 * sits level with the top of the frame, the title sits level with its bottom, and 400-odd pixels of
 * white space open up between them. That gap is the entire difference between a featured row and a
 * wide card: the row is 591.4px tall carrying three short runs of text, which only reads as
 * deliberate if the text is pinned to the frame's own edges rather than stacked under the label.
 *
 * Giving the text column a definite aspect rather than `h-full` matters below `sm` too, where the
 * ratio is dropped: a 14/12 box at `col-span-12` would be 84vw of empty phone screen above the
 * title. The mobile stack is eyebrow, title, control, then the photograph, at natural height.
 *
 * ## The title is prose, not a headline
 *
 * 23.04px / weight 400 / leading 1.2 in a 32.1vw measure, which wraps a 49-character title to two
 * lines — identical treatment to `components/journal/JournalCard.tsx`, and for the same reason. The
 * instinct on a "featured" slot is to promote its title to a display step; doing that would make
 * this the only card on the page announcing itself at heading scale, and the featured treatment is
 * already carried by the width, the label and the size of the frame. The measure is doing the work
 * the type size would otherwise be asked to do.
 *
 * The photograph is not itself a link. The reference wraps its frame in a second anchor to the same
 * post, so the row carries two identical "Read" targets; one control with a post-naming accessible
 * name is the better trade here, since a screen reader's link list otherwise gets the same
 * destination twice in a row with the same text.
 */
export function FeaturedRead({ post }: { post: JournalPost }) {
  return (
    // 20vw (288px) is the reference's own approach gap from the title block, and it is the largest
    // single margin on the route. The featured row has to arrive as a new chapter rather than as the
    // first item of a list, and that separation is what does it.
    <div data-testid="journal-card-1" className="layout-grid mt-[20vw]">
      <div className="col-span-12 max-sm:mb-[5vw] sm:col-span-6">
        <div className="flex w-full flex-col justify-between sm:aspect-[14/12]">
          <p className="font-mono text-mono uppercase text-muted max-sm:text-mono-sm">Featured read</p>

          <div className="max-sm:mt-[8vw]">
            <h2 className="max-w-[32.1vw] text-body max-sm:max-w-none max-sm:text-body-sm">
              {post.title}
            </h2>
            <p className="mt-[1.4vw] font-mono text-mono uppercase text-muted max-sm:mt-[4vw] max-sm:text-mono-sm">
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            </p>
            <div className="mt-[1.6vw] max-sm:mt-[5vw]">
              <Button href={`/journal/${post.slug}`} tone="dark" aria-label={`Read ${post.title}`}>
                Read
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 sm:col-span-6">
        <ImageReveal
          src={post.coverImage.url}
          alt={post.coverImage.alt}
          // Quoted against the frame, and the photograph inside it renders at 1.2x — so a 47.9vw
          // column asks for ~58vw of pixels rather than its own width.
          sizes="(min-width: 640px) 58vw, 110vw"
          data-testid="journal-image-1"
          // The grade sits on the frame because `ImageReveal` exposes no class for its `<Image>`. A
          // CSS filter covers the whole subtree and the only other thing in the frame is the
          // uncovering scrim, which is pure black and unmoved by a saturation multiplier. Move it to
          // the image and drop it here if that prop lands; keeping both would grade it twice.
          className="aspect-[14/12] w-full saturate-[1.12]"
        />
      </div>
    </div>
  )
}
