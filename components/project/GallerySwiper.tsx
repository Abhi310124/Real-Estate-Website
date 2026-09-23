'use client'
import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperInstance } from 'swiper'
import { A11y, EffectCreative, Keyboard } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-creative'
import { Lightbox } from '@/components/ui/Lightbox'
import { Rise } from '@/components/motion/Rise'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import { resolvePhotos } from './photo'
import type { Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#gallery` — as the layout sets it: one large frame across eight columns with round previous/next
 * controls riding its left and right edges, and the gallery's thumbnails in a small grid at the foot
 * of the remaining four columns. Choosing a thumbnail brings that photograph up; choosing the large
 * frame opens it full-screen.
 *
 * Slides change in 3D rather than sliding flat: the outgoing photograph swings away about its edge and
 * sinks back as the incoming one comes forward (Swiper's creative effect), which keeps a strip of
 * photographs reading as physical prints being turned over. Reduced motion changes slides instantly.
 *
 * `.swiper-slide-active` and the "Next slide" button name are what the e2e suite drives.
 */
const ARROW =
  'absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-primary text-accentInk ' +
  'transition-colors duration-300 hover:bg-accent hover:text-secondary ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary'

export function GallerySwiper({ project }: Props) {
  const reduced = useReducedMotion()
  const swiperRef = useRef<SwiperInstance | null>(null)
  const [zoomIndex, setZoomIndex] = useState<number | null>(null)
  const [active, setActive] = useState(0)
  const gallery = useMemo(() => resolvePhotos(project.gallery), [project.gallery])

  if (gallery.length === 0) {
    return (
      <section id="gallery" data-gallery className={cn('container-page pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
        <h2 className="font-heading text-h2 text-secondary max-sm:text-h2-sm">Gallery</h2>
        <p className="mt-8 text-body text-muted">Photographs of this project will be published here soon.</p>
      </section>
    )
  }

  return (
    <section id="gallery" data-gallery className={cn('pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}>
      <div className="container-page">
        <Rise as="h2" className="font-heading text-h2 text-secondary max-sm:text-h2-sm">
          Gallery
        </Rise>
      </div>

      <div className="layout-grid mt-10 items-end gap-y-6">
        <div className="relative col-span-12 lg:col-span-8">
          <Swiper
            modules={[EffectCreative, Keyboard, A11y]}
            effect="creative"
            creativeEffect={{
              prev: { translate: ['-18%', 0, -380], rotate: [0, 28, 0], opacity: 0.6 },
              next: { translate: ['100%', 0, 0] },
            }}
            keyboard={{ enabled: true }}
            speed={reduced ? 0 : 900}
            loop={gallery.length > 2}
            onSwiper={(instance) => {
              swiperRef.current = instance
            }}
            onSlideChange={(instance) => setActive(instance.realIndex)}
            className="overflow-clip rounded-card"
          >
            {gallery.map((image, i) => (
              <SwiperSlide key={image.url} data-slide={i}>
                <button
                  type="button"
                  onClick={() => setZoomIndex(i)}
                  aria-label={`Open image ${i + 1} full screen: ${image.alt}`}
                  className="relative block aspect-[926/574] w-full overflow-clip rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary"
                >
                  <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 64vw, 92vw" className="object-cover" />
                </button>
              </SwiperSlide>
            ))}
          </Swiper>

          <button type="button" aria-label="Previous slide" onClick={() => swiperRef.current?.slidePrev()} className={cn(ARROW, '-left-6 max-sm:left-2')}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" aria-label="Next slide" onClick={() => swiperRef.current?.slideNext()} className={cn(ARROW, '-right-6 max-sm:right-2')}>
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <ul className="col-span-12 grid grid-cols-3 gap-4 lg:col-span-4 lg:pl-6" aria-label="Choose a photograph">
          {gallery.slice(0, 6).map((image, i) => (
            <li key={image.url}>
              <button
                type="button"
                aria-label={`Show image ${i + 1}: ${image.alt}`}
                aria-pressed={active === i}
                onClick={() => (gallery.length > 2 ? swiperRef.current?.slideToLoop(i) : swiperRef.current?.slideTo(i))}
                className={cn(
                  'relative block aspect-[110/76] w-full overflow-clip rounded-[4px] transition-[box-shadow,opacity] duration-300',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                  active === i ? 'shadow-[0_0_0_2px_theme(colors.accent)]' : 'opacity-70 hover:opacity-100'
                )}
              >
                <Image src={image.url} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {zoomIndex !== null && <Lightbox images={gallery} index={zoomIndex} onClose={() => setZoomIndex(null)} />}
    </section>
  )
}
