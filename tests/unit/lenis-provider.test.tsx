import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// A plain static import is safe alongside the vi.mock calls below: vitest hoists those above
// every import, so all three mocks are registered before this module is evaluated.
import { LenisProvider } from '@/components/motion/LenisProvider'

/**
 * Structural guard for the two halves of the Lenis -> GSAP bridge wired in LenisProvider.tsx,
 * and for the ticker callback's removal on unmount.
 *
 * This exists as a unit test rather than an e2e one because the e2e suite provably cannot cover
 * it. tests/e2e/motion-primitives.spec.ts drives real scroll and asserts a scrub-linked
 * transform tracks it, but that assertion still passes with `lenis.on('scroll',
 * ScrollTrigger.update)` fully commented out: ScrollTrigger registers its own wheel/scroll
 * listeners at plugin init, and those catch the native scroll event Lenis fires, so the tween
 * keeps updating without the explicit wire. The regression to fear here is the deletion of a
 * line, which is exactly the shape of bug a structural assertion catches and a behavioural one
 * does not.
 *
 * The ticker-removal assertion is the one with no other coverage anywhere: a leaked ticker
 * callback holding a destroyed Lenis instance across route changes is a real leak that nothing
 * else in this suite would notice.
 */

const mocks = vi.hoisted(() => {
  const instances: Array<{
    on: ReturnType<typeof vi.fn>
    raf: ReturnType<typeof vi.fn>
    destroy: ReturnType<typeof vi.fn>
  }> = []
  class FakeLenis {
    on = vi.fn()
    raf = vi.fn()
    destroy = vi.fn()
    constructor() {
      instances.push(this)
    }
  }
  return {
    instances,
    FakeLenis,
    scrollTriggerUpdate: vi.fn(),
    tickerAdd: vi.fn(),
    tickerRemove: vi.fn(),
    lagSmoothing: vi.fn(),
  }
})

vi.mock('lenis', () => ({ default: mocks.FakeLenis }))

vi.mock('@/components/motion/gsap', () => ({
  getGsap: () =>
    Promise.resolve({
      gsap: {
        ticker: { add: mocks.tickerAdd, remove: mocks.tickerRemove, lagSmoothing: mocks.lagSmoothing },
      },
      ScrollTrigger: { update: mocks.scrollTriggerUpdate },
    }),
}))

// useReducedMotion returns true on its first render by design (frozen Task 3 interface), which
// would make LenisProvider's effect bail out before wiring anything. Pinned false here so the
// wiring path is the one under test; the reduced-motion gate itself is covered elsewhere.
vi.mock('@/components/motion/useReducedMotion', () => ({ useReducedMotion: () => false }))

// The provider's setup and its cleanup both await promises, so assertions have to run after the
// microtask queue drains — inside act(), so React flushes the effects it queues.
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve() })

beforeEach(() => {
  mocks.instances.length = 0
  mocks.scrollTriggerUpdate.mockClear()
  mocks.tickerAdd.mockClear()
  mocks.tickerRemove.mockClear()
  mocks.lagSmoothing.mockClear()
})

// vitest runs with globals: false and there is no setup file, so RTL's auto-cleanup never
// registers itself. Unmounting explicitly keeps each test's provider from leaking into the next.
afterEach(cleanup)

describe('LenisProvider', () => {
  it('bridges Lenis scroll into ScrollTrigger.update', async () => {
    render(
      <LenisProvider>
        <div />
      </LenisProvider>,
    )
    await flush()

    const lenis = mocks.instances.at(-1)
    expect(lenis).toBeDefined()
    expect(lenis!.on).toHaveBeenCalledWith('scroll', mocks.scrollTriggerUpdate)
  })

  it("drives Lenis's rAF loop from the GSAP ticker with lag smoothing disabled", async () => {
    render(
      <LenisProvider>
        <div />
      </LenisProvider>,
    )
    await flush()

    expect(mocks.tickerAdd).toHaveBeenCalledTimes(1)
    expect(mocks.lagSmoothing).toHaveBeenCalledWith(0)

    // Asserting the callback actually feeds Lenis, not merely that add() received something:
    // Lenis's own autoRaf defaults to false, so this callback is the only thing advancing it,
    // and GSAP ticks in seconds while Lenis.raf expects milliseconds.
    const tick = mocks.tickerAdd.mock.calls[0]![0] as (t: number) => void
    tick(2)
    expect(mocks.instances.at(-1)!.raf).toHaveBeenCalledWith(2000)
  })

  it('removes the same ticker callback it added and destroys Lenis on unmount', async () => {
    const { unmount } = render(
      <LenisProvider>
        <div />
      </LenisProvider>,
    )
    await flush()

    const added = mocks.tickerAdd.mock.calls[0]![0]
    const lenis = mocks.instances.at(-1)!

    unmount()
    await flush()

    // Same reference, not just "remove was called": removing a different function leaves the
    // original callback on the ticker, still driving a Lenis instance that has been destroyed.
    expect(mocks.tickerRemove).toHaveBeenCalledWith(added)
    expect(lenis.destroy).toHaveBeenCalledTimes(1)
  })
})
