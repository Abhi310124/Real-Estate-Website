'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { getGsap } from '@/components/motion/gsap'
import { loadSequenceActive, onLoadStage } from '@/components/motion/loadCues'
import { SplitLines } from '@/components/motion/SplitLines'
import { useReducedMotion } from '@/components/motion/useReducedMotion'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { HERO } from '@/lib/content/home'

/**
 * The interior of the opening: four crossfading photographs, a four-segment progress indicator, the
 * lead sentence and the CTA — all driven by one clock.
 *
 * ## The slideshow
 *
 * Four full-bleed layers stacked on each other, one visible at a time, advancing every 10 seconds.
 * The reference's cycle was timed twice at 9916 and 10085 ms, so the interval is a flat 10 s and the
 * progress fill crosses its track in the same 10 s, linearly — a fill that eases would stop being a
 * clock, which is the only thing it is there to be.
 *
 * The crossfade is asymmetric on purpose and the asymmetry is most of its quality: the outgoing
 * layer leaves in 0.35 s while the incoming one takes 0.75 s to arrive, so for a third of a second
 * both are partly present and the join reads as a dissolve rather than as a swap. Each layer also
 * carries a `scale(1.05)` at rest and settles to 1 as it becomes active, which means the arriving
 * photograph is still contracting slightly after it is fully opaque. Take the scale away and the
 * dissolve reads as a slide show; take the 0.35 s overlap away and it reads as a cut.
 *
 * `opacity: 0.9` lives on the `<img>`, not on the layer, because the layer's own opacity is what the
 * crossfade animates. Nested opacity multiplies, so the active layer renders the photograph at 0.9
 * over black and an inactive one at 0. That 10% is the *only* darkening the reference applies to its
 * hero — there is no overlay anywhere in its hero section. See the note on the scrim below for why
 * ours is not yet able to do without one.
 *
 * ## The progress indicator
 *
 * Four tracks in the grid's first six columns: 690 px total, 3 px tall, 30% white, separated by the
 * grid's own gutter. The widths are NOT equal — the active track takes a flex ratio of 3 and the
 * other three take 1, which at 1440 resolves to exactly 315 / 105 / 105 / 105 px across a 690 px
 * row. Equal quarters would be the obvious reading of "four segments" and it is wrong: the wide
 * segment is what tells you which slide you are on, and the fill inside it is what tells you how
 * far through. The reference puts its fill only inside the active track; four fills are rendered
 * here instead, three of them held at `scaleX(0)` and therefore invisible, so that the elements the
 * timeline animates never unmount underneath it.
 *
 * How long the width swap itself takes is the one value in this component that is not recoverable
 * from the reference — a still frame cannot show it. It is tied to the incoming crossfade rather
 * than left instantaneous, because four tracks jumping 210 px in one frame, in the same frame the
 * photographs dissolve, reads as a glitch in the layout rather than as an advance.
 *
 * ## The measure, and why the CTA is in the left half
 *
 * The copy block is a nested six-column grid occupying the outer grid's columns 1–6, which is how
 * the reference builds it, and every proportion below falls out of that: the lead is three of those
 * six columns (335 px), which wraps this sentence to six short lines; the CTA is the other three,
 * right-aligned so its right edge lands on column 6's edge at x=710. Widening the lead to five
 * outer columns wraps the same string to four long lines and pushing the CTA to columns 7–10 moves
 * it across the page's midline — between them those two mistakes turn a dense block in the left
 * quarter into a loose band across the whole width. The split reveal and the measure are one fix,
 * not two: a masked line reveal over four wide lines is not the gesture the reference makes.
 *
 * `items-end` on the nested grid is what bottom-aligns the CTA with the lead's last line. They share
 * a grid row, so the row's height is the lead's and the shorter cell sinks to meet it — no offset to
 * maintain when the lead's line count changes.
 *
 * ## The scrim, which the reference does not have
 *
 * The reference darkens its hero with nothing but the image's own 0.9 opacity, and it gets away with
 * that because its photographs are dark exactly where the white copy sits. Ours are not. Measured
 * over the 336 px lead measure of each slide's `object-cover` crop, mean relative luminance runs
 * 0.073 / 0.262 / 0.519 / 0.352 — at 0.9 opacity over black that is 9.1 : 1 down to 2.0 : 1 against
 * white, and 23.04 px at weight 400 is not large text, so it owes 4.5 : 1. Two of the four slides
 * fail outright with no scrim, and no gradient mild enough to leave the photograph alone can rescue
 * a mean luminance of 0.52: that one needs 0.61 alpha *at the top line of the copy*, which is a
 * heavier wash than the one being removed.
 *
 * So the real fix is the slide selection, and it lives in the content module. What is kept here is
 * the least protection that does not regress what already shipped: one bottom-anchored gradient,
 * `secondary/90` to fully transparent over the lower 48% of the section. That resolves to alpha
 * 0.338 at the copy's top line and 0.696 at its baseline, against the 0.34 / 0.57 the three-stop
 * scrim it replaces delivered at the same two heights — equal or better where the text is, and
 * nothing at all above 52% of the frame, where the old scrim laid 0.10 to 0.25 black over the sky
 * and the whole subject. That band over the sky was the single most visible difference between the
 * two openings.
 *
 * ## Load choreography
 *
 * Nothing here schedules itself. The hero is on screen at load, so a scroll-entered reveal fires on
 * the first frame and plays out under an opaque curtain; every entrance therefore waits for a cue
 * from the one clock that owns the opening:
 *
 *   'rules'  +1.30s   tracks      opacity 0 → 1   0.5 s   power2.out, stagger 0.05
 *   'text'   +1.302   lead lines  masked reveal   (owned by SplitLines in load mode)
 *   'media'  +1.55    photograph  opacity 0 → 1   1.35 s  power4.out
 *                                 scale 1.1 → 1   1.2 s   power3.out
 *   'cta'    +1.55    CTA         opacity 0 → 1   1.0 s   power4.out
 *
 * The photograph arriving a quarter-second behind the words is deliberate: the sentence lands on
 * black and the building resolves in behind it. Every one of these is an out-ease, because they are
 * all entrances; the only in-out curve in the opening belongs to the curtain, the only thing that
 * leaves.
 *
 * **From-states are in the server-rendered markup**, as Tailwind classes, not written by a
 * post-hydration `gsap.set`. Hiding after hydration means a frame or more of the finished hero
 * before the sequence starts, which is precisely the flash the curtain exists to prevent. Three
 * things stop that from stranding content invisible:
 *
 *   1. Every from-state has a `motion-reduce:` counterpart, so a visitor who prefers reduced motion
 *      resolves to the finished state in CSS, before any script runs. That preference is also the
 *      pause mechanism for the slideshow: under it there is no advance, no fill, no drift, and the
 *      poster frame simply sits there.
 *   2. If the GSAP chunk fails, the `catch` writes the final values directly. A failed import
 *      degrades to a visible, unanimated hero, never to a blank one.
 *   3. If no load sequence is driving the page — this component on a route without one — the cues
 *      are never coming, so everything plays at once instead of waiting. A watchdog covers the
 *      remaining case of a sequence that claimed the page and then did not deliver.
 *
 * That leaves one hole those three cannot reach: scripts blocked entirely, where the from-state
 * classes are all that ever render. The `<noscript>` rule at the bottom closes it. It is the only
 * path on which it can apply, since a browser with scripting enabled never parses that element.
 *
 * ## Scroll response
 *
 * The media stack drifts down a fifth of its own height and fades to 0.6 across the first viewport
 * of scroll, which is what makes the chapter that follows feel as though it is climbing over the
 * hero rather than the hero sliding rigidly away. The drift is scrubbed on the section box — the one
 * untransformed element in here — because measuring a box that a tween is moving is circular.
 * Drift and entrance live on two nested elements, not one: they both want `opacity` and `transform`,
 * and the outer one is still being scrubbed long after the inner one has finished arriving.
 *
 * The scrim is deliberately NOT inside the drifting wrapper. It protects the copy, which does not
 * move, so it has to stay with the copy; and the drift only ever improves contrast anyway, since it
 * fades the photograph toward the black behind it.
 */

