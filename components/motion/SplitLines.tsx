'use client'
import { useCallback, useEffect, useRef } from 'react'
import { getGsap } from './gsap'
import { loadSequenceActive, onLoadStage } from './loadCues'
import { useReducedMotion } from './useReducedMotion'

/**
 * Per-line masked text reveal — each visual line rises out of a clipped edge.
 *
 * This is the reference's dominant section-entry gesture: it runs 68 of these on its home page and
 * animates almost nothing else in the body of a section. Display headings and buttons are
 * deliberately left static there, so this primitive is for supporting prose only.
 *
 * The measured spec, and why each value is what it is:
 *
 *   - Travel is `yPercent: 100 → 0`, i.e. exactly one line box. The reference's inline from-state is
 *     `translate(0%, 100%)` — 27.66px against a 27.66px line box. Expressed as a percentage rather
 *     than the pixel value so it stays exactly one line box at every step of a viewport-relative
 *     type scale, where the pixel height of a line changes with the window.
 *   - `duration: 0.75`, `ease: 'power3.out'`. The reference's sampled travel curve reaches 0.401 /
 *     0.639 / 0.805 / 0.913 / 0.971 of its distance at 100/200/300/400/500ms, which `power3.out`
 *     over 750ms predicts to within 0.003 throughout. `expo.out` (0.849 at 200ms) and `power2.out`
 *     (0.471 at 200ms) are both a long way off, so the curve is not a free choice.
 *   - `stagger: 0.06`, first line to last — measured 55.7–61.4ms across twelve independent groups.
 *   - **No opacity component.** The lines slide; they never fade. Fading is the obvious instinct and
 *     it is wrong: with opacity the text reads as arriving from nowhere, and the mask edge — the
 *     entire point of the effect — stops being legible as an edge.
 *   - `overflow: clip` on the mask, not `hidden`. `hidden` makes the mask a scroll container, which
 *     lets a focused link inside it scroll its own line out of alignment and permanently offset the
 *     text. `clip` has no such side effect, and it is what the reference sets.
 *
 * Because the mask is exactly the line box, callers must use a step with interline space — the 1.2
 * body step, where the glyphs clear the clip edge by 0.83px above and 0.96px below. On a
 * `line-height: 1` step the line box is narrower than the ink: the same text overflows it by 1.67px
 * at the top and 1.13px at the bottom, so the clip would shave ascender tips and descenders off for
 * good. Which is the same constraint the reference works under, and why it animates prose and never
 * the display steps.
 *
 * ## Splitting by *visual* line
 *
 * Lines are a rendering outcome, not markup: they move with viewport width, with the container's
 * measure, and with which font is actually loaded. So the split cannot happen on the server or at
 * render time — it is measured from the laid-out text with `Range.getClientRects()`, one character
 * at a time, grouping characters by the `top` of their client rect. (Per *word* is the cheaper loop
 * and it is subtly wrong: copy can break inside a word at an em dash or a slash, and a word that
 * straddles two lines then drags its second half into a mask sized for one line, where it is
 * clipped away. Per character cannot get that wrong. GSAP's SplitText would do this too, but it is
 * a paid plugin and is not a dependency here.)
 *
 * Three consequences worth stating, because each one is a way this pattern usually breaks:
 *
 * 1. The split waits for `document.fonts.ready`. Measuring against a fallback face gives break
 *    points for a font nobody will see, and the text visibly re-flows inside its masks when the
 *    real face lands.
 * 2. The accessible text has to survive. The masks are block elements with no whitespace of their
 *    own, so without help a screen reader and a clipboard both get one run-on token. A real space
 *    text node between consecutive masks restores it — whitespace between block boxes is discarded
 *    by the CSS layout rules, so it costs nothing visually while making `textContent` reproduce the
 *    original sentence. (This is the same fix `SplitWords` makes between its inline word masks.)
 *    The space goes back only where the break actually consumed one: a break inside a token invents
 *    a word boundary if you restore a space unconditionally.
 * 3. Nothing is ever hidden speculatively. The server renders the plain, unsplit, fully visible
 *    string; the text is only split and only pushed below its mask after both GSAP and the fonts
 *    have resolved. A failed chunk, a browser with no `Range` rects to give (an ancestor still
 *    `display: none`), or a reduced-motion preference therefore all land on readable text rather
 *    than on an empty block — the hiding and the animation are the same commitment.
 *
 * On resize the measure changes, so the split is thrown away and redone (debounced, and only when
 * the *width* moved — a mobile URL bar collapsing fires `resize` without changing a single break
 * point). If the reveal has already run, the rebuilt lines are placed at rest rather than replayed.
 *
 * ## `mode`
 *
 * `'scroll'` (default) triggers at `top 95%`, once. One threshold for every enter animation on the
 * site, matching the reference's single measured trigger band of 0.938–0.957 of viewport height.
 *
 * `'load'` waits for the load sequence's `'text'` cue instead. The hero is already on screen when
 * the page loads, so a scroll trigger there fires on the first frame and the reveal plays out under
 * the curtain — the choreography is destroyed by the very thing meant to drive it. Where no load
 * sequence is mounted (any interior route), `'load'` falls back to the scroll trigger, because the
 * one outcome this component must never produce is text that waits forever for a cue that is not
 * coming.
 */

