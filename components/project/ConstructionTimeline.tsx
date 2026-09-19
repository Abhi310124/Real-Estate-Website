'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { Lightbox } from '@/components/ui/Lightbox'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import { resolvePhotos } from './photo'
import type { Img, Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#updates` — white chapter. `project.constructionUpdates`, sorted newest first.
 *
 * The fixtures store updates chronologically ascending (oldest first, matching how a site team appends
 * entries as work actually progresses), so this sorts a *copy*. Sorting `project.constructionUpdates`
 * in place would mutate data owned by the page's server-rendered `project` object, corrupting it for
 * any other component reading the same prop during this render.
 *
 * Laid out as term-and-detail rows on the grid — mono date in the left columns, title and note in the
 * middle, thumbnails to the right — each opened by a drawn hairline. That is the same anatomy as the
 * home page's `Expertise` rows, and it replaces the previous vertical rail with round dots: the grid
 * already communicates sequence, and a rail plus dots was a second, redundant device for it.
 *
 * `bkr-skyline-residences` (pre-launch) ships `constructionUpdates: []`. That is a real, expected
 * project state, not a bug, so this renders the heading plus one honest status line rather than an
 * empty, unlabelled list.
 *
 * `Reveal` sits INSIDE the `<li>` — it renders a `<div>`, and wrapping the `<li>` would make that div
 * a direct child of `<ol>`, which axe flags as both `list` and `listitem`.
 */
export function ConstructionTimeline({ project }: Props) {
  const [zoom, setZoom] = useState<{ images: Img[]; index: number } | null>(null)
  const updates = [...project.constructionUpdates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Running offsets into the photography pool, so thumbnails on successive updates spread across it
  // instead of clustering — `resolvePhotos` only guarantees distinctness *within* one list it is
  // handed, so each update needs to start where the previous one left off.
  //
  // Computed up front rather than with a `let` incremented inside the render's `.map()`. Mutating a
  // variable while rendering is a React rule violation (the render must be pure — it can run twice
  // in development, and under concurrent rendering it can be interrupted and restarted, either of
  // which leaves the counter wrong).
  const photoOffsets = updates.map((_, i) =>
    updates.slice(0, i).reduce((total, previous) => total + previous.images.length, 0)
  )

  return (
    <section
      id="updates"
      data-updates
      className={cn('w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid">
        <h2 className="col-span-12 text-display-lg font-display max-sm:text-display-sm-lg sm:col-span-8">
          Progress on Site
        </h2>
      </div>

      {updates.length === 0 ? (
        <div className="layout-grid mt-[4vw] max-sm:mt-[10vw]">
          <p className="col-span-12 text-body text-muted max-sm:text-body-sm sm:col-span-5">
            Construction has not yet begun — the first site update will be posted here once work starts.
          </p>
        </div>
      ) : (
        <ol className="mt-[6vw] max-sm:mt-[12vw]">
          {updates.map((update, i) => {
            const images = resolvePhotos(update.images, photoOffsets[i])

            return (
              <li key={update.date + update.title}>
                <div className="layout-grid">
                  <RuleDraw delayMs={i * 90} className="col-span-12 text-edge" />
                </div>

                <div className="layout-grid pb-[5vw] pt-[2vw] max-sm:pb-[12vw] max-sm:pt-[6vw]">
                  <Reveal delay={i * 0.06} className="col-span-12 sm:col-span-3">
                    <time
                      dateTime={update.date}
                      className="font-mono text-mono uppercase text-muted max-sm:text-mono-sm"
                    >
                      {new Date(update.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </Reveal>

                  <Reveal delay={i * 0.06 + 0.06} className="col-span-12 mt-[3vw] max-sm:mt-[6vw] sm:col-span-4 sm:col-start-5 sm:mt-0">
                    <h3 className="text-lead max-sm:text-lead-sm">{update.title}</h3>
                    {update.note && (
                      <p className="mt-[1vw] text-body text-muted max-sm:mt-[4vw] max-sm:text-body-sm">
                        {update.note}
                      </p>
                    )}
                  </Reveal>

                  {images.length > 0 && (
                    <div className="col-span-12 mt-[3vw] flex gap-[0.8vw] max-sm:mt-[6vw] max-sm:gap-[3vw] sm:col-span-3 sm:col-start-10 sm:mt-0">
                      {images.map((image, imageIndex) => (
                        <button
                          key={image.url}
                          type="button"
                          data-cursor="zoom"
                          onClick={() => setZoom({ images, index: imageIndex })}
                          aria-label={`Open photo: ${image.alt}`}
                          className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                        >
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            sizes="(min-width: 640px) 24vw, 92vw"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {zoom && <Lightbox images={zoom.images} index={zoom.index} onClose={() => setZoom(null)} />}
    </section>
  )
}
