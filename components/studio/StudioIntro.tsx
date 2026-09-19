import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { STUDIO_INTRO } from '@/lib/content/studio'

/**
 * Cream chapter: the statement the route is built on, then five plates.
 *
 * ## The heading and the prose are a 7 + 3 + 3 row, not a stack
 *
 * The heading takes seven columns at the 100.8px display step; columns 7-9 and 10-12 carry the two
 * prose blocks at 23.3vw each. The measure is what produces the line count — four short lines per
 * column — and it is the same fix as the split: `SplitLines` masks whatever the browser laid out, so
 * the same 244 characters given the full twelve columns would be masked as three wide banners and the
 * chapter would read as a caption under a headline. The second column runs 0.101s behind the first,
 * because they are two blocks rather than one group with a shared stagger.
 *
 * `items-start` because the prose pair is taller than the two-line heading; aligning the row on its
 * end lifts the prose above the heading's first line and reverses which of the two reads as the
 * subject.
 *
 * ## The five plates are a 6 + 5 row over a three-up row
 *
 * The lead plate is six columns at 4:5 (690 x 862px at 1440) and its partner five columns at 4:5
 * dropped 10vw, so the pair is read off its bottom edges while the tops hold the grid. Then three
 * four-column plates at 3:4 flush across the whole width. Column 7 is deliberately empty on the first
 * row: a twelve-column grid earns nothing if every row fills all twelve, and the gap is what keeps
 * the lead plate reading as the lead.
 *
 * Every frame bleeds — `ImageReveal` renders its photograph at `scale(1.2)` about a bottom origin
 * inside the clip and scrubs 0.2 of the frame's height downward into that overhang — so `sizes` is
 * quoted at roughly 1.2x the column it occupies rather than at the column itself. A hint quoted
 * against the frame asks the browser for a candidate 20% too small for what actually renders.
 *
 * `saturate-[1.12]` goes on the `<Image>` via `[&_img]:`, not on the frame: a filter on the frame also
 * grades the black uncovering scrim, which is harmless for saturation and wrong the moment the grade
 * involves opacity or greyscale. Keeping it on the image means the call site never has to know which
 * kind of filter it is passing.
 */

/** Positional, because it is composition rather than metadata about any one photograph. */
const ROW_TWO_ASPECT = 'aspect-[3/4]'

export function StudioIntro() {
  const [lead, partner, ...row] = STUDIO_INTRO.images

  return (
    <section data-studio-intro className="w-full bg-primary py-[var(--gutter)] text-secondary max-sm:py-[10vw]">
      <div className="layout-grid items-start">
        <Eyebrow className="col-span-12">{STUDIO_INTRO.eyebrow}</Eyebrow>

        <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-7">
          {STUDIO_INTRO.heading}
        </h2>

        {/* 2.5vw drops the first line clear of the heading's cap line rather than aligning the two
            columns' tops. */}
        <SplitLines
          text={STUDIO_INTRO.copy[0]}
          className="col-span-12 mt-[2.5vw] text-body text-muted max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-7"
        />
        <SplitLines
          text={STUDIO_INTRO.copy[1]}
          delay={0.101}
          className="col-span-12 mt-[2.5vw] text-body text-muted max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>

      {/* `gap-y` rather than a margin on the second frame: at `sm` the pair shares one grid row so
          the row gap never resolves, and below `sm` it is the only thing separating the stack. A
          margin would have to be undone at the breakpoint in both directions. */}
      <div className="layout-grid mt-[10vw] gap-y-[8vw] max-sm:mt-[14vw]">
        <ImageReveal
          src={lead.src}
          alt={lead.alt}
          sizes="(min-width: 640px) 58vw, 110vw"
          data-testid="studio-intro-image-1"
          className="col-span-12 aspect-[4/5] w-full [&_img]:saturate-[1.12] sm:col-span-6"
        />
        <ImageReveal
          src={partner.src}
          alt={partner.alt}
          sizes="(min-width: 640px) 48vw, 110vw"
          data-testid="studio-intro-image-2"
          className="col-span-12 aspect-[4/5] w-full [&_img]:saturate-[1.12] sm:col-span-5 sm:col-start-8 sm:mt-[10vw]"
        />
      </div>

      <div className="layout-grid mt-[10vw] gap-y-[8vw] max-sm:mt-[14vw]">
        {row.map((image, i) => (
          <ImageReveal
            key={image.src}
            src={image.src}
            alt={image.alt}
            sizes="(min-width: 640px) 38vw, 110vw"
            data-testid={`studio-intro-image-${i + 3}`}
            className={`col-span-12 w-full [&_img]:saturate-[1.12] sm:col-span-4 ${ROW_TWO_ASPECT}`}
          />
        ))}
      </div>
    </section>
  )
}
