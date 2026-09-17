'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useCoarsePointer } from '@/components/motion/useCoarsePointer'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { cn } from '@/lib/cn'
import type { MasterPlanPlot, Project } from '@/lib/data/types'

type Plan = NonNullable<Project['masterPlan']>
type Props = { plan: Plan }

const MIN_SCALE = 1
const MAX_SCALE = 4
const ZOOM_STEP = 1.4
// Below this many screen pixels of cumulative pointer movement across a gesture, the
// pointerup that follows still counts as a click on whatever plot is underneath — this is
// what tells "panned the plan" apart from "tapped a plot", since both start as the same
// pointerdown-move-up sequence.
const DRAG_CLICK_THRESHOLD_PX = 6

const CONTROL_BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-medium text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

// A new, local status→style map — MasterPlanPlot['status'] ('available' | 'blocked' | 'sold')
// is a different domain from the ProjectStatus Pill.tsx maps ('upcoming' | 'ongoing' | ...),
// so reusing Pill here would mean smuggling plot data through a component contract-typed for
// something else. `sold` gets the same filled-orange-with-white-label treatment Pill gives its
// own most-urgent status (`ongoing`) — the contrast law's carve-out for orange below 24px text,
// and the one status a buyer most needs to notice. `available` reuses the champagne-on-navy
// pairing the contrast law already clears at 7.2:1.
const STATUS_META: Record<MasterPlanPlot['status'], { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-champagne/20 text-champagne' },
  blocked: { label: 'Blocked', className: 'bg-white/10 text-white/70' },
  sold: { label: 'Sold', className: 'bg-orange text-white' },
}

// The data model carries no explicit viewBox, and the placeholder art's actual pixel content
// is procedurally generated with no real correspondence to these polygons' coordinates — so
// there is no "correct" viewBox to read off the image. Deriving it from the polygons' own
// bounding box instead means any future project's masterPlan data sizes its own overlay
// correctly with no code change, and invents nothing: it is a pure function of the coordinates
// already given.
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

// The brief's aria-label template is "Plot {label}, {size}, {status}", written assuming a bare
// identifier like "A1" — but this fixture's own label field already reads "Plot A1", so
// applying the template literally would announce "Plot Plot A1". Prefixing only when the label
// doesn't already carry the word keeps the template's intent (always identify it as a plot)
// without stuttering on data that already does.
function plotAriaLabel(plot: MasterPlanPlot): string {
  const name = plot.label.toLowerCase().startsWith('plot') ? plot.label : `Plot ${plot.label}`
  return `${name}, ${plot.size}, ${plot.status}`
}

function touchDistance(a: React.Touch, b: React.Touch): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/**
 * `#masterplan` (navy) — signature moment 3a of 3. A transform-driven pan/zoom stage over the
 * site layout image, with an absolutely-positioned SVG overlay of keyboard-accessible plot
 * hotspots. Rendered only when `project.masterPlan` exists (page.tsx); Ruling 3's sparse
 * fixture (`bkr-skyline-residences`, a single apartment tower with no plotted layout) proves
 * that absence by asserting zero `[data-plan-stage]` elements, not an empty or "coming soon"
 * section.
 *
 * `[data-plan-stage]` is the element the "zoom controls change the plan scale" test reads
 * `getComputedStyle(...).transform` off — CSS composes `translate(tx,ty) scale(s)` into a
 * matrix whose `.a` component is exactly `s`, uncontaminated by pan, which is what makes that
 * assertion mean what it says. `tx`/`ty` are screen-pixel offsets of the stage's own centre
 * from the viewport's centre — independent of `scale` by construction, since `translate` is
 * the outer transform function and `scale` the inner one.
 */
