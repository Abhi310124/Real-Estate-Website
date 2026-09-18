import Image from 'next/image'
import { TESTIMONIAL } from '@/lib/content/home'

/**
 * Black chapter: one quote, set large, with a photograph straddling the section's bottom edge.
 *
 * The straddle is the reference's recurring trick — a tall image container pinned to the bottom
 * with `translate-y-1/2`, so it bleeds across the seam into the white chapter below. It is why the
 * reference's chapters feel stitched together rather than stacked.
 *
 * The quote uses `<blockquote>` + `<cite>` rather than a styled `<p>`: it is an actual quotation,
 * and the semantics cost nothing.
 *
 * NOTE: the quote itself is placeholder copy pending a real client reference — see the comment in
 * `lib/content/home.ts`. It is attributed to initials and a location rather than an invented full
 * name, so it cannot be mistaken for a verified testimonial.
 */
export function Testimonial() {
  return (
    <section
      data-testimonial
      className="relative w-full bg-secondary pb-[26vw] pt-[10vw] text-primary max-sm:pb-[46vw] max-sm:pt-[18vw]"
    >
      <div className="layout-grid relative z-10">
        <blockquote className="col-span-12 sm:col-span-9">
          <p className="text-display-lg font-display max-sm:text-display-sm-lg">{TESTIMONIAL.quote}</p>
          <cite className="mt-[3vw] block text-label not-italic text-primary/60 max-sm:mt-[8vw] max-sm:text-label-sm">
            {TESTIMONIAL.attribution}
          </cite>
        </blockquote>
      </div>

      {/* Straddles the seam: half of this sits in the white chapter below. `w-1/2` on desktop so it
          reads as an inset plate rather than a full-bleed band. */}
      <div className="layout-grid absolute inset-x-0 bottom-0 translate-y-1/2">
        <div className="relative col-span-12 aspect-[16/9] sm:col-span-6 sm:col-start-4">
          <Image
            src={TESTIMONIAL.image}
            alt={TESTIMONIAL.imageAlt}
            fill
            sizes="(min-width: 640px) 48vw, 92vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
