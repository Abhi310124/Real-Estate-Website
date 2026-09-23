'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCoarsePointer } from '@/components/motion/useCoarsePointer'
import { cn } from '@/lib/cn'
import { SECTION_SCROLL_MT } from './section-anchor'
import type { MasterPlanPlot, Project } from '@/lib/data/types'

type Plan = NonNullable<Project['masterPlan']>
type Props = { plan: Plan }

const MIN_SCALE = 1
const MAX_SCALE = 4
const ZOOM_STEP = 1.4
// Below this many screen pixels of cumulative pointer movement across a gesture, the pointerup that
// follows still counts as a click on whatever plot is underneath — this is what tells "panned the
// plan" apart from "tapped a plot", since both start as the same pointerdown-move-up sequence.
const DRAG_CLICK_THRESHOLD_PX = 6

// The zoom controls, in the site's one button idiom: square corners, a mono label, a hairline
// border. Sitting on the navy chapter they are outlined rather than filled, so the white plan sheet
// beside them stays the only solid mass in the section. `Button` itself is not used here because it
// always carries the dot ornament and a solid tone, which for three tightly-grouped controls would
// read as three competing calls to action.
const CONTROL_BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-5 ' +
  'font-heading text-small text-secondary transition-colors duration-300 ' +
  'hover:bg-accent ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary ' +
  'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

// A local status→style map. `MasterPlanPlot['status']` ('available' | 'blocked' | 'sold') is a
// different domain from the `ProjectStatus` that `Pill` maps ('upcoming' | 'ongoing' | …), so reusing
// Pill here would mean smuggling plot data through a component contract typed for something else.
//
// `available` takes the orange fill with a navy label (5.17:1) — the plot a buyer can act on — `sold`
// the solid navy block, `blocked` an outline. The word is always spelled out, so the state never rests
// on colour alone.
const STATUS_META: Record<MasterPlanPlot['status'], { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-accent text-secondary' },
  blocked: { label: 'Blocked', className: 'border border-navyLine text-muted' },
  sold: { label: 'Sold', className: 'bg-secondary text-primary' },
}

