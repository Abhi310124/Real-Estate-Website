'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { DotOrnament } from '@/components/motion/DotOrnament'
import { ImageReveal } from '@/components/motion/ImageReveal'
import { useCoarsePointer } from '@/components/motion/useCoarsePointer'
import { resolvePhoto } from '@/components/project/photo'
import { Pill } from '@/components/ui/Pill'
import { cn } from '@/lib/cn'
import { formatPrice } from '@/lib/format'
import type { ProjectSummary } from '@/lib/data/types'

/**
 * One tile in `/projects`' grid, in the monochrome listing register.
 *
 * The anatomy is the reference's and is deliberately *not* a card: no panel, no ring, no fill.
 * Photograph, then title, then the metadata line in `muted`, then the status, then the affordance
 * row. What separates one tile from the next is the white the grid puts between them, not a border.
 *
 * ## Two sizes, because a row mixes them
 *
 * The reference's listing row is a 6-column plate beside two 3-column thumbs, all three flush at the
 * top, and the stagger is the difference in their heights rather than a margin (see
 * `ProjectGrid.tsx`). So the size is a property of the tile:
 *
 *   plate  6 columns, 690px at 1440, image frame 690x805 — the reference's own measured frame
 *   thumb  3 columns, 335px, a square frame
 *
 * The thumb's square is chosen for the ratio it produces, not for the crop: 335 of photograph plus
 * this tile's metadata stack lands the card at roughly half the plate's height, which is the
 * reference's measured 443:857 relationship. It is also the one crop that reads as neither a
 * shrunken plate nor a banner.
 *
 * The thumb sets its title at the body step where the plate uses `lead`. That is the 335px measure
 * deciding, not taste: at 31.68px these project names wrap to three lines mid-name in a 3-column
 * column, and the reference's 443px card cannot contain a metadata stack built on a 31.68px title
 * at all.
 *
 * ## Hover does three things at once
 *
 * 1. **The photograph pulls back**, 1 -> 0.9 over 400ms on an ease-out. The scale is on a wrapper
 *    *around* `ImageReveal`, not inside it: the inner layer's `transform` is written inline by GSAP
 *    every frame (that is the scrubbed 1.2x parallax), so a class-based scale there would be
 *    overwritten on the next scroll tick. Scaling from the outside is visually identical here —
 *    the frame has no fill and no border, so its box *is* the photograph's edge — and shrinking
 *    cannot grow the frame into a neighbour the way the `scale-105` that once sat on this element
 *    did.
 * 2. **A pill tracks the pointer**, set from the pointer position 1:1 rather than eased, holding a
 *    15.84px label and the ornament in a 21.6px cell: 7.2px inline padding, 5.76px block, a 36px
 *    gap, box 123.5 x 33.1px. This is the click affordance — neither this site nor the reference
 *    changes the cursor over a card, so without it a tile has no pointer feedback at all beyond a
 *    hairline.
 * 3. **The affordance row moves**: its label slides 7.2px right while the ornament turns a quarter
 *    turn and contracts — the same gesture, the same 400ms ease-out, as every `Button` on the site.
 *
 * The title's hairline flips its origin: right at rest, left on hover, so the rule is ruled out of
 * the left edge with the reading direction and collapses away rightward when released. That is the
 * site's single convention for a line that grows (see `.in-out-line` in `app/globals.css`); the
 * fixed right origin this replaces could only ever play its own entrance backwards.
 *
 * **Every one of those four has a `focus-visible` arm.** A hover-only affordance is invisible to a
 * keyboard, and the pill is the one that carries the information that the tile is live. The variant
 * is `group-has-[:focus-visible]` rather than `group-focus-within` because the focusable element is
 * the link *inside* the group, and `focus-within` would also fire on a pointer click and leave a
 * clicked tile stuck in its hover state after the pointer had gone.
 *
 * `data-flip-id` follows GSAP's own Flip guidance for framework re-renders: a stable identity
 * attribute so `Flip.getState`/`Flip.from` in `ProjectGrid` keep matching the right element to the
 * right recorded state across a filter change.
 */

export type CardSize = 'plate' | 'thumb'

