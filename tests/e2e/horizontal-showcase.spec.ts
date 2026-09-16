import { test, expect } from '@playwright/test'

test('showcase renders every featured project as a reachable link', async ({ page }) => {
  await page.goto('/')
  const cards = page.locator('[data-showcase] [data-showcase-card]')
  expect(await cards.count()).toBeGreaterThanOrEqual(3)
  await expect(cards.first().getByRole('link')).toHaveAttribute('href', /\/projects\//)
})

test('track translates horizontally as the page scrolls', async ({ page }) => {
  await page.goto('/')
  const track = page.locator('[data-showcase-track]')
  await page.locator('[data-showcase]').scrollIntoViewIfNeeded()
  const x = () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)
  const before = await x()
  await page.mouse.wheel(0, 1500)
  // Ruling 5: the brief's `await page.waitForTimeout(1200)` followed by a single read of the
  // transform passes on timing luck. This motion is Lenis-smoothed AND `scrub: 1`-eased, so its
  // settle time is a function of machine speed and of Lenis's `lerp`, neither of which a fixed
  // 1200ms sleep is entitled to assume — the same fixed-wait flake shape header.spec.ts and
  // motion-primitives.spec.ts already had to poll around. What is asserted is unchanged from the
  // brief (the translate must have DECREASED from `before`); only the observation is polled.
  await expect.poll(x, { timeout: 6000 }).toBeLessThan(before)
})

// Not from the brief. The brief's four tests prove the track moves; none of them proves the pin
// ever lets go, and a pinned section that never releases is the single worst way this component
// can fail — it silently traps the page with the footer permanently out of reach. This test
// covers both halves of the pin's contract in one pass: that it engages at all, and that
// ordinary scrolling still gets past it.
test('the pin engages and then releases, leaving the page below reachable', async ({ page }) => {
  await page.goto('/')
  const section = page.locator('[data-showcase]')
  const footer = page.locator('footer')

  // Gate on the pinned path having actually committed. Without this the test could pass
  // vacuously against a build with no pin at all (nothing pinned trivially traps nothing), so
  // the geometric assertions below would be measuring an empty claim.
  await expect(section).toHaveAttribute('data-showcase-active', '', { timeout: 10_000 })

  // The section's own document offset stays put across the pin, because GSAP's pin-spacer holds
  // its place in the flow — so this is a stable origin to measure scroll offsets against.
  // `travel` is the component's own contract for the pin's length (Ruling 1's expression), which
  // makes "the pin is as long as the track needs" part of what is being asserted.
  const geometry = await page.evaluate(() => {
    const el = document.querySelector('[data-showcase]')!
    const track = document.querySelector('[data-showcase-track]')!
    return {
      sectionTop: el.getBoundingClientRect().top + window.scrollY,
      travel: track.scrollWidth - window.innerWidth,
    }
  })
  // Guards the four samples below from being vacuous: with a track that barely overflows there
  // would be no meaningful pin range for them to land in.
  expect(geometry.travel).toBeGreaterThan(200)

  // Driven by direct scroll positions rather than by counting wheel gestures. A first version of
  // this test wheeled in 500px steps and filtered the samples that happened to land inside the
  // pin — measured against the real build, exactly 2 of 48 did, i.e. it passed its
  // `toBeGreaterThan(1)` by one sample. Lenis eases the wheel delta, so how many samples land in
  // range is a function of machine speed: the assertion was one slow frame away from failing for
  // no code reason at all. Naming the offsets makes the sample count fixed at four.
  const pinnedAt: number[] = []
  for (const fraction of [0.05, 0.35, 0.65, 0.95]) {
    const target = geometry.sectionTop + Math.round(geometry.travel * fraction)
    await page.evaluate((y) => window.scrollTo(0, y), target)
    // Polled, not slept: the pin's fixed/unfixed flip happens on ScrollTrigger's next update.
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => Math.abs(document.querySelector('[data-showcase]')!.getBoundingClientRect().top) <= 1,
          ),
        { timeout: 4000 },
      )
      .toBe(true)
    pinnedAt.push(await page.evaluate(() => window.scrollY))
  }
  // "Pinned" asserted from geometry, not from GSAP's implementation: the section's top edge holds
  // at the viewport top across four DIFFERENT document scroll offsets. That is the definition of
  // pinning and stays true whichever `pinType` ScrollTrigger picks (position: fixed vs. a
  // transform), so this does not break if GSAP changes how it pins.
  expect(new Set(pinnedAt).size).toBe(4)

  // ...and released. Wheel gestures for this half on purpose — it is the user-level claim ("I can
  // still scroll to the bottom of this page"), and it is the assertion that would catch a trapped
  // page. Bounded loop, exits as soon as the footer is on screen.
  let footerReached = false
  for (let i = 0; i < 40 && !footerReached; i++) {
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(80)
    footerReached = await footer.evaluate((el) => el.getBoundingClientRect().top < window.innerHeight)
  }
  expect(footerReached).toBe(true)
  // ...and the section is demonstrably no longer pinned, rather than the footer merely having
  // grown into view underneath a still-stuck section: a negative top is the direct contradiction
  // of the `top === 0` the four samples above asserted. (An earlier version of this line asserted
  // `bottom < 0` and failed at 466px — the footer's top crosses into the viewport while the last
  // ~460px of the section is still on screen, so "fully scrolled past" was never the claim that
  // release actually implies.)
  expect(await section.evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(-10)
})

test.describe('touch viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  test('falls back to native scroll-snap without pinning', async ({ page }) => {
    await page.goto('/')
    // Ruling 3, verified rather than assumed: the component selects its fallback on
    // `matchMedia('(pointer: coarse)')`, so this fixture only exercises the touch path if it
    // really does report a coarse pointer. Asserted here so the assumption is a tested
    // invariant of the fixture instead of a claim in a report.
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true)
    const track = page.locator('[data-showcase-track]')
    const overflowX = await track.evaluate((el) => getComputedStyle(el).overflowX)
    expect(['auto', 'scroll']).toContain(overflowX)
    // The other half of "without pinning" — the pinned path must never have committed here.
    await expect(page.locator('[data-showcase]')).not.toHaveAttribute('data-showcase-active', '')
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('cards remain visible and scrollable without pinning', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-showcase-card]').first()).toBeVisible()
    // Added to the brief's single visibility assertion so the test's own name holds: "and
    // scrollable" was never checked, which left the reduced-motion path able to regress to a
    // clipped, unreachable row of cards while still passing.
    const overflowX = await page
      .locator('[data-showcase-track]')
      .evaluate((el) => getComputedStyle(el).overflowX)
    expect(['auto', 'scroll']).toContain(overflowX)
  })
})
