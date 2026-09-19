'use client'
import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Keyboard, Parallax } from 'swiper/modules'
import 'swiper/css'
import { Lightbox } from '@/components/ui/Lightbox'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import { resolvePhotos } from './photo'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

// Matches `--gutter` at the measured 1440 width, so the space between slides is the same space as
// between two grid columns. A Swiper gap has to be a number of pixels, which is the one place on this
// page where a viewport-relative value cannot be used.
const SLIDE_GAP_PX = 20

// Square, outlined, mono-labelled. The site's `Button` is not used for these because it always
// carries the dot ornament and a solid tone, and two solid blocks beside a heading would compete with
// it — these are controls, not calls to action. The accessible name stays on `aria-label`, which is
// what the e2e suite selects by (`getByRole('button', { name: /next/i })`).
const NAV_BUTTON =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-none border border-primary/40 px-[1vw] ' +
  'font-mono text-mono uppercase text-primary transition-colors duration-150 ease-in-out ' +
  'hover:bg-primary hover:text-secondary ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ' +
  'max-sm:px-[3vw] max-sm:text-mono-sm'

/**
 * `#gallery` — navy chapter. A Swiper carousel over `project.gallery`, deliberately overflowing the
 * right-hand page margin (`!overflow-visible` plus a fractional `slidesPerView`) so the strip reads as
 * continuing off the edge of the page rather than as a boxed widget. That bleed is the reference's
 * device for a horizontal run of images.
 *
 * Only the three modules that are actually needed are imported (`Parallax`, `Keyboard`, `A11y`).
 * Prev/next are real `<button>` elements wired to the instance through `onSwiper`, deliberately not
 * Swiper's own `Navigation` module — its default markup is a pair of ARIA-role `<div>`s, and the e2e
 * spec selects `getByRole('button', { name: /next/i })`, which only a genuine `<button>` satisfies.
 *
 * `data-slide={i}` lands on the same element Swiper toggles `swiper-slide-active` on (`SwiperSlide`
 * spreads unknown props straight onto its root node), which is what the gallery-advances test reads.
 *
 * Photographs are resolved through `./photo` so the fixtures' generated navy-and-orange placeholders
 * are replaced with the real architectural photography — and the *same* resolved list is handed to the
 * `Lightbox`, or opening a slide would show a different image from the one that was clicked.
 */
export function GallerySwiper({ project }: Props) {
  const reduced = useReducedMotion()
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const gallery = useMemo(() => resolvePhotos(project.gallery), [project.gallery])

  if (gallery.length === 0) {
    return (
      <section
        id="gallery"
        data-gallery
        className={cn('w-full bg-secondary py-[8vw] text-primary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
      >
        <div className="layout-grid">
          <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
            A Closer Look
          </h2>
          <p className="col-span-12 mt-[3vw] text-body text-primary/70 max-sm:mt-[8vw] max-sm:text-body-sm sm:col-span-5">
            Photographs of this project will be published here soon.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="gallery"
      data-gallery
      className={cn('w-full overflow-hidden bg-secondary py-[8vw] text-primary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid items-end">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          A Closer Look
        </h2>
        <div className="col-span-12 mt-[3vw] flex gap-[0.8vw] max-sm:mt-[8vw] max-sm:gap-[3vw] sm:col-span-3 sm:col-start-10 sm:mt-0 sm:justify-end">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => swiperRef.current?.slidePrev()}
            className={NAV_BUTTON}
          >
            Prev
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => swiperRef.current?.slideNext()}
            className={NAV_BUTTON}
          >
            Next
          </button>
        </div>
      </div>

      {/* `px-[var(--margin)]` rather than `.layout-grid`: the strip has to start on the same optical
          edge as every heading above it while being free to run past the opposite margin. */}
      <div className="mt-[6vw] pl-[var(--margin)] max-sm:mt-[12vw]">
        <Swiper
          data-cursor="drag"
          modules={[Parallax, Keyboard, A11y]}
          parallax
          keyboard={{ enabled: true }}
          speed={reduced ? 0 : 500}
          spaceBetween={SLIDE_GAP_PX}
          slidesPerView={1.15}
          breakpoints={{ 768: { slidesPerView: 2.2 }, 1024: { slidesPerView: 2.6 } }}
          onSwiper={(instance) => {
            swiperRef.current = instance
          }}
          className="!overflow-visible"
        >
          {gallery.map((image, i) => (
            <SwiperSlide key={image.url} data-slide={i} className="!h-auto">
              <button
                type="button"
                onClick={() => setZoomIndex(i)}
                aria-label={`Open image ${i + 1}: ${image.alt}`}
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  data-swiper-parallax="-20%"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {zoomIndex !== null && (
        <Lightbox images={gallery} index={zoomIndex} onClose={() => setZoomIndex(null)} />
      )}
    </section>
  )
}