const SIZES: Record<CardSize, { frame: string; sizes: string; title: string }> = {
  plate: {
    // 690x805 at 1440 — the reference's own frame for the 6-column card, written as a ratio so it
    // survives a change of viewport.
    frame: 'aspect-[6/7]',
    // 58vw, not the 48vw the column measures: `ImageReveal` renders the photograph at 1.2x to bleed
    // past its clip, so a hint quoted against the column asks for a candidate 20% too small.
    sizes: '(min-width: 640px) 58vw, 110vw',
    title: 'mt-[1.6vw] text-lead max-sm:mt-[5vw] max-sm:text-lead-sm',
  },
  thumb: {
    frame: 'aspect-square',
    // 23vw of column, again x1.2.
    sizes: '(min-width: 640px) 28vw, 110vw',
    title: 'mt-[1.2vw] text-body max-sm:mt-[5vw] max-sm:text-body-sm',
  },
}

/** The photograph pull-back. Ours is the wrapper; see note 1 above for why it is not the frame. */
const FRAME_PULL =
  'transition-transform duration-[400ms] ease-out ' +
  'group-hover:scale-90 group-has-[:focus-visible]:scale-90 ' +
  'motion-reduce:transition-none motion-reduce:group-hover:scale-100 ' +
  'motion-reduce:group-has-[:focus-visible]:scale-100'

/** The title hairline: 1px, 300ms, origin-right at rest and origin-left while live. */
const TITLE_RULE =
  'relative inline-block ' +
  "after:absolute after:inset-x-0 after:-bottom-[0.15em] after:block after:h-px after:origin-right " +
  "after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-in-out " +
  "after:content-[''] " +
  'group-hover:after:origin-left group-hover:after:scale-x-100 ' +
  'group-has-[:focus-visible]:after:origin-left group-has-[:focus-visible]:after:scale-x-100 ' +
  'motion-reduce:after:transition-none'

/** The affordance label's 0.5vw slide — `Button`'s own gesture, and `block` is what lets a
 *  transform apply to it at all. */
const LABEL_SLIDE =
  'block transition-transform duration-[400ms] ease-out ' +
  'group-hover:translate-x-[0.5vw] group-has-[:focus-visible]:translate-x-[0.5vw] ' +
  'motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 ' +
  'motion-reduce:group-has-[:focus-visible]:translate-x-0'

/**
 * Where the pill parks when no pointer has placed it — 1.4vw in from the tile's top-left corner,
 * inside the photograph. A keyboard user gets the pill here; the pointer overrides it inline and
 * `pointerleave` hands it back, so a tile that was hovered and then tabbed to still shows it
 * somewhere deliberate rather than wherever the pointer last was.
 */
const BADGE_REST = 'translate-x-[1.4vw] translate-y-[1.4vw] max-sm:translate-x-[4vw] max-sm:translate-y-[4vw]'

/** The reference's own word for this, on the pill and on the in-card row alike. */
const AFFORDANCE = 'Explore'

/**
 * The pointer-tracking pill. A client child on its own so that nothing else about the tile needs to
 * care: it holds no state (a transform written to the node directly costs no render per pointer
 * move), and `useCoarsePointer()` keeps it off touch devices entirely, where there is no pointer to
 * follow and a pill would appear only after a tap had already navigated.
 *
 * The listener lives on the card rather than on this element, because this element is
 * `pointer-events-none` — it must never be the thing under the cursor — and the coordinates have to
 * be the card's own, since that is the box `absolute left-0 top-0` resolves against.
 *
 * Its only *animation* is the opacity fade, which `motion-reduce` cancels. The tracking itself is
 * not animation: it is the reader's own hand.
 */
