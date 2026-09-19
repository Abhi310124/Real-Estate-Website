import { test, expect, type Page } from '@playwright/test'

/**
 * The motion the reference is actually made of, asserted against the values measured off it at
 * 1440x900. Everything here was absent before — the suite passed green against a page on which
 * nothing but a curtain and one hairline moved — so each test below exists because its subject can
 * regress silently and nothing else would notice.
 *
 * Measured reference values these assertions come from:
 *
 *   load curtain        ~1150ms hold (gated on fonts + hero decode), then opacity 1 -> 0 over 750ms
 *   scroll lock         engaged through the curtain, released as the content cascade begins
 *   line reveals        68 per-line masks, translateY(100%) -> 0, 750ms power3.out, 60ms stagger
 *   image reveal        a black scrim, opacity 1 -> 0 over 250ms; the photograph never fades
 *   image parallax      every frame scrubbed translateY 0 -> +16.667% of its own height, downward
 *   hero carousel       4 slides, 10.0s interval, 4 progress tracks at flex ratios 3:1:1:1
 *   header              absent over the opening, then opacity 0 -> 1; ink inverts per band, 500ms
 *   footer slab         payload scrubbed translateY 288 -> 0, reaching 0 exactly at maxScroll
 *   dot ornament        8 dots on a circle, 8 DISTINCT positions
 *
 * `settle()` rather than a fixed wait: Lenis eases, and the scrubs follow the eased position, so a
 * value read straight after `scrollTo` is still moving. Two consecutive equal readings after an
 * unconditional lead-in is the only reliable form — settling on equality alone is a false positive
 * before easing begins, which has already produced a wrong measurement on this project once.
 */

const VIEWPORT = { width: 1440, height: 900 }

async function settle(page: Page, probe: () => Promise<number | null>, label: string) {
  await page.waitForTimeout(250)
  let last: number | null = null
  for (let i = 0; i < 60; i++) {
    const now = await probe()
    if (now !== null && last !== null && Math.abs(now - last) < 0.05) return now
    last = now
    await page.waitForTimeout(100)
  }
  throw new Error(`${label} never settled (last ${last})`)
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await settle(page, () => page.evaluate(() => window.scrollY), `scroll to ${y}`)
}

/** Waits out the opening, including its scroll lock. `lenis-stopped` is Lenis's own class. */
async function openingOver(page: Page) {
  await page.waitForFunction(
    () =>
      !!document.documentElement?.classList.contains('lenis') &&
      !document.documentElement.classList.contains('lenis-stopped'),
    undefined,
    { timeout: 15_000 }
  )
}

