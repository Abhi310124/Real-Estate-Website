import { ImageReveal } from '@/components/motion/ImageReveal'
import { SplitLines } from '@/components/motion/SplitLines'
import { cn } from '@/lib/cn'
import { DIRECTOR_NOTE } from '@/lib/content/studio'

/**
 * Navy chapter, in the position the reference gives to its team block.
 *
 * ## Why there is one person here and not six
 *
 * The reference's /studio names six real people at a UK architecture practice, in two `layout-grid`
 * rows of three with a portrait each. BKR INFRA has exactly one named person anywhere in this
 * repository — B Karthik Reddy, Managing Director — and he is real. Porting the reference's six names
 * would publish somebody else's staff; inventing six Indian names to stand in their place would
 * fabricate a staff roster for a real business on the page where prospective buyers decide whether to
 * trust it. Neither is a placeholder, so this chapter is built around what is actually known: one
 * attributed note, the one verified name and role, and the verified office address the note points at.
 *
 * The consequence is structural and worth stating rather than hiding: this chapter is one
 * `layout-grid` row where the reference has two, and about 1,250px shorter than the block it stands in
 * for. A second row of three could only be filled by inventing people. If the practice wants the
 * reference's chapter, it needs six real ones first — the layout is not the missing piece.
 *
 * ## The row anatomy is the reference's, with the cells honestly filled
 *
 * `col-span-6` for the note and two `sm:col-span-3` cells beside it, which is the measured footprint.
 * The two cells hold photographs of the work rather than portraits: there is no photograph of the
 * Managing Director in the set, and a stock face under a real person's name is a fabrication of a
 * different kind. Each `alt` says what the frame actually is.
 *
 * ## The note is at the body step, not at `lead`
 *
 * It reads as a quieter block than a pull quote would, and the step is forced rather than chosen:
 * `SplitLines` masks exactly the line box, so on a line-height-1.0 token like `lead` it clips
 * ascenders and descenders away permanently. The choice was between an unrevealed note on a route
 * carried by masked line reveals and a revealed one a step smaller, and the smaller one is right — a
 * single static paragraph among thirty animated ones reads as something that failed rather than as
 * emphasis.
 *
 * `blockquote` and `figcaption` rather than styled paragraphs, because it is an attributed statement.
 * The two `SplitLines` are the quote's two columns, so they live inside the `blockquote`; the name and
 * the role sit in separate leaf elements so each resolves to exactly one node for a test without
 * needing `.first()`.
 */
export function DirectorNote({ address }: { address: string }) {
  return (
    <section
      data-studio-note
      className="w-full bg-secondary py-[10vw] text-primary max-sm:py-[18vw]"
    >
      <div className="layout-grid items-start">
        <figure className="col-span-12 sm:col-span-6">
          {/* Raw mono markup rather than `<Eyebrow>`: its own colour is `text-muted` and `cn()` is a
              plain join with no tailwind-merge, so a colour passed through `className` does not
              reliably win the cascade on a dark band. */}
          <p className="font-mono text-mono uppercase text-primary/60 max-sm:text-mono-sm">
            {DIRECTOR_NOTE.eyebrow}
          </p>

          {/* Two 23.3vw columns inside the note's six, which is what turns 141 and 106 characters into
              five and four short lines instead of three wide ones. The second runs 0.101s behind the
              first: they are two blocks, not one group with a shared stagger. */}
          <blockquote className="mt-[3vw] grid grid-cols-6 gap-[var(--gutter)] max-sm:mt-[8vw]">
            <SplitLines
              text={DIRECTOR_NOTE.copy[0]}
              className="col-span-6 text-body max-sm:text-body-sm sm:col-span-3"
            />
            <SplitLines
              text={DIRECTOR_NOTE.copy[1]}
              delay={0.101}
              className="col-span-6 text-body max-sm:mt-[6vw] max-sm:text-body-sm sm:col-span-3"
            />
          </blockquote>

          <figcaption className="mt-[4vw] max-sm:mt-[10vw]">
            <p className="text-lead max-sm:text-lead-sm">{DIRECTOR_NOTE.name}</p>
            <p className="mt-[0.8vw] text-label text-primary/60 max-sm:mt-[3vw] max-sm:text-label-sm">
              {DIRECTOR_NOTE.role}
            </p>
            {/* The verified office address, restated because the note itself points at it. At the
                wrapping label step — this is the one small run on the route that genuinely wraps, and
                `label` is line-height 1.0, which puts zero space between its descenders and the next
                line's ascenders. */}
            <p className="mt-[2vw] font-mono text-label-flow uppercase text-primary/60 max-sm:mt-[6vw] max-sm:text-label-flow-sm sm:max-w-[23.3vw]">
              {address}
            </p>
          </figcaption>
        </figure>

        {DIRECTOR_NOTE.images.map((image, i) => (
          <ImageReveal
            key={image.src}
            src={image.src}
            alt={image.alt}
            sizes="(min-width: 640px) 30vw, 110vw"
            data-testid={`studio-note-image-${i + 1}`}
            // The `sm:mt-*` lives entirely inside the branch. `cn()` is a plain join with no
            // tailwind-merge, so emitting both `sm:mt-0` and `sm:mt-[10vw]` on one element would leave
            // the outcome to stylesheet order rather than to this file.
            className={cn(
              'col-span-12 mt-[8vw] aspect-[4/5] w-full [&_img]:saturate-[1.12] sm:col-span-3',
              i === 0 ? 'sm:col-start-7 sm:mt-0' : 'sm:col-start-10 sm:mt-[10vw]'
            )}
          />
        ))}
      </div>
    </section>
  )
}
