/**
 * The cue bus for the first-load choreography.
 *
 * The reference's opening is a single 4.1s composition whose beats land in three different parts of
 * the tree: the header wordmark at t0+0.30, the header links at t0+1.50, and the hero's hairlines,
 * headline lines, photograph and CTA between t0+1.30 and t0+1.55 (t0 = the frame the curtain begins
 * to fade). Those offsets are the whole character of the opening — the wordmark rising *through*
 * 40%-opaque black, the 550ms of wordmark-on-black after the curtain clears, the photograph
 * arriving 250ms behind the words it sits behind. None of that survives if each component times
 * itself from its own mount, because mount order is a hydration detail and drifts. So one clock —
 * `LoadSequence` — owns every offset and publishes its beats here.
 *
 * A plain module rather than React context, deliberately. These cues cross the layout / header /
 * hero boundary; they are global by nature and live for exactly one document. A provider would mean
 * threading state from the root layout down to an individual hairline for a signal that has no
 * per-subtree meaning.
 *
 * Three properties carry the design:
 *
 * 1. **Cues are sticky.** A subscriber that arrives after its cue already fired still runs, on the
 *    next microtask. A component in load mode has hidden itself and is waiting; if a late-resolving
 *    chunk could miss its cue, the entrance would not degrade to "unanimated" but to "permanently
 *    invisible", which is the worst failure this file can have.
 * 2. **Firing is idempotent and never resets.** The opening plays once per document. Fast Refresh,
 *    or any remount of the root, must not replay it — a curtain re-fading over a page the visitor
 *    has already scrolled would be far worse than a missed animation.
 * 3. **`loadSequenceActive()` is a promise about the future, not a status.** It is only true once a
 *    `LoadSequence` has claimed the document, and `LoadSequence` claims only when it will go on to
 *    fire all six stages — including its failure paths, which fire them immediately. A component
 *    that reads `false` must fall back to its own scroll trigger, because no cue is coming.
 *
 * Every mutation here belongs to one document and therefore happens on the client only. A server
 * render shares this module across every request the process handles, so nothing may claim or emit
 * from there — see the guard in `LoadSequence`.
 */

export type LoadStage = 'wordmark' | 'rules' | 'text' | 'nav' | 'media' | 'cta'

/**
 * The curtain's own completion travels on the same bus but is not a `LoadStage`: nothing outside
 * `LoadCurtain` should be able to subscribe to it or, worse, fire it. Keeping it in the same
 * registry means one set of stickiness and idempotency rules rather than two.
 */
type Signal = LoadStage | 'curtain'

const STAGES: readonly LoadStage[] = ['wordmark', 'rules', 'text', 'nav', 'media', 'cta']

const fired = new Set<Signal>()
const subscribers = new Map<Signal, Set<() => void>>()
let active = false

function emit(signal: Signal): void {
  if (fired.has(signal)) return
  fired.add(signal)
  const subs = subscribers.get(signal)
  if (!subs) return
  // Iterate a copy: a one-shot reveal unsubscribing itself from inside its own callback is the
  // normal case here, and that mutates the set mid-iteration.
  for (const cb of [...subs]) cb()
  subscribers.delete(signal)
}

function subscribe(signal: Signal, cb: () => void): () => void {
  if (fired.has(signal)) {
    // Microtask rather than synchronous: a subscriber calling back into React during its own
    // effect body is how `set-state-in-effect` cascades start.
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) cb()
    })
    return () => {
      cancelled = true
    }
  }
  const subs = subscribers.get(signal) ?? new Set<() => void>()
  subs.add(cb)
  subscribers.set(signal, subs)
  return () => {
    subs.delete(cb)
  }
}

/** Fire a stage. Idempotent: firing twice is a no-op. */
export function emitLoadStage(stage: LoadStage): void {
  emit(stage)
}

/**
 * Run `cb` when `stage` fires. If it has ALREADY fired, `cb` runs on the next microtask —
 * this is what makes a component that mounts late still animate instead of silently missing its cue.
 * Returns an unsubscribe function.
 */
export function onLoadStage(stage: LoadStage, cb: () => void): () => void {
  return subscribe(stage, cb)
}

/**
 * True once the sequence has been claimed by a LoadSequence instance. A component in 'load' mode
 * whose cue never arrives (no LoadSequence mounted, e.g. on an interior route) must fall back to its
 * scroll trigger rather than staying hidden forever.
 */
export function loadSequenceActive(): boolean {
  return active
}

/**
 * Claim the document for one `LoadSequence`. Claiming is a promise that every stage will fire, so
 * the caller must own a path to `emitAllLoadStages()` for each way its timeline can fail.
 */
export function claimLoadSequence(): void {
  active = true
}

/**
 * Fire every remaining stage at once. The reduced-motion, failed-chunk and watchdog paths all end
 * here: content visible immediately, in its final state, with no cue left outstanding.
 */
export function emitAllLoadStages(): void {
  for (const stage of STAGES) emit(stage)
}

/** Fired when the curtain's fade has finished, so the panel can unmount instead of lingering. */
export function emitCurtainCleared(): void {
  emit('curtain')
}

/** Sticky, like the stages: a curtain that mounts after the cue unmounts itself immediately. */
export function onCurtainCleared(cb: () => void): () => void {
  return subscribe('curtain', cb)
}
