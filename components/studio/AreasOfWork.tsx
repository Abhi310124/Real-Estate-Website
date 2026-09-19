import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { AREAS_OF_WORK } from '@/lib/content/studio'

/**
 * Black chapter: the four lines of work, each heading a column of two plates.
 *
 * ## `py-[30%]`, and why a percentage rather than a `vw`
 *
 * The reference sets this one band's padding as a percentage, which resolves against the containing
 * block's WIDTH for the block axis as well as the inline one — so 30% of 1440 is 432px top and bottom,
 * and the band carries 864px of air around roughly 900px of content. It is the most generously spaced
 * section on the route by a factor of five, and that is the point: it is the last chapter before the
 * page turns to the journal and the form, so it reads as a held breath rather than as another list.
 * A `vw` value would be numerically identical here and is not used, because `%` is what keeps it
 * tracking a future container narrower than the viewport.
 *
 * ## Four labelled columns, eight plates
 *
 * Each of the four areas takes three columns and stacks two landscape plates under its label and copy.
 * 5:4 in a 23.3vw column is 268px a tile, which with the 58px between them fills the ~595px the
 * reference leaves for its mosaic once the 864px of padding and the heading row are accounted for —
 * portrait tiles here overshoot the band by half a screen. Small landscape tiles are also what makes
 * this read as an inventory rather than as four more feature plates.
 *
 * Four columns of three is the one arrangement on this route that fills all twelve. Everywhere else a
 * column is deliberately left empty, and that contrast is doing the work.
 *
 * ## The labels are not captions on the photographs
 *
 * There is no photograph of surveyed land, and none of an apartment building, anywhere in
 * `public/photography/` — the inventory is finished low-rise residential work, and
 * `components/project/photo.ts` records which frames are usable at all. So the label names the area of
 * work and the `alt` names the photograph, and neither is allowed to describe the other. Captioning a
 * villa exterior as a plot would assert something untrue to a screen reader, which is worse than a
 * photograph that is merely adjacent to its heading. The honest fix is photography of BKR INFRA's own
 * work, not a better-chosen stand-in.
 *
 * ## Grading on a black band
 *
 * `saturate-[1.12]` goes on the `<Image>` through `[&_img]:`, never on the frame. On a dark chapter the
 * frame also contains `ImageReveal`'s black uncovering scrim, and a filter set on the frame grades the
 * scrim too — harmless for saturation, and wrong the moment a call site reaches for opacity or
 * greyscale. Keeping the grade on the image means no call site has to know which kind it is passing.
 */
export function AreasOfWork() {
  return (
    <section data-studio-areas className="w-full bg-secondary py-[30%] text-primary">
      <div className="layout-grid items-start">
        <p className="col-span-12 font-mono text-mono uppercase text-primary/60 max-sm:text-mono-sm">
          {AREAS_OF_WORK.eyebrow}
        </p>

        <h2 className="col-span-12 mt-[2vw] text-display-lg font-display max-sm:mt-[6vw] max-sm:text-display-sm-lg sm:col-span-7">
          {AREAS_OF_WORK.heading}
        </h2>

        <SplitLines
          text={AREAS_OF_WORK.intro}
          className="col-span-12 mt-[2.5vw] text-body max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-3 sm:col-start-10"
        />
      </div>

      <ul className="layout-grid mt-[10vw] gap-y-[14vw] max-sm:mt-[14vw]">
        {AREAS_OF_WORK.areas.map((area) => (
          <li key={area.label} className="col-span-12 sm:col-span-3">
            {/* The measured dark-chapter rule. #2B2B2B reads as a line drawn on black, where a
                translucent white would change value with whatever is painted behind it. */}
            <div className="border-t border-[#2B2B2B] pt-[var(--gutter)]">
              <span aria-hidden="true" className="block font-mono text-mono text-primary/60 max-sm:text-mono-sm">
                {area.n}
              </span>
              <h3 className="mt-[1.6vw] text-lead max-sm:mt-[5vw] max-sm:text-lead-sm">{area.label}</h3>
              <SplitLines
                text={area.copy}
                className="mt-[1.6vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm"
              />
            </div>

            <div className="mt-[3vw] max-sm:mt-[8vw]">
              {area.images.map((image, j) => (
                <ImageReveal
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  // 30vw: a 23.3vw column whose photograph renders at 1.2x inside the frame.
                  sizes="(min-width: 640px) 30vw, 110vw"
                  data-testid={`studio-area-image-${area.n}-${j + 1}`}
                  className={`aspect-[5/4] w-full [&_img]:saturate-[1.12] ${
                    j === 0 ? '' : 'mt-[4vw] max-sm:mt-[8vw]'
                  }`}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
