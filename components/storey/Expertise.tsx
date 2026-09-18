import { ImageReveal } from '@/components/motion/ImageReveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { EXPERTISE } from '@/lib/content/home'

/**
 * White chapter: three expertise rows, each with a giant ghosted numeral.
 *
 * The row anatomy, measured off the reference:
 *   col 1–4   title, at `lead` size (2.2vw), top-aligned
 *   col 1–3   a huge `#E6E6E6` numeral, ~10vw, sitting BELOW the title with deep space above it
 *   col 7–10  a small image (roughly a third of the row width) and the description
 *   full      a hairline across the top of every row
 *
 * Two things carry this section, and both are about restraint:
 *
 * 1. **The rows are mostly empty.** Each is ~540px tall with content only in its top third. That
 *    vertical emptiness is the design; filling it would make this an ordinary feature grid.
 * 2. **The numeral is `hairline` (#E6E6E6), not muted grey.** It is barely there — a watermark
 *    rather than a label. At `muted` it would compete with the title for attention.
 *
 * The numeral is `aria-hidden`: it is ordinal decoration, and a screen reader announcing "one"
 * before each heading adds nothing the list order does not already convey.
 */
export function Expertise() {
  return (
    <section data-expertise className="w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]">
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          {EXPERTISE.title}
        </h2>
      </div>

      <ul className="mt-[6vw] max-sm:mt-[14vw]">
        {EXPERTISE.items.map((item, i) => (
          <li key={item.n}>
            <div className="layout-grid">
              <RuleDraw delayMs={i * 90} className="col-span-12 text-edge" />
            </div>

            <div className="layout-grid min-h-[30vw] pb-[6vw] pt-[2vw] max-sm:min-h-0 max-sm:pb-[12vw] max-sm:pt-[6vw]">
              <div className="col-span-12 sm:col-span-4">
                <h3 className="text-lead font-display max-sm:text-lead-sm">{item.title}</h3>
                <span
                  aria-hidden="true"
                  className="mt-[6vw] block leading-none text-hairline max-sm:mt-[8vw]"
                  style={{ fontSize: '11vw', fontWeight: 500 }}
                >
                  {item.n}
                </span>
              </div>

              {/* Copy first, image below with a deep gap — matching the reference's row anatomy.
                  Image-then-caption is the instinctive order and it reads as a feature card; copy
                  first, with the photograph arriving further down the row, is what makes it read as
                  an editorial spread. */}
              <div className="col-span-12 mt-[4vw] sm:col-span-4 sm:col-start-7 sm:mt-0">
                <p className="text-body max-sm:text-body-sm">{item.copy}</p>
                <ImageReveal
                  src={item.image}
                  alt={item.alt}
                  sizes="(min-width: 640px) 33vw, 92vw"
                  delayMs={i * 90}
                  data-testid={`expertise-image-${i + 1}`}
                  className="mt-[8vw] aspect-[3/2] w-full max-sm:mt-[8vw]"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