/** The cycle. Measured twice on the reference at 9916 and 10085 ms. */
const SLIDE_SECONDS = 10

/** Crossfade: the outgoing layer clears in under half the time the incoming one takes to arrive. */
const FADE_IN = 0.75
const FADE_OUT = 0.35

/** Flex ratio of the active track against the three inactive ones: 315 px against 105 px at 1440. */
const ACTIVE_RATIO = 3

/** Not a measured value — see the note on the width swap above. */
const TRACK_RESIZE = 0.7

/** The inactive layers' resting scale, and the photograph's entrance scale. */
const LAYER_SCALE = 1.05
const ENTRY_SCALE = 1.1

/** Fraction of its own height the media stack drifts, and the opacity it fades to. */
const DRIFT_PERCENT = 20
const DRIFT_OPACITY = 0.6

type Stage = 'rules' | 'media' | 'cta'

const STAGES: readonly Stage[] = ['rules', 'media', 'cta']

/**
 * A backstop, not a mechanism — the load sequence promises every stage on every path it can fail
 * down. Set beyond its own watchdog and its longest timeline, so this can only ever replace a cue
 * that is never coming and never one that is merely late.
 */
const CUE_WATCHDOG_MS = 6000

/**
 * Only the from-states are tagged. The three inactive slide layers are deliberately not, because
 * without a script there is no carousel and only the poster frame should be showing.
 */