export function MasterPlan({ plan }: Props) {
  const coarsePointer = useCoarsePointer()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(MIN_SCALE)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; startTx: number; startTy: number; captured: boolean } | null>(
    null,
  )
  const dragDistanceRef = useRef(0)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)

  const viewBox = planViewBox(plan.plots)
  const selectedPlot = plan.plots.find((p) => p.label === selectedLabel) ?? null

  // Escape clears the selection from anywhere on the page, not just while a plot has focus —
  // matching Lightbox's own document-level keydown convention rather than a per-plot onKeyDown,
  // since the detail panel can stay open after focus has moved elsewhere (e.g. into it).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLabel(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Valid pan range per axis at a given scale, collapsing to [0,0] at scale=1: the stage's
  // unscaled box already equals the viewport's, so scaling it by `s` around its own centre
  // overshoots the viewport by `extent*(s-1)` on each side, half of which is the most `tx`/`ty`
  // can be in either direction before empty space would show — Ruling 8's "clamp panning to
  // the stage bounds so the plan can't be lost off-screen."
  const boundsFor = (nextScale: number) => {
    const rect = viewportRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 0
    const h = rect?.height ?? 0
    return { maxTx: (w * (nextScale - 1)) / 2, maxTy: (h * (nextScale - 1)) / 2 }
  }

  // Zoom toward a point: `anchor` is that point's offset from the viewport's own centre, in
  // screen pixels (0,0 for the centre itself, which is what the buttons use). Keeping the point
  // under the cursor fixed on screen while `scale` changes from `s` to `s'` requires
  // `tx' = dx*(1-ratio) + ratio*tx` (and the same for ty), where `ratio = s'/s` — derived from
  // solving "the local stage point currently under the cursor stays under the cursor" for the
  // new translate given CSS's `translate(tx,ty) scale(s)` composition order.
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
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, startTx: tx, startTy: ty, captured: false }
    dragDistanceRef.current = 0
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId || pinchRef.current) return
    const dxMove = e.clientX - drag.startX
    const dyMove = e.clientY - drag.startY
    dragDistanceRef.current = Math.hypot(dxMove, dyMove)
    // Capture is only taken once the gesture has actually proven itself a drag, not on
    // pointerdown. Chromium retargets the *click* event (not just pointer events) to whichever
    // element holds capture — capturing eagerly on pointerdown was silently swallowing every
    // plain click on a plot, since the click that should have landed on the <polygon> was
    // instead firing on this outer viewport div, which has no click handler of its own.
    // Deferring capture until past the click-vs-drag threshold means a plain click never
    // establishes capture at all, so it is never at risk of this retargeting.
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

  // Pinch-zoom, gated on a coarse (touch) pointer per Ruling 1 — mirrors Lightbox's proven
  // two-touch distance-ratio pattern, but zooms toward the stage's own centre rather than the
  // pinch midpoint, same simplification Lightbox already makes for the identical gesture.
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
    <section id="masterplan" data-masterplan className="scroll-mt-[180px] bg-navy-800 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <Eyebrow className="text-champagne">Master Plan</Eyebrow>
        <h2 className="mt-3 font-display-expanded text-display-md text-white">Site Layout &amp; Plots</h2>
        <p className="mt-4 max-w-2xl text-body text-white/80">
          {coarsePointer
            ? 'Pinch, drag or use the buttons to explore the layout, and tap a plot to see its size and availability.'
            : 'Scroll to zoom, drag to pan, or use the buttons to explore the layout, and select a plot to see its size and availability.'}
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div
            ref={viewportRef}
            className="relative aspect-[10/7] w-full touch-none overflow-hidden rounded-sm bg-navy-900"
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
                sizes="(min-width: 1024px) 60vw, 100vw"
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
                      className={cn(
                        'cursor-pointer fill-transparent stroke-champagne stroke-2 hover:fill-orange/35 focus-visible:fill-orange/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange',
                        isSelected && 'fill-orange/35',
                      )}
                    />
                  )
                })}
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => applyZoom(scale * ZOOM_STEP)} disabled={scale >= MAX_SCALE} className={CONTROL_BUTTON}>
                Zoom in
              </button>
              <button type="button" onClick={() => applyZoom(scale / ZOOM_STEP)} disabled={scale <= MIN_SCALE} className={CONTROL_BUTTON}>
                Zoom out
              </button>
              <button type="button" onClick={resetView} className={CONTROL_BUTTON}>
                Reset
              </button>
            </div>

            {selectedPlot ? (
              <div data-plot-detail className="rounded-sm bg-navy-700 p-5">
                <p className="font-display-expanded text-lg text-white">{selectedPlot.label}</p>
                <p className="mt-1 text-sm text-white/80">
                  {selectedPlot.size}
                  {selectedPlot.facing ? ` · Facing ${selectedPlot.facing}` : ''}
                </p>
                <span
                  className={cn(
                    'mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                    STATUS_META[selectedPlot.status].className,
                  )}
                >
                  {STATUS_META[selectedPlot.status].label}
                </span>
              </div>
            ) : (
              <div className="rounded-sm border border-white/10 p-5 text-sm text-white/60">
                Select a plot on the plan to see its size, facing and availability.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
