'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import { Rise } from '@/components/motion/Rise'
import { Lightbox } from '@/components/ui/Lightbox'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import { resolvePhotos } from './photo'
import type { Img, Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#updates` — `project.constructionUpdates`, sorted newest first.
 *
 * The fixtures store updates chronologically ascending (oldest first, matching how a site team appends
 * entries as work actually progresses), so this sorts a *copy*. Sorting `project.constructionUpdates`
 * in place would mutate data owned by the page's server-rendered `project` object, corrupting it for
 * any other component reading the same prop during this render.
 *
 * Laid out as term-and-detail rows — the date in the left columns, title and note in the middle,
 * rounded thumbnails to the right — each opened by a hairline: the same "label left, detail right"
 * anatomy as the page's Key figures and Location blocks.
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
      className={cn('pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}
    >
      <div className="container-page">
        <Rise as="h2" className="font-heading text-h2 text-secondary max-sm:text-h2-sm">
          Progress on site
        </Rise>
      </div>

      {updates.length === 0 ? (
        <p className="container-page mt-8 text-body text-muted">
          Construction has not yet begun — the first site update will be posted here once work starts.
        </p>
      ) : (
        <ol className="container-page mt-10">
          {updates.map((update, i) => {
            const images = resolvePhotos(update.images, photoOffsets[i])

            return (
              <li key={update.date + update.title}>
                <div className="grid grid-cols-12 gap-x-[var(--gutter)] gap-y-5 border-t border-hairline py-10">
                  <Reveal delay={i * 0.06} className="col-span-12 sm:col-span-3">
                    <time dateTime={update.date} className="text-small text-navySoft">
                      {new Date(update.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  </Reveal>

                  <Reveal delay={i * 0.06 + 0.06} className="col-span-12 sm:col-span-5 sm:col-start-4">
                    <h3 className="font-heading text-h4 text-secondary max-sm:text-h4-sm">{update.title}</h3>
                    {update.note && (
                      <p className="mt-3 text-body text-muted">
                        {update.note}
                      </p>
                    )}
                  </Reveal>

                  {images.length > 0 && (
                    <div className="col-span-12 flex gap-3 sm:col-span-4 sm:col-start-9">
                      {images.map((image, imageIndex) => (
                        <button
                          key={image.url}
                          type="button"
                          data-cursor="zoom"
                          onClick={() => setZoom({ images, index: imageIndex })}
                          aria-label={`Open photo: ${image.alt}`}
                          className="group relative block aspect-[4/3] w-full shrink overflow-clip rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                        >
                          <Image
                            src={image.url}
                            alt={image.alt}
                            fill
                            sizes="(min-width: 640px) 16vw, 45vw"
                            className="object-cover transition-transform duration-1000 ease-zoom group-hover:scale-110 motion-reduce:transition-none"
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