// The data model carries no explicit viewBox, and the placeholder art's actual pixel content is
// procedurally generated with no real correspondence to these polygons' coordinates — so there is no
// "correct" viewBox to read off the image. Deriving it from the polygons' own bounding box instead
// means any future project's masterPlan data sizes its own overlay correctly with no code change,
// and invents nothing: it is a pure function of the coordinates already given.
function planViewBox(plots: MasterPlanPlot[]): string {
  let maxX = 0
  let maxY = 0
  for (const plot of plots) {
    for (const pair of plot.polygon.trim().split(/\s+/)) {
      const [x, y] = pair.split(',').map(Number)
      if (Number.isFinite(x)) maxX = Math.max(maxX, x)
      if (Number.isFinite(y)) maxY = Math.max(maxY, y)
    }
  }
  if (maxX <= 0 || maxY <= 0) return '0 0 100 100'
  // A margin so a plot flush against the data's own max coordinate is not stroked right at the
  // viewBox edge, which would clip its stroke in half.
  const margin = Math.max(maxX, maxY) * 0.05
  return `0 0 ${Math.round(maxX + margin)} ${Math.round(maxY + margin)}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

// The aria-label template is "Plot {label}, {size}, {status}", written assuming a bare identifier
// like "A1" — but this fixture's own label field already reads "Plot A1", so applying it literally
// would announce "Plot Plot A1". Prefixing only when the label does not already carry the word keeps
// the template's intent (always identify it as a plot) without stuttering on data that already does.
function plotAriaLabel(plot: MasterPlanPlot): string {
  const name = plot.label.toLowerCase().startsWith('plot') ? plot.label : `Plot ${plot.label}`
  return `${name}, ${plot.size}, ${plot.status}`
}

function touchDistance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/**
 * `#masterplan` — a transform-driven pan/zoom stage over the site layout drawing, with an
 * absolutely-positioned SVG overlay of keyboard-accessible plot hotspots. Rendered only when
 * `project.masterPlan` exists; the sparse fixture (`bkr-skyline-residences`, a single apartment tower
 * with no plotted layout) proves that absence by asserting zero `[data-plan-stage]` elements rather
 * than an empty or "coming soon" section.
 *
 * Navy chapter, and deliberately the *same* black as `KeyStats` immediately above it rather than the
 * next step in the page's alternation. Two consecutive dark chapters read as one continuous dark
 * passage — the home page opens with exactly that pairing — and it is what makes the alternation
 * survive this section being absent: without it, `KeyStats` (black) would hand straight to
 * `PlansTabs`, so `PlansTabs` has to be white either way.
 *
 * The plan itself sits on a white sheet inside the black field. That is the one arrangement that
 * works for a monochrome page: the drawing is navy line-work on cream, so it is rendered `grayscale`
 * to strip the last hue out of it, and grey line-work needs a light ground to be legible at all. It
 * also gives the section its subject — a drawing laid on a black table.
 *
 * `[data-plan-stage]` is the element the "zoom controls change the plan scale" test reads
 * `getComputedStyle(...).transform` off — CSS composes `translate(tx,ty) scale(s)` into a matrix
 * whose `.a` component is exactly `s`, uncontaminated by pan, which is what makes that assertion mean
 * what it says. `tx`/`ty` are screen-pixel offsets of the stage's own centre from the viewport's
 * centre — independent of `scale` by construction, since `translate` is the outer transform function
 * and `scale` the inner one.
 */
export function MasterPlan({ plan }: Props) {
  const coarsePointer = useCoarsePointer()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(MIN_SCALE)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    startTx: number
    startTy: number
    captured: boolean
  } | null>(null)
  const dragDistanceRef = useRef(0)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)

  const viewBox = planViewBox(plan.plots)
  const selectedPlot = plan.plots.find((p) => p.label === selectedLabel) ?? null

  // Escape clears the selection from anywhere on the page, not just while a plot has focus —
  // matching Lightbox's own document-level keydown convention rather than a per-plot onKeyDown, since
  // the detail panel can stay open after focus has moved elsewhere (e.g. into it).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLabel(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Valid pan range per axis at a given scale, collapsing to [0,0] at scale=1: the stage's unscaled
  // box already equals the viewport's, so scaling it by `s` around its own centre overshoots the
  // viewport by `extent*(s-1)` on each side, half of which is the most `tx`/`ty` can be in either
  // direction before empty space would show.
  const boundsFor = (nextScale: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 0
    const h = rect?.height ?? 0
    return { maxTx: (w * (nextScale - 1)) / 2, maxTy: (h * (nextScale - 1)) / 2 }
  }

  // Zoom toward a point: `anchor` is that point's offset from the viewport's own centre, in screen
  // pixels (0,0 for the centre itself, which is what the buttons use). Keeping the point under the
  // cursor fixed on screen while `scale` changes from `s` to `s'` requires
  // `tx' = dx*(1-ratio) + ratio*tx` (and the same for ty), where `ratio = s'/s` — derived from
  // solving "the local stage point currently under the cursor stays under the cursor" for the new
  // translate given CSS's `translate(tx,ty) scale(s)` composition order.
  const applyZoom = (nextScaleRaw: number, anchor?: { dx: number; dy: number }) => {
    const nextScale = clamp(nextScaleRaw, MIN_SCALE, MAX_SCALE)
    const ratio = nextScale / scale
    const dx = anchor?.dx ?? 0
    const dy = anchor?.dy ?? 0
    const rawTx = dx * (1 - ratio) + ratio * tx
    const rawTy = dy * (1 - ratio) + ratio * ty
    const { maxTx, maxTy } = boundsFor(nextScale)
    setScale(nextScale)
    setTx(clamp(rawTx, -maxTx, maxTx))
    setTy(clamp(rawTy, -maxTy, maxTy))
  }

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const rect = viewportRef.current?.getBoundingClientRect()
    const dx = rect ? e.clientX - rect.left - rect.width / 2 : 0
    const dy = rect ? e.clientY - rect.top - rect.height / 2 : 0
    applyZoom(scale - e.deltaY * 0.0022, { dx, dy })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (pinchRef.current) return
    // Capture is deliberately *not* taken here yet — see onPointerMove.
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startTx: tx,
      startTy: ty,
      captured: false,
    }
    dragDistanceRef.current = 0
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId || pinchRef.current) return
    const dxMove = e.clientX - drag.startX
    const dyMove = e.clientY - drag.startY
    dragDistanceRef.current = Math.hypot(dxMove, dyMove)
    // Capture is only taken once the gesture has actually proven itself a drag, not on pointerdown.
    // Chromium retargets the *click* event (not just pointer events) to whichever element holds
    // capture — capturing eagerly on pointerdown was silently swallowing every plain click on a plot,
    // since the click that should have landed on the <polygon> was instead firing on this outer
    // viewport div, which has no click handler of its own. Deferring capture until past the
    // click-vs-drag threshold means a plain click never establishes capture at all, so it is never at
    // risk of this retargeting.
    if (!drag.captured && dragDistanceRef.current > DRAG_CLICK_THRESHOLD_PX) {
      e.currentTarget.setPointerCapture(e.pointerId)
      drag.captured = true
    }
    const { maxTx, maxTy } = boundsFor(scale)
    setTx(clamp(drag.startTx + dxMove, -maxTx, maxTx))
    setTy(clamp(drag.startTy + dyMove, -maxTy, maxTy))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (drag?.pointerId === e.pointerId) {
      if (drag.captured) e.currentTarget.releasePointerCapture(e.pointerId)
      dragRef.current = null
    }
  }

  // Pinch-zoom, gated on a coarse (touch) pointer — mirrors Lightbox's proven two-touch
  // distance-ratio pattern, but zooms toward the stage's own centre rather than the pinch midpoint,
  // the same simplification Lightbox already makes for the identical gesture.
  const onTouchStart = (e: React.TouchEvent) => {
    if (!coarsePointer || e.touches.length !== 2) return
    dragRef.current = null // hand off exclusively to the pinch below
    pinchRef.current = { distance: touchDistance(e.touches[0], e.touches[1]), scale }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!coarsePointer || e.touches.length !== 2 || !pinchRef.current) return
    e.preventDefault()
    const ratio = touchDistance(e.touches[0], e.touches[1]) / pinchRef.current.distance
    applyZoom(pinchRef.current.scale * ratio)
  }

  const onTouchEnd = () => {
    pinchRef.current = null
  }

  const selectPlot = (label: string) => setSelectedLabel(label)

  const resetView = () => {
    setScale(MIN_SCALE)
    setTx(0)
    setTy(0)
  }

  return (
    <section
      id="masterplan"
      data-masterplan
      className={cn('pb-32 max-lg:pb-20', SECTION_SCROLL_MT)}
    >
      <div className="layout-grid items-end gap-y-4">
        <h2 className="col-span-12 font-heading text-h2 text-secondary max-sm:text-h2-sm lg:col-span-8">
          Site layout
        </h2>
        <p className="col-span-12 text-body text-muted lg:col-span-4">
          {coarsePointer
            ? 'Pinch, drag or use the buttons to explore the layout, and tap a plot to see its size and availability.'
            : 'Scroll to zoom, drag to pan, or use the buttons to explore the layout, and select a plot to see its size and availability.'}
        </p>
      </div>

      <div className="layout-grid mt-10 gap-y-8">
        <div
          ref={viewportRef}
          // The white sheet the drawing is laid on. `touch-none` so the browser hands every touch
          // gesture here to the pinch/pan handlers instead of scrolling the page.
          className="relative col-span-12 aspect-[10/7] w-full touch-none overflow-hidden rounded-card bg-offwhite lg:col-span-8"
          data-cursor="zoom"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            data-plan-stage
            className="absolute inset-0"
            style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: '50% 50%' }}
          >
            <Image
              src={plan.image.url}
              alt={plan.image.alt}
              fill
              sizes="(min-width: 640px) 66vw, 100vw"
              // The fixture's draughting is already navy and orange on cream, so it is shown as drawn.
              // It stays a drawing rather than being swapped for a photograph, because the alt text
              // describes a site layout and a photograph there would make the page assert something
              // untrue.
              className="pointer-events-none select-none object-contain"
            />
            <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
              {plan.plots.map((plot) => {
                const isSelected = plot.label === selectedLabel
                return (
                  <polygon
                    key={plot.label}
                    data-plot
                    tabIndex={0}
                    role="button"
                    aria-label={plotAriaLabel(plot)}
                    points={plot.polygon}
                    onClick={() => {
                      if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD_PX) return
                      selectPlot(plot.label)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        selectPlot(plot.label)
                      }
                    }}
                    // Navy strokes on the sheet, and an orange wash — the site's "clickable" colour —
                    // for the hover/focus/selected state. `stroke-2` on a viewBox this size is ~1px.
                    className={cn(
                      'cursor-pointer fill-transparent stroke-secondary stroke-2 transition-[fill] duration-300',
                      'hover:fill-accent/25 focus-visible:fill-accent/25',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                      isSelected && 'fill-accent/40'
                    )}
                  />
                )
              })}
            </svg>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => applyZoom(scale * ZOOM_STEP)}
              disabled={scale >= MAX_SCALE}
              className={CONTROL_BUTTON}
            >
              Zoom in
            </button>
            <button
              type="button"
              onClick={() => applyZoom(scale / ZOOM_STEP)}
              disabled={scale <= MIN_SCALE}
              className={CONTROL_BUTTON}
            >
              Zoom out
            </button>
            <button type="button" onClick={resetView} className={CONTROL_BUTTON}>
              Reset
            </button>
          </div>

          {selectedPlot ? (
            // A second white sheet, echoing the plan's own — so the selected plot's facts read as
            // being written on the drawing rather than in a floating tooltip.
            <div data-plot-detail className="mt-6 rounded-card bg-tint p-6 text-secondary">
              <p className="font-heading text-h4 max-sm:text-h4-sm">{selectedPlot.label}</p>
              <p className="mt-2 text-small text-muted">
                {selectedPlot.size}
                {selectedPlot.facing ? ` · Facing ${selectedPlot.facing}` : ''}
              </p>
              <span
                className={cn(
                  'mt-4 inline-flex items-center rounded-full px-3 py-1 text-small',
                  STATUS_META[selectedPlot.status].className
                )}
              >
                {STATUS_META[selectedPlot.status].label}
              </span>
            </div>
          ) : (
            <p className="mt-6 rounded-card border border-navyLine/60 p-6 text-small text-muted">
              Select a plot on the plan to see its size, facing and availability.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