function PointerBadge() {
  const coarse = useCoarsePointer()
  const badge = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (coarse) return
    const el = badge.current
    const card = el?.closest<HTMLElement>('[data-project-card]')
    if (!el || !card) return

    const move = (event: PointerEvent) => {
      const box = card.getBoundingClientRect()
      el.style.transform = `translate(${event.clientX - box.left}px, ${event.clientY - box.top}px)`
    }
    // Hand the resting position back, so the class-based transform decides again.
    const release = () => {
      el.style.transform = ''
    }

    card.addEventListener('pointermove', move, { passive: true })
    card.addEventListener('pointerleave', release)
    return () => {
      card.removeEventListener('pointermove', move)
      card.removeEventListener('pointerleave', release)
      release()
    }
  }, [coarse])

  if (coarse) return null

  return (
    <div
      ref={badge}
      // Ornament for a link that already announces itself: the pill says nothing the title and the
      // in-card row do not, so it is the sighted reader's affordance only.
      aria-hidden="true"
      data-card-badge
      className={cn('pointer-events-none absolute left-0 top-0 z-10', BADGE_REST)}
    >
      <div
        className={
          'flex w-fit items-center justify-between gap-[2.5vw] bg-primary px-[0.5vw] py-[0.4vw] ' +
          'text-secondary opacity-0 transition-opacity duration-300 ease-out ' +
          'group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 motion-reduce:transition-none ' +
          'max-sm:gap-[6vw] max-sm:px-[2vw] max-sm:py-[1.2vw]'
        }
      >
        <span className="whitespace-nowrap text-label max-sm:text-label-sm">{AFFORDANCE}</span>
        {/* The reference parks its asterisk in a 1.5vw cell, which is what makes the pill 33.1px
            tall — the label's line box is only 15.84px. `DotOrnament`'s own cell is the narrower
            button one, so this holder is the pill's geometry rather than a second copy of the
            component's. */}
        <span className="flex h-[1.5vw] w-[1.5vw] items-center justify-center max-sm:h-[6vw] max-sm:w-[6vw]">
          <DotOrnament />
        </span>
      </div>
    </div>
  )
}

type Props = { project: ProjectSummary; size?: CardSize; className?: string }

export function ProjectCard({ project, size = 'plate', className }: Props) {
  const spec = SIZES[size]
  // The fixtures still point at `/placeholder/projects/<slug>/hero.jpg`. `resolvePhoto` is the
  // site's one curated stand-in resolver: it maps a hero slot onto the nine frames verified to
  // actually show a whole contemporary building, keyed off the path so a project keeps the same
  // photograph as filters move the grid around it. The hand-rolled pool that used to live here
  // included `exterior-06` and `exterior-08` — an Icelandic barn and a New England shingle cottage,
  // both on that file's excluded list.
  const hero = resolvePhoto(project.heroImage)

  return (
    <article
      data-project-card
      data-flip-id={project.slug}
      data-category={project.category}
      data-status={project.status}
      data-cursor="view"
      className={cn('group relative flex flex-col', className)}
    >
      <Link
        href={`/projects/${project.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
      >
        <div className={FRAME_PULL}>
          <ImageReveal
            src={hero.url}
            alt={hero.alt}
            sizes={spec.sizes}
            // Overrides ImageReveal's shared default testid — one grid full of cards would
            // otherwise violate Playwright's strict mode together.
            data-testid={`project-card-image-${project.slug}`}
            className={cn('w-full [&_img]:saturate-[1.12]', spec.frame)}
          />
        </div>

        <h3 className={spec.title}>
          <span className={TITLE_RULE}>{project.title}</span>
        </h3>

        {/* Location and price on one `label` line in `muted`, split by a hairline slash. With no
            hue left to separate them, the divider does that job. `tnum` aligns the figures down
            the column between cards. */}
        <p className="mt-[1vw] flex flex-wrap items-baseline gap-x-[1vw] gap-y-[0.4vw] text-label text-muted max-sm:mt-[3vw] max-sm:gap-x-[2.5vw] max-sm:text-label-sm">
          <span>{project.location.area}</span>
          <span aria-hidden="true" className="text-edge">
            /
          </span>
          <span className="tnum">
            {formatPrice(project.priceFrom, project.priceUnit, project.priceOnRequest)}
          </span>
        </p>

        <div className="mt-[1.4vw] flex flex-wrap items-center gap-x-[1.2vw] gap-y-[0.8vw] max-sm:mt-[4vw] max-sm:gap-x-[3vw]">
          <Pill status={project.status} />
          {project.unitTypes.length > 0 && (
            <span className="font-mono text-mono uppercase text-muted max-sm:text-mono-sm">
              {project.unitTypes.join(' · ')}
            </span>
          )}
        </div>

        {/* The affordance row. It is inside the link, so it is part of the link's accessible name
            rather than a second tab stop competing with it. */}
        <div className="mt-[1.2vw] flex w-fit items-center gap-[2.3vw] max-sm:mt-[4vw] max-sm:gap-[6vw]">
          <span className={cn(LABEL_SLIDE, 'text-label max-sm:text-label-sm')}>{AFFORDANCE}</span>
          <DotOrnament spinOnGroupHover />
        </div>
      </Link>

      <PointerBadge />
    </article>
  )
}
