'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Lightbox } from '@/components/ui/Lightbox'
import type { Img, Project } from '@/lib/data/types'

type Props = { project: Project }

/**
 * `#updates` (ivory) — `project.constructionUpdates`, sorted newest first for display.
 * The fixtures store updates chronologically ascending (oldest first, matching how a
 * site team appends entries over time as construction actually progresses), so this
 * sorts a *copy* — `[...project.constructionUpdates].sort(...)` — descending by date.
 * Sorting `project.constructionUpdates` in place would mutate data owned by the page's
 * server-rendered `project` object, corrupting it for any other component that reads
 * the same prop during this render.
 *
 * `bkr-skyline-residences` (pre-launch) ships `constructionUpdates: []`. That is a real,
 * expected project state, not a bug, so this renders the heading plus one honest status
 * line rather than an empty, unlabelled list.
 */
export function ConstructionTimeline({ project }: Props) {
  const [zoom, setZoom] = useState<{ images: Img[]; index: number } | null>(null)
  const updates = [...project.constructionUpdates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <section id="updates" data-updates className="scroll-mt-[180px] bg-ivory py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <Eyebrow className="text-orange">Construction Updates</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-navy-800">Progress on Site</h2>

        {updates.length === 0 ? (
          <p className="mt-8 text-body text-navy-700">
            Construction has not yet begun — the first site update will be posted here once work starts.
          </p>
        ) : (
          <ol className="mt-10 space-y-10 border-l border-navy-800/10 pl-8">
            {updates.map((update, i) => (
              <Reveal key={update.date + update.title} delay={i * 0.06}>
                <li className="relative">
                  <span aria-hidden="true" className="absolute -left-[33px] top-1.5 h-2.5 w-2.5 rounded-full bg-orange" />
                  <time dateTime={update.date} className="text-sm font-semibold uppercase tracking-wide text-navy-700/70">
                    {new Date(update.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                  <h3 className="mt-1 font-semibold text-navy-800">{update.title}</h3>
                  {update.note && <p className="mt-2 text-body text-navy-700">{update.note}</p>}
                  {update.images.length > 0 && (
                    <div className="mt-4 flex gap-3">
                      {update.images.map((image, imageIndex) => (
                        <button
                          key={image.url}
                          type="button"
                          onClick={() => setZoom({ images: update.images, index: imageIndex })}
                          aria-label={`Open photo: ${image.alt}`}
                          className="relative block h-24 w-32 shrink-0 overflow-hidden rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
                        >
                          <Image src={image.url} alt={image.alt} fill sizes="128px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        )}
      </div>

      {zoom && <Lightbox images={zoom.images} index={zoom.index} onClose={() => setZoom(null)} />}
    </section>
  )
}