type Props = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  text: string
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'div' | 'span'
  /** `'load'` defers to the load sequence's `'text'` cue; `'scroll'` triggers at `top 95%`. */
  mode?: 'scroll' | 'load'
  /** Seconds. Side-by-side paragraph columns run the second one at `delay={0.101}`. */
  delay?: number
}

const DURATION = 0.75
const STAGGER = 0.06
const EASE = 'power3.out'
const START = 'top 95%'
const RESIZE_DEBOUNCE_MS = 150

// A backstop, not a mechanism. The load sequence promises to emit every stage on every path it can
// fail down, and carries its own watchdog to keep that promise — but this component is the one
// holding the text hidden, so it does not delegate the last resort. Set beyond the sequence's own
// watchdog and its longest timeline, so it can only ever fire in place of a cue that is never
// coming, never in place of one that is merely late.
const CUE_WATCHDOG_MS = 6000

type Line = {
  text: string
  /** Whether the break that starts this line fell on whitespace in the original string. */
  gap: boolean
}

/**
 * Groups the laid-out characters of `text` into the visual lines the browser actually produced.
 * Returns `null` when the element has no measurable text — an unlaid-out or hidden ancestor — which
 * the caller reads as "leave the plain text alone".
 */
function measureLines(el: HTMLElement, text: string): Line[] | null {
  const node = el.firstChild
  if (!(node instanceof Text)) return null

  const range = document.createRange()
  const bounds: Array<[number, number]> = []
  let lineTop = Number.NaN
  let start = -1
  let end = -1

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i)
    // Collapsible whitespace only: the space at a break point belongs to neither line box and has
    // no dependable rect. A non-breaking space is not skipped — it never breaks, so it is interior
    // to a line and has to travel with it.
    if (code === 32 || code === 9 || code === 10 || code === 13) continue

    range.setStart(node, i)
    range.setEnd(node, i + 1)
    const rect = range.getClientRects().item(0)
    // A combining mark or half a surrogate pair can measure to nothing; it stays with the line it
    // is written in rather than aborting the whole split.
    if (!rect) continue

    // Half a rect height, rather than any downward movement at all, so sub-pixel noise inside one
    // line can never be mistaken for a line break: the real gap between lines is a full line box.
    if (Number.isNaN(lineTop) || rect.top - lineTop > Math.max(1, rect.height / 2)) {
      if (start >= 0) bounds.push([start, end])
      lineTop = rect.top
      start = i
    }
    end = i + 1
  }
  if (start >= 0) bounds.push([start, end])
  if (bounds.length === 0) return null

  // Lines are kept as slices of the original string rather than as re-joined words, so whatever the
  // author wrote inside a line survives verbatim.
  return bounds.map(([from, to], i) => ({
    text: text.slice(from, to),
    // A break does not always land on a space: copy breaks inside a token at an em dash or a
    // slash. Restoring a space there would put one in the visitor's clipboard, and a pause in a
    // screen reader's reading, that the sentence never contained.
    gap: i > 0 && bounds[i - 1][1] < from,
  }))
}

/**
 * Replaces the element's text with one mask per line, and returns the inner lines to animate.
 *
 * `appear-line-mask` / `appear-line` carry no CSS — the two properties that matter are set inline,
 * because they are structural rather than thematic and must not depend on a stylesheet arriving.
 * The names are the reference's own for this construct, which keeps the two pages directly
 * comparable when either is measured.
 */
function buildLines(el: HTMLElement, lines: Line[]): HTMLElement[] {
  const fragment = document.createDocumentFragment()
  const inner: HTMLElement[] = []

  for (const line of lines) {
    if (line.gap) fragment.appendChild(document.createTextNode(' '))

    const mask = document.createElement('span')
    mask.className = 'appear-line-mask'
    mask.style.display = 'block'
    mask.style.overflow = 'clip'

    const content = document.createElement('span')
    content.className = 'appear-line'
    content.style.display = 'block'
    content.textContent = line.text

    mask.appendChild(content)
    fragment.appendChild(mask)
    inner.push(content)
  }

  el.replaceChildren(fragment)
  return inner
}