test.describe('the first-load sequence', () => {
  test('holds black, locks scroll, then releases — in that order', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/', { waitUntil: 'commit' })

    const t0 = Date.now()
    let lockedAt: number | null = null
    let curtainGoneAt: number | null = null
    let releasedAt: number | null = null

    // Polled rather than observed: a MutationObserver installed via addInitScript cannot see
    // `document.documentElement` reliably at that point, and the transitions here are hundreds of
    // milliseconds apart, so 60ms resolution is ample.
    while (Date.now() - t0 < 12_000) {
      // Guarded: with `waitUntil: 'commit'` the very first poll can land in a frame where the new
      // document has not been created yet, so `documentElement` is genuinely null. Skipping that
      // frame is correct — there is nothing to observe in it.
      const s = await page.evaluate(() => ({
        locked: !!document.documentElement?.classList.contains('lenis-stopped'),
        curtain: !!document.querySelector('[data-load-curtain]'),
        ready: !!document.documentElement,
      }))
      if (!s.ready) {
        await page.waitForTimeout(60)
        continue
      }
      const at = Date.now() - t0
      if (s.locked && lockedAt === null) lockedAt = at
      if (!s.curtain && curtainGoneAt === null && lockedAt !== null) curtainGoneAt = at
      if (lockedAt !== null && !s.locked && releasedAt === null) releasedAt = at
      if (releasedAt !== null) break
      await page.waitForTimeout(60)
    }

    expect(lockedAt, 'scroll is never locked — a wheel during the curtain scrolls the page away behind it').not.toBeNull()
    expect(releasedAt, 'scroll is never released — the page would be permanently unscrollable').not.toBeNull()
    expect(curtainGoneAt, 'the curtain never leaves the DOM').not.toBeNull()

    // The curtain clears BEFORE scroll is handed back. The reference releases the lock as the
    // content cascade begins, which is after the black has gone.
    expect(curtainGoneAt!).toBeLessThan(releasedAt!)
    // The reference holds ~1150ms and releases at ~2.5s. A generous band, because the hold is
    // deliberately gated on fonts and the hero image rather than on a timer — but tight enough to
    // fail if the hold is dropped altogether (which read as an instant flash) or never ends.
    expect(releasedAt!).toBeGreaterThan(900)
    expect(releasedAt!).toBeLessThan(9000)
  })

  test('a wheel gesture during the curtain does not move the page', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/', { waitUntil: 'commit' })
    // Get in while the lock is on. If the curtain has already gone this assertion is vacuous, so it
    // is guarded rather than assumed.
    await page.waitForFunction(() => !!document.documentElement?.classList.contains('lenis-stopped'), undefined, {
      timeout: 10_000,
    })
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(300)
    const moved = await page.evaluate(() => window.scrollY)
    expect(moved, 'the page scrolled behind an opaque curtain').toBeLessThan(5)
  })

  test('the hero withholds its photograph until after the text arrives', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/', { waitUntil: 'commit' })

    // The signature beat: after the curtain clears there is still solid black with only the
    // wordmark, because the hero keeps its own opaque background while the photograph is at
    // opacity 0. Sampled from the frame the curtain leaves.
    await page.waitForFunction(() => !document.querySelector('[data-load-curtain]'), undefined, { timeout: 12_000 })
    // The media FRAME, not the <img>. The photograph carries a resting `opacity-90` of its own — the
    // reference's images sit at 0.9 over black — so reading the image reports 0.9 whether the load
    // tween has run or not, which is exactly how a first version of this test passed vacuously.
    const frameOpacity = async () =>
      page.evaluate(() => {
        const el = document.querySelector('[data-hero] [data-hero-from]')
        return el ? parseFloat(getComputedStyle(el).opacity) : null
      })
    const atClear = await frameOpacity()
    expect(atClear, 'no hero media frame found').not.toBeNull()

    // And it does arrive.
    await expect.poll(async () => (await frameOpacity()) ?? 0, { timeout: 12_000 }).toBeGreaterThan(0.95)

    // Withheld at the moment the curtain cleared, not already fully painted. This is the assertion
    // that fails if the hero is simply revealed by the curtain lifting, which is what it used to do.
    expect(atClear!).toBeLessThan(0.6)
  })
})

test.describe('masked line reveals', () => {
  test('body prose is split per rendered line and slides up from a clip', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    const masks = page.locator('.appear-line-mask')
    // The reference carries 68 on its home page. A floor rather than an exact count, since our copy
    // is our own and wraps to its own line counts — but well above the zero we shipped with.
    await expect.poll(async () => masks.count(), { timeout: 10_000 }).toBeGreaterThan(30)

    const shape = await page.evaluate(() => {
      const mask = document.querySelector('.appear-line-mask')
      const line = mask?.querySelector('.appear-line')
      if (!mask || !line) return null
      return {
        overflow: getComputedStyle(mask).overflow,
        maskDisplay: getComputedStyle(mask).display,
        lineDisplay: getComputedStyle(line).display,
      }
    })
    expect(shape, 'no line/mask pair found').not.toBeNull()
    // `clip`, not `hidden` — what the reference sets, and the one that cannot become a scrollport.
    expect(shape!.overflow).toMatch(/^clip/)
    expect(shape!.maskDisplay).toBe('block')

    // A block well below the fold is still displaced before it enters, and settles after. Without
    // this the count above would pass against 90 masks that never move.
    const target = page.locator('[data-contact-intake] .appear-line').first()
    const before = await target.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).f)
    expect(Math.abs(before), 'a below-the-fold line is already at rest before entering').toBeGreaterThan(1)

    await target.scrollIntoViewIfNeeded()
    await expect
      .poll(async () => target.evaluate((el) => Math.abs(new DOMMatrixReadOnly(getComputedStyle(el).transform).f)), {
        timeout: 8000,
      })
      .toBeLessThan(0.5)
  })
})

