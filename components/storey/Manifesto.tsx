import { ImageRing3D, type RingItem } from '@/components/motion/ImageRing3D'
import { MANIFESTO, RING_IMAGES } from '@/lib/content/home'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * Black manifesto chapter carrying the 3D image ring — the reference's signature moment.
 *
 * What the ring actually looks like, having compared against the reference rather than assumed:
 * the images are **not** upright thumbnails on a tilted carousel. They are steeply foreshortened
 * parallelograms scattered widely across the black field, each inheriting its cell's rotation, and
 * greyed to 0.4 so they read as a receding constellation rather than as a gallery. A first pass
 * here counter-rotated them upright, which looked tidier and was wrong.
 *
 * Positioning: the stage is centred at 45% of the section, not lower. At 55% the ring's radius
 * (44vw) put both arcs outside the viewport and only two images survived — the visible spread comes
 * from catching the upper arc while the lower one falls away off-screen.
 *
 * `overflow-hidden` sits on the SECTION, two levels above the 3D stage. `preserve-3d` is destroyed
 * by any ancestor that establishes a containing block, so putting the clip on the stage's own parent
 * would flatten the ring — but the section is far enough up to be safe, and without a clip the
 * 114.4vw stage forces a document-level horizontal scrollbar.
 */
export function Manifesto({ projects }: { projects: ProjectSummary[] }) {
  const items: RingItem[] = RING_IMAGES.map((img, i) => {
    const project = projects[i % Math.max(projects.length, 1)]
    return {
      src: img.src,
      alt: img.alt,
      href: project ? `/projects/${project.slug}` : '/projects',
      label: project ? `View ${project.title}` : 'View projects',
    }
  })

  return (
    <section
      data-manifesto
      className="relative h-[120svh] w-full overflow-hidden bg-secondary text-primary max-sm:h-[140svh]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[30vw] bg-gradient-to-b from-transparent to-secondary"
      />

      <div className="layout-grid relative z-10 pt-[8vw] max-sm:pt-[20vw]">
        <p className="col-span-12 text-body sm:col-span-7 max-sm:text-body-sm">{MANIFESTO.copy}</p>
      </div>

      {/*
       * Scaled to 0.62 and centred. The geometry is faithful at 1:1 — a 44vw radius makes an
       * ellipse roughly 1650px across — but that is wider than a 1440px viewport, so both flanks
       * were clipped and only two images survived. Scaling the whole stage rather than shrinking
       * the radius keeps the measured proportions between ring, item and perspective intact and
       * only changes how much of the viewport the constellation occupies.
       */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.62] max-sm:scale-[0.5]">
        <ImageRing3D items={items} />
      </div>

      {/*
       * The preview card. On the reference the ring's label is not centred beneath it — it sits in a
       * small framed panel on cream paper at the bottom right, with the label ruled underneath. The
       * frame reads as a monitor or a contact sheet pinned over the black field, and it is what tells
       * the visitor the scattered shapes are interactive at all.
       *
       * `pointer-events-none` on the card so it never blocks the ring images behind it; it is a
       * caption, not a control.
       */}
      <div className="pointer-events-none absolute bottom-[14svh] right-[var(--margin)] z-20 w-[23vw] bg-offwhite p-[0.6vw] max-sm:bottom-[10svh] max-sm:w-[54vw] max-sm:p-[2vw]">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-secondary">
          {/* A miniature of the same constellation, scaled right down — the reference shows the ring
              inside the frame too, so the card previews what it labels. */}
          {/* scrub={false}: on the reference the card's miniature holds still while the full-size
              ring turns — its own rotator sits at a constant 0° at every scroll offset. */}
          <div className="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.14]">
            <ImageRing3D items={items} scrub={false} />
          </div>
        </div>
        <p className="mt-[0.5vw] border-b border-secondary pb-[0.3vw] font-mono text-mono uppercase text-secondary max-sm:mt-[1.5vw] max-sm:pb-[1vw] max-sm:text-mono-sm">
          {MANIFESTO.ringLabel}
        </p>
      </div>
    </section>
  )
}
