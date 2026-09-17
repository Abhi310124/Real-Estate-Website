'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, Keyboard, Parallax } from 'swiper/modules'
import 'swiper/css'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Lightbox } from '@/components/ui/Lightbox'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#gallery` (navy) — Swiper carousel over `project.gallery`. Only the three modules the
 * brief names are imported (`Parallax`, `Keyboard`, `A11y`); prev/next are real `<button>`
 * elements wired to the swiper instance through `onSwiper`, deliberately not Swiper's own
 * `Navigation` module — its default markup is a pair of ARIA-role `<div>`s, and the e2e
 * spec selects `getByRole('button', { name: /next/i })`, which only a genuine `<button>`
 * satisfies. `data-slide={i}` lands on the same element Swiper toggles
 * `swiper-slide-active` on (confirmed against `swiper-react`'s source: `SwiperSlide`
 * spreads unknown props straight onto its root node), which is what the gallery-advances
 * test reads.
 */
export function GallerySwiper({ project }: Props) {
  const reduced = useReducedMotion()
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)

  if (project.gallery.length === 0) {
    return (
      <section id="gallery" data-gallery className="scroll-mt-[180px] bg-navy-800 py-20 text-white sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <Eyebrow className="text-champagne">Gallery</Eyebrow>
          <h2 className="mt-3 font-display-expanded text-display-md text-white">Gallery</h2>
          <p className="mt-8 text-body text-white/80">Photos of this project will be published here soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="gallery" data-gallery className="scroll-mt-[180px] bg-navy-800 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow className="text-champagne">Gallery</Eyebrow>
            <h2 className="mt-3 font-display-expanded text-display-md text-white">A Closer Look</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => swiperRef.current?.slidePrev()}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => swiperRef.current?.slideNext()}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        <Swiper
          modules={[Parallax, Keyboard, A11y]}
          parallax
          keyboard={{ enabled: true }}
          speed={reduced ? 0 : 500}
          spaceBetween={24}
          slidesPerView={1.15}
          breakpoints={{ 768: { slidesPerView: 2.2 }, 1024: { slidesPerView: 2.6 } }}
          onSwiper={(instance) => {
            swiperRef.current = instance
          }}
          className="mt-10 !overflow-visible"
        >
          {project.gallery.map((image, i) => (
            <SwiperSlide key={image.url} data-slide={i} className="!h-auto">
              <button
                type="button"
                onClick={() => setZoomIndex(i)}
                aria-label={`Open image ${i + 1}: ${image.alt}`}
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
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
        <Lightbox images={project.gallery} index={zoomIndex} onClose={() => setZoomIndex(null)} />
      )}
    </section>
  )
}