test.describe('image reveal and parallax', () => {
  test('a black scrim uncovers the photograph rather than the photograph fading', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    const scrims = page.locator('[data-image-scrim]')
    await expect.poll(async () => scrims.count(), { timeout: 8000 }).toBeGreaterThan(5)

    // A frame well below the fold: its scrim is still opaque black, covering the photograph.
    const frame = page.locator('[data-testid="feature-image-2"]')
    const scrim = frame.locator('[data-image-scrim]')
    expect(await scrim.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(0, 0, 0)')
    expect(
      await scrim.evaluate((el) => parseFloat(getComputedStyle(el).opacity)),
      'the scrim is not covering a frame that has not entered yet'
    ).toBeGreaterThan(0.9)

    // Bring it in: the scrim goes transparent, and the photograph is never itself hidden.
    await frame.scrollIntoViewIfNeeded()
    await expect
      .poll(async () => scrim.evaluate((el) => parseFloat(getComputedStyle(el).opacity)), { timeout: 8000 })
      .toBeLessThan(0.02)
    expect(await frame.locator('img').evaluate((el) => parseFloat(getComputedStyle(el).opacity))).toBeGreaterThan(0.85)

    // 250ms once armed — the value that was 4.4x too slow. Read after the reveal, because the very
    // first cover deliberately suppresses its own transition so that a frame already on screen at
    // first paint is never seen fading TO black.
    expect(await scrim.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0.25s')
  })

  test('every image frame is scrubbed downward as it passes', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    // Sweep the document and count elements whose transform actually changes with scroll. Before
    // this landed the whole page had exactly one (the 3D ring) against the reference's fifty.
    const sample = async () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll('main *'))
          .map((el) => {
            const t = getComputedStyle(el).transform
            return t === 'none' ? null : t
          })
          .filter(Boolean)
          .join('|')
      )

    await scrollTo(page, 2000)
    const a = await sample()
    await scrollTo(page, 5000)
    const b = await sample()
    expect(a).not.toBe(b)

    // And the direction is DOWN, which is the half that was inverted. Measured on one frame across
    // its own pass: a positive and increasing translateY.
    const frame = page.locator('[data-testid="feature-image-1"]')
    // Document-relative, not `offsetTop` — that is measured against the nearest POSITIONED ancestor,
    // and these frames sit inside `relative` sections, so it reports a local offset of a few hundred
    // pixels and both samples then land outside the scrub's range reading an identical 0.
    const docTop = await frame.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
    const yOf = () =>
      frame.evaluate((el) => {
        const inner = el.querySelector('[data-image-parallax]')
        return inner ? new DOMMatrixReadOnly(getComputedStyle(inner).transform).f : null
      })

    await scrollTo(page, Math.max(0, docTop - 900))
    const early = await yOf()
    expect(early, 'no parallax wrapper inside the frame').not.toBeNull()
    await scrollTo(page, docTop + 600)
    const later = await yOf()
    expect(later!, 'the image parallax runs upward, or not at all').toBeGreaterThan(early!)
  })
})

test.describe('the hero carousel', () => {
  test('carries four slides and four progress tracks at 3:1:1:1', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    const widths = await page.evaluate(() => {
      const tracks = Array.from(document.querySelectorAll('[data-hero-progress] > *'))
      return tracks.map((t) => Math.round(t.getBoundingClientRect().width))
    })
    expect(widths.length, 'no slide progress tracks found').toBe(4)
    // 315 / 105 / 105 / 105 at 1440 — the active track is three times an inactive one, and the row
    // spans grid columns 1-6. Asserted as a ratio so it survives a viewport change.
    const [active, ...rest] = widths
    expect(active / rest[0]).toBeGreaterThan(2.4)
    expect(active / rest[0]).toBeLessThan(3.6)
    expect(rest[0]).toBeCloseTo(rest[1], -1)

    const slides = await page.locator('[data-hero] img').count()
    expect(slides).toBe(4)
  })

  test('the active track fills over its ten-second turn', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    const fill = () =>
      page.evaluate(() => {
        const el = document.querySelector('[data-hero-progress] [data-hero-fill]')
        return el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).a : null
      })

    const first = await fill()
    expect(first, 'no progress fill found').not.toBeNull()
    await page.waitForTimeout(2500)
    const second = await fill()
    expect(second!, 'the progress fill is static — the carousel clock is not running').toBeGreaterThan(first! + 0.05)
  })
})

