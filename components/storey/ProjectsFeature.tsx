import { ImageReveal } from '@/components/motion/ImageReveal'
import { RuleDraw } from '@/components/motion/RuleDraw'
import { Button } from '@/components/ui/Button'
import { PROJECTS_FEATURE } from '@/lib/content/home'

/**
 * White chapter: an asymmetric image pair, then the founder's note.
 *
 * The pair is the detail worth getting right. On the reference the two images are the same width
 * but **vertically offset and different heights** — the left one taller and starting higher, the
 * right one shorter and pushed down. Set them as an even two-up grid and the section immediately
 * reads like a stock template; the offset is what makes it editorial.
 *
 * Implemented as a deliberate `mt` on the second column plus differing aspect ratios, rather than
 * with absolute positioning, so it still stacks sensibly at mobile where the offset is dropped
 * entirely (two offset images in a single column is just uneven spacing).
 *
 * The mono labels beneath the note are set at -10% tracking, matching the reference's stamped
 * metadata treatment.
 */
export function ProjectsFeature() {
  const [left, right] = PROJECTS_FEATURE.pair
  const { note } = PROJECTS_FEATURE

  return (
    <section data-projects-feature className="w-full bg-primary py-[8vw] text-secondary max-sm:py-[16vw]">
      <div className="layout-grid gap-y-[8vw]">
        <div className="col-span-12 sm:col-span-6">
          <ImageReveal
            src={left.src}
            alt={left.alt}
            sizes="(min-width: 640px) 48vw, 92vw"
            data-testid="feature-image-1"
            className="aspect-[4/5] w-full"
          />
          <div className="mt-[1.4vw] max-sm:mt-[5vw]">
            <Button href={left.href} tone="dark">
              {left.label}
            </Button>
          </div>
        </div>

        {/* The offset: the right column starts 10vw lower and is a shallower crop. Dropped below
            `sm`, where it would only look like inconsistent spacing. */}
        <div className="col-span-12 sm:col-span-6 sm:mt-[10vw]">
          <ImageReveal
            src={right.src}
            alt={right.alt}
            sizes="(min-width: 640px) 48vw, 92vw"
            delayMs={120}
            data-testid="feature-image-2"
            className="aspect-[4/3] w-full"
          />
          <div className="mt-[1.4vw] max-sm:mt-[5vw]">
            <Button href={right.href} tone="dark">
              {right.label}
            </Button>
          </div>
        </div>
      </div>

      <div className="layout-grid mt-[14vw] max-sm:mt-[22vw]">
        <RuleDraw className="col-span-12 mb-[3vw] text-edge max-sm:mb-[8vw]" />

        <p className="col-span-12 font-mono text-mono uppercase text-muted max-sm:text-mono-sm sm:col-span-3">
          {note.eyebrow}
        </p>

        <div className="col-span-12 sm:col-span-6 sm:col-start-5">
          <p className="text-lead font-display max-sm:mt-[6vw] max-sm:text-lead-sm">{note.body}</p>
          <p className="mt-[2vw] text-label text-muted max-sm:mt-[6vw] max-sm:text-label-sm">{note.signature}</p>
        </div>

        <ul className="col-span-12 mt-[6vw] flex flex-wrap justify-between gap-y-[3vw] font-mono text-mono uppercase text-muted max-sm:mt-[12vw] max-sm:text-mono-sm">
          {note.monoLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