const NO_SCRIPT_RESCUE = '<style>[data-hero-from]{opacity:1!important;transform:none!important}</style>'

function present<T>(refs: ReadonlyArray<T | null>): T[] {
  return refs.filter((el): el is T => el !== null)
}

export function HeroSlides() {
  const reduced = useReducedMotion()
  const driftRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<Array<HTMLDivElement | null>>([])
  const trackRefs = useRef<Array<HTMLSpanElement | null>>([])
  const fillRefs = useRef<Array<HTMLSpanElement | null>>([])

  useEffect(() => {
    const drift = driftRef.current
    const frame = frameRef.current
    const cta = ctaRef.current
    if (reduced || !drift || !frame || !cta) return

    const layers = present(layerRefs.current)
    const tracks = present(trackRefs.current)
    const fills = present(fillRefs.current)
    // A partially-mounted stack would give the timeline an outgoing layer that is not the one on
    // screen, so it is better to leave the hero in its from-states and let the catch-equivalent
    // below never run than to animate the wrong elements. This cannot happen in practice; it is
    // here so that `layers[i]` needs no non-null assertion.
    if (layers.length !== HERO.slides.length || tracks.length !== layers.length || fills.length !== layers.length) {
      return
    }

    let cancelled = false
    let dispose: (() => void) | undefined

    getGsap()
      .then(({ gsap }) => {
        if (cancelled) return

        const stops: Array<() => void> = []
        const own = (anim: { kill: () => void; scrollTrigger?: { kill: () => void } | null }) => {
          stops.push(() => {
            anim.scrollTrigger?.kill()
            anim.kill()
          })
        }

        // `[data-hero]` is the section's contract with the rest of the page; the drift is scrubbed
        // against it because it is the only box in here that no tween transforms.
        const section = drift.closest<HTMLElement>('[data-hero]')
        if (section) {
          own(
            gsap.fromTo(
              drift,
              { yPercent: 0, opacity: 1 },
              {
                yPercent: DRIFT_PERCENT,
                opacity: DRIFT_OPACITY,
                ease: 'none',
                scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
              }
            )
          )
        }

        // One repeating timeline rather than an interval plus per-advance tweens: the fill, the
        // track widths and the crossfade are the same event seen three ways, and a timeline cannot
        // drift out of step with itself the way three timers can. Slot `i` starts by zeroing every
        // fill, so each cycle — including the wrap back to slot 0 — begins from the same state.
        // `repeatRefresh` is not optional here. A repeating timeline records each child's start
        // value the first time that child renders and reuses it forever, so on the wrap back to
        // slot 0 the crossfade would replay values from the first pass — when the last layer was
        // already hidden and the first already visible — and the loop would hard-cut once every
        // 40 s instead of dissolving. Refreshing invalidates the children each iteration so they
        // re-read the live state.
        const startLoop = () => {
          const count = layers.length
          const tl = gsap.timeline({ repeat: -1, repeatRefresh: true })
          for (let i = 0; i < count; i += 1) {
            const at = i * SLIDE_SECONDS
            const outgoing = layers[(i + count - 1) % count]
            tl.set(fills, { scaleX: 0 }, at)
              .to(fills[i], { scaleX: 1, duration: SLIDE_SECONDS, ease: 'none' }, at)
              .to(
                tracks,
                {
                  flexGrow: (index: number) => (index === i ? ACTIVE_RATIO : 1),
                  duration: TRACK_RESIZE,
                  ease: 'power2.out',
                },
                at
              )
              .to(outgoing, { opacity: 0, scale: LAYER_SCALE, duration: FADE_OUT, ease: 'power2.in' }, at)
              .to(layers[i], { opacity: 1, scale: 1, duration: FADE_IN, ease: 'power4.out' }, at)
          }
          // On the first pass slot 0 tweens the already-hidden last layer out and the already-visible
          // first layer in, which are both no-ops; on every repeat after that they are the real
          // crossfade back to the poster frame.
          own(tl)
        }

        const played = new Set<Stage>()
        const play = (stage: Stage) => {
          if (played.has(stage)) return
          played.add(stage)

          if (stage === 'rules') {
            own(
              gsap.fromTo(
                tracks,
                { opacity: 0 },
                { opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.05 }
              )
            )
            return
          }

          if (stage === 'media') {
            own(
              gsap.fromTo(
                frame,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 1.35,
                  ease: 'power4.out',
                  // Released on the longer of the two tweens, so the scale is finished as well.
                  onComplete: () => gsap.set(frame, { willChange: 'auto' }),
                }
              )
            )
            own(gsap.fromTo(frame, { scale: ENTRY_SCALE }, { scale: 1, duration: 1.2, ease: 'power3.out' }))
            // The cycle starts with the photograph, so the first slide gets a full turn on screen.
            startLoop()
            return
          }

          own(gsap.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power4.out' }))
        }

        const playAll = () => {
          for (const stage of STAGES) play(stage)
        }

        let watchdog = 0
        let unsubscribe: Array<() => void> = []

        // Asked here, after the chunk has arrived, rather than in the effect body. A LoadSequence
        // claims the page during its own mount, and effects run child-first — waiting for the
        // dynamic import puts this question a macrotask past every mount on the page, which is the
        // only point at which "is anybody driving the opening?" has a dependable answer.
        if (loadSequenceActive()) {
          unsubscribe = STAGES.map((stage) =>
            onLoadStage(stage, () => {
              if (!cancelled) play(stage)
            })
          )
          watchdog = window.setTimeout(() => {
            if (!cancelled) playAll()
          }, CUE_WATCHDOG_MS)
        } else {
          playAll()
        }

        dispose = () => {
          window.clearTimeout(watchdog)
          for (const off of unsubscribe) off()
          for (const stop of stops) stop()
        }
      })
      .catch((err) => {
        if (cancelled) return
        // The from-states are classes, so clearing them means writing over them inline. Only the
        // three elements that were hidden are touched; the inactive slide layers stay hidden,
        // because with no timeline there is nothing to advance them.
        frame.style.opacity = '1'
        frame.style.transform = 'none'
        frame.style.willChange = 'auto'
        for (const track of tracks) track.style.opacity = '1'
        cta.style.opacity = '1'
        // Logged rather than swallowed: an opening that silently stopped happening is worth seeing.
        console.error('[HeroSlides] hero choreography unavailable; the opening renders in its final state', err)
      })

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [reduced])

  return (
    <>
      <div
        ref={driftRef}
        className="absolute inset-0 bg-secondary [will-change:transform,opacity]"
      >
        <div
          ref={frameRef}
          data-hero-from
          // `relative` so this box is the slide layers' containing block on every path. A transform
          // would make it one anyway, but the failure paths below reset `transform` to `none`, and
          // the layers must not start resolving against a different ancestor when they do.
          className={cn(
            'relative h-full w-full scale-110 opacity-0 [will-change:opacity,transform]',
            'motion-reduce:scale-100 motion-reduce:opacity-100'
          )}
        >
          {/* Keyed by position, not by `src`. Nineteen photographs cover twenty-eight slots in the
              content module, so two slides sharing a file is a legitimate editorial outcome — and it
              would collide as a React key while the slots themselves are fixed and never reorder. */}
          {HERO.slides.map((slide, i) => (
            <div
              key={i}
              ref={(el) => {
                layerRefs.current[i] = el
              }}
              className={cn('absolute inset-0', i > 0 && 'scale-105 opacity-0')}
            >
              <Image
                src={slide.src}
                // Only the poster frame is described. The other three are the same subject shown
                // again and only one is ever visible, so four building descriptions in the page's
                // opening would be four readings of decoration — the lead sentence is what carries
                // this section's meaning.
                alt={i === 0 ? slide.alt : ''}
                fill
                sizes="100vw"
                // The poster frame is the LCP element and is worth a preload link in the head. The
                // other three intersect the viewport from the first frame, so lazy loading will not
                // defer them — a low fetch priority is what keeps them from competing with it.
                preload={i === 0}
                fetchPriority={i === 0 ? undefined : 'low'}
                className="object-cover opacity-90 saturate-[1.12]"
              />
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-secondary/90 to-transparent"
      />

      {/* Anchored in `svh` rather than `vw`: the section is sized by height, so a width-relative
          offset clipped the CTA off the bottom edge at wide-but-short viewports. */}
      <div className="layout-grid absolute inset-x-0 bottom-[12svh] max-sm:bottom-[18svh]">
        <div className="col-span-12 grid grid-cols-6 items-end gap-x-[var(--gutter)] text-primary sm:col-span-6">
          {/* 19.6px at 1440 — the gap measured between the tracks and the lead's first line. */}
          <div
            aria-hidden="true"
            data-hero-progress
            className="col-span-6 mb-[1.36vw] flex gap-x-[var(--gutter)] max-sm:mb-[5vw]"
          >
            {HERO.slides.map((_slide, i) => (
              <span
                key={i}
                ref={(el) => {
                  trackRefs.current[i] = el
                }}
                data-hero-from
                className={cn(
                  'h-[3px] bg-primary/30 opacity-0 motion-reduce:opacity-100',
                  i === 0 ? 'flex-[3]' : 'flex-1'
                )}
              >
                <span
                  ref={(el) => {
                    fillRefs.current[i] = el
                  }}
                  data-hero-fill
                  className="block h-full w-full origin-left scale-x-0 bg-primary"
                />
              </span>
            ))}
          </div>

          {/* An <h1>, not a <p>, despite being set at body size. The reference's hero carries no
              visible display heading either — but a page still needs exactly one top-level
              heading, for assistive tech and for search. This statement IS the page's heading; an
              h1 is not obliged to be the largest thing on screen. The alternative, a
              visually-hidden h1 duplicating this text, would make screen readers announce the same
              sentence twice.

              Three columns of six, which is what wraps these 184 characters to six short lines —
              the masked line reveal is only the gesture it is meant to be at this measure. */}
          <SplitLines
            as="h1"
            mode="load"
            text={HERO.copy}
            className="col-span-6 text-body sm:col-span-3 max-sm:text-body-sm"
          />

          <div
            ref={ctaRef}
            data-hero-from
            // Explicit column lines rather than a span, because the only thing that moves between
            // breakpoints is the start: full width below `sm`, columns 4–6 above it, so the button's
            // right edge lands on column 6's edge. A `col-span-*` here would have to be overridden
            // by `col-start-*`, and that only works because of the order Tailwind happens to emit
            // the two properties in.
            className={cn(
              'col-start-1 col-end-7 mt-[3vw] opacity-0 motion-reduce:opacity-100',
              'sm:col-start-4 sm:mt-0 sm:justify-self-end'
            )}
          >
            <Button href={HERO.cta.href} tone="light" className="w-full sm:w-auto">
              {HERO.cta.label}
            </Button>
          </div>
        </div>
      </div>

      <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_RESCUE }} />
    </>
  )
}