test.describe('the fixed header', () => {
  test('is absent over the opening and arrives after it', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    // Polled, not read once: the hand-off is a 500ms cross-fade started by a ScrollTrigger toggle,
    // so the frame immediately after the scroll settles can still hold the previous value.
    const expectHeader = async (y: number, want: 'visible' | 'hidden') => {
      await scrollTo(page, y)
      await expect
        .poll(
          async () => {
            const o = await page.evaluate(() =>
              parseFloat(getComputedStyle(document.querySelector('header')!).opacity)
            )
            return want === 'visible' ? o > 0.95 : o < 0.05
          },
          { timeout: 6000 }
        )
        .toBe(true)
    }

    // Over the hero AND the chapter after it there is no fixed header, because that chapter's copy
    // sits in the same columns the nav occupies. This is the assertion that catches the nav being
    // printed through the manifesto text.
    await expectHeader(0, 'hidden')
    await expectHeader(1200, 'hidden')
    // Past the opening it is there and stays there.
    await expectHeader(2600, 'visible')
    await expectHeader(6000, 'visible')
    // And it is reversible.
    await expectHeader(300, 'hidden')
  })

  test('inverts its ink to match the band actually painted behind it', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    // Read what paints under the header band and what the header does about it, at every scroll
    // position past the opening. Route-based ink gave white-on-white across three bands.
    const seen = new Set<string>()
    for (const y of [2600, 4200, 5600, 8200, 9800, 12200]) {
      await scrollTo(page, y)
      await page.waitForTimeout(600) // the 500ms colour cross-fade
      const { ink, behind } = await page.evaluate(() => {
        const header = document.querySelector('header')!
        const painted =
          document
            .elementsFromPoint(200, 40)
            .map((e) => getComputedStyle(e).backgroundColor)
            .find((c) => c !== 'rgba(0, 0, 0, 0)') ?? 'none'
        return { ink: getComputedStyle(header).color, behind: painted }
      })
      const lum = (c: string) => {
        const [r, g, b] = (c.match(/\d+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number)
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      }
      // Light ink over a dark band, dark ink over a light one. The only thing asserted is that they
      // disagree — which is exactly what "white on white" fails.
      expect(
        lum(ink) > 0.5 ? lum(behind) < 0.5 : lum(behind) > 0.5,
        `header ink ${ink} is unreadable on ${behind} at scrollY ${y}`
      ).toBe(true)
      seen.add(lum(ink) > 0.5 ? 'light' : 'dark')
    }
    // It genuinely flips rather than happening to be right once.
    expect(seen.size, 'the header ink never changes across the page').toBe(2)

    expect(
      await page.evaluate(() => getComputedStyle(document.querySelector('header')!).transitionDuration)
    ).toContain('0.5s')
  })
})

test.describe('the closing slab', () => {
  test('reveals its graphic, reaching rest exactly at the document bottom', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    const payloadY = () =>
      page.evaluate(() => {
        const el = document.querySelector('[data-closing-payload]')
        return el ? new DOMMatrixReadOnly(getComputedStyle(el).transform).f : null
      })

    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)

    await scrollTo(page, Math.round(max * 0.9))
    const early = await payloadY()
    expect(early, 'no closing payload found').not.toBeNull()

    await scrollTo(page, max)
    const atEnd = await payloadY()

    // Parked a full slab-height out of frame for the whole document — which rendered as a blank
    // white band at the bottom of every page — is the failure this guards.
    expect(early!).toBeGreaterThan(50)
    expect(atEnd!).toBeLessThan(2)
  })
})

test.describe('the brand ornament', () => {
  // jsdom does not validate CSS values, so a unit test cannot catch this class of bug and did not:
  // `translateY(-max(0.42vw, 4px))` is invalid — a unary minus cannot precede a math function — so
  // the whole declaration was dropped, every dot computed `transform: none`, and the ring rendered
  // as a single 2.4px square in the header and inside every button. Only a real browser sees it.
  test('renders eight dots at eight distinct positions', async ({ page }) => {
    await page.setViewportSize(VIEWPORT)
    await page.goto('/')
    await openingOver(page)

    // The 8-child ring is nested inside the `aria-hidden` holder rather than being it, so the ring
    // itself carries no aria attribute. Matched by shape: eight children in an ornament-sized box.
    const rings = await page.evaluate(() =>
      Array.from(document.querySelectorAll('span'))
        .filter((e) => {
          if (e.children.length !== 8) return false
          const w = e.getBoundingClientRect().width
          return w > 4 && w < 60 && !!e.closest('[aria-hidden="true"]')
        })
        .map((e) => ({
          distinct: new Set(
            Array.from(e.children).map((c) => {
              const r = c.getBoundingClientRect()
              return `${r.x.toFixed(1)},${r.y.toFixed(1)}`
            })
          ).size,
          transform: getComputedStyle(e.children[0]).transform,
        }))
    )

    expect(rings.length, 'no 8-dot ornament found on the page').toBeGreaterThan(0)
    for (const r of rings) {
      expect(r.distinct, 'the ornament collapsed to fewer than 8 positions — its transform was rejected').toBe(8)
      expect(r.transform).not.toBe('none')
    }
  })
})