export function SplitLines({ text, as: Tag = 'p', className, mode = 'scroll', delay = 0, ...rest }: Props) {
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = root.current
    if (reduced || !el) return

    let cancelled = false
    let dispose: (() => void) | undefined

    // `document.fonts` is absent under some test DOMs; an unresolvable `ready` would leave the text
    // plain and visible, which is the correct failure either way.
    const fontsReady: Promise<unknown> = document.fonts ? document.fonts.ready : Promise.resolve()

    Promise.all([getGsap(), fontsReady])
      .then(([{ gsap, ScrollTrigger }]) => {
        if (cancelled) return

        let inner: HTMLElement[] = []
        let tween: ReturnType<typeof gsap.to> | undefined
        let started = false
        let width = window.innerWidth
        let resizeTimer = 0
        let watchdog = 0
        let unsubscribe: (() => void) | undefined

        // Asked here, after the chunk has arrived, rather than during render or at the top of the
        // effect. A LoadSequence anywhere in the tree claims the page during its own mount — and
        // effects run child-first, so one mounted above this component runs after it. Waiting for
        // the dynamic import puts this question a macrotask past every mount on the page, which is
        // the only point at which "is anybody driving the load?" has a dependable answer.
        const cueDriven = mode === 'load' && loadSequenceActive()

        const split = (): boolean => {
          el.textContent = text
          const lines = measureLines(el, text)
          if (!lines) return false
          inner = buildLines(el, lines)
          return true
        }

        const hide = () => gsap.set(inner, { yPercent: 100, willChange: 'transform' })

        // `started` is the difference between "waiting to be seen" and "already seen", and a resize
        // has to treat those two oppositely. A scroll-driven tween learns it from `onStart`, which
        // is when its trigger fires; a cue-driven one is created at the moment it should move, so it
        // records the fact synchronously — leaving that to `onStart` would leave a one-tick window
        // in which a resize could re-hide lines whose one and only cue has already gone.
        const reveal = (scrollDriven: boolean) => {
          window.clearTimeout(watchdog)
          if (!scrollDriven) started = true
          tween = gsap.to(inner, {
            yPercent: 0,
            duration: DURATION,
            delay,
            stagger: STAGGER,
            ease: EASE,
            onStart: () => {
              started = true
            },
            onComplete: () => gsap.set(inner, { willChange: 'auto' }),
            ...(scrollDriven ? { scrollTrigger: { trigger: el, start: START, once: true } } : {}),
          })
        }

        if (!split()) return
        hide()

        if (cueDriven) {
          unsubscribe = onLoadStage('text', () => {
            if (!cancelled && !tween) reveal(false)
          })
          watchdog = window.setTimeout(() => {
            if (!cancelled && !tween) reveal(false)
          }, CUE_WATCHDOG_MS)
        } else {
          reveal(true)
        }

        const resplit = () => {
          tween?.scrollTrigger?.kill()
          tween?.kill()
          tween = undefined

          // Measurement can fail at the new width if the element has been laid out to nothing;
          // plain visible text is the right answer there too.
          if (!split()) return

          if (started) {
            // Already seen. The rebuilt lines belong at rest — a second reveal would replay an
            // animation the visitor has watched, for no reason other than that they resized.
            gsap.set(inner, { yPercent: 0, willChange: 'auto' })
          } else {
            hide()
            // In cue mode the subscription is still live and reads `inner` when it fires, so the
            // new lines are already what it will animate.
            if (!cueDriven) reveal(true)
          }
          ScrollTrigger.refresh()
        }

        const onResize = () => {
          // Height-only resizes cannot move a break point, and on mobile they arrive constantly.
          if (window.innerWidth === width) return
          width = window.innerWidth
          window.clearTimeout(resizeTimer)
          resizeTimer = window.setTimeout(resplit, RESIZE_DEBOUNCE_MS)
        }
        window.addEventListener('resize', onResize)

        dispose = () => {
          window.removeEventListener('resize', onResize)
          window.clearTimeout(resizeTimer)
          window.clearTimeout(watchdog)
          unsubscribe?.()
          tween?.scrollTrigger?.kill()
          tween?.kill()
          // Back to the plain, visible string. A second run of this effect — a changed `text`, or
          // React remounting it in development — has to measure unsplit text, not the masks left
          // by the run before it.
          el.textContent = text
          ScrollTrigger.refresh()
        }
      })
      .catch((err) => {
        // Degrades correctly by construction: the split and the `yPercent: 100` that hides the
        // lines both live inside the resolved branch, so nothing was ever hidden and there is
        // nothing to undo. Logged rather than swallowed — prose that silently stops animating
        // across a whole page is worth seeing in a console.
        console.error('[SplitLines] line reveal unavailable; text renders unsplit and visible', err)
      })

    return () => {
      cancelled = true
      dispose?.()
    }
  }, [reduced, delay, mode, text])

  // A callback ref rather than `ref={root}`: `Tag` is a union of element types, and a single
  // `useRef<HTMLElement>` is not assignable to the specific ref type React computes for each member
  // of that union. Function parameters are contravariant, so a callback taking the general
  // `HTMLElement` satisfies every member without an `as never` escape hatch. Memoized with an empty
  // dependency array to keep its identity stable — an inline arrow would detach and reattach the
  // DOM ref on every re-render.
  const setRef = useCallback((node: HTMLElement | null) => {
    root.current = node
  }, [])

  // The unsplit string, fully visible. Everything else is measured and applied afterwards.
  return (
    <Tag ref={setRef} className={className} {...rest}>
      {text}
    </Tag>
  )
}
