import { test, expect } from '@playwright/test'

test('counter counts up to its target', async ({ page }) => {
  await page.goto('/motion-lab')
  const c = page.locator('[data-testid="counter"]')
  await c.scrollIntoViewIfNeeded()
  await expect.poll(async () => (await c.textContent())?.trim(), { timeout: 5000 }).toBe('90')
})

test('image reveal ends fully unclipped', async ({ page }) => {
  await page.goto('/motion-lab')
  const wrap = page.locator('[data-testid="image-reveal"]')
  await wrap.scrollIntoViewIfNeeded()
  // Widened from the brief's given `(px)?` to `(px|%)?`: the brief's own Interfaces
  // line states the end state as `inset(0 0 0 0)`, but its Step 4 code sample animates
  // to `inset(0 0 0% 0)` (a stray `%`) — kept in ImageReveal.tsx as given, since it
  // matches the start value's unit (`100%`) on the same slot, which is the correct
  // choice for a clean GSAP string interpolation. Real Chromium then serializes the
  // settled computed style as "inset(0px 0px 0%)": equal 0px sides collapse, but the
  // 0% token is kept distinct from 0px rather than normalized away. The original
  // regex never anticipated a "%" zero-component, so it could never match this
  // (correct) implementation's real output.
  await expect
    .poll(async () => wrap.evaluate((el) => getComputedStyle(el).clipPath), { timeout: 5000 })
    .toMatch(/inset\(0(px|%)?( 0(px|%)?){0,3}\)|none/)
})

test('marquee duplicates its track for a seamless loop', async ({ page }) => {
  await page.goto('/motion-lab')
  // useReducedMotion() (frozen Task 3 interface) returns true on every first render by
  // design, so SSR and the client's first paint agree before any media query can be
  // read. Marquee's non-reduced two-track structure can only commit once that hook's
  // own effect confirms motion is allowed — a genuine one-render settle window, the
  // same class of delay the split-words settle test already tolerates via
  // expect.poll. The assertion's target is unchanged from the brief (still exactly 2,
  // per Ruling 5) — only its execution is polled instead of read once.
  await expect
    .poll(async () => page.locator('[data-testid="marquee"] [data-marquee-track]').count(), { timeout: 5000 })
    .toBe(2)
})

// Ruling 8: end-to-end proof that a real wheel gesture advances Lenis-driven scroll and that a
// scrub-linked transform tracks it. What each half of that does and does NOT establish:
//
//   (a) window.scrollY climbing IS load-bearing for the ticker wire,
//       gsap.ticker.add(t => lenis.raf(t * 1000)). Lenis's own autoRaf defaults to false, so
//       nothing else drives its internal loop: delete that line and Lenis never advances, so
//       scrollY stays frozen no matter how long we wait. This assertion is the only coverage
//       that wire has.
//
//   (b) the parallax transform changing proves a scrub-linked ScrollTrigger tracks real scroll
//       end to end — genuinely worth having — but it CANNOT isolate the
//       lenis.on('scroll', ScrollTrigger.update) wire, and must not be read as doing so. This
//       was verified by experiment: with that line fully commented out, this test still passes.
//       ScrollTrigger registers its own wheel/scroll listeners when the plugin initialises, and
//       those catch the native scroll event Lenis fires, so the scrub keeps updating without the
//       explicit wire ever being called.
//
// The lenis.on wire is therefore guarded structurally instead, in
// tests/unit/lenis-provider.test.tsx, which asserts the call is made at all. A behavioural test
// cannot see the difference here; only a structural one can.
test('a real wheel gesture advances scroll and a scrub-linked transform tracks it', async ({ page }) => {
  await page.goto('/motion-lab')
  const parallax = page.locator('[data-testid="parallax"]')
  await parallax.scrollIntoViewIfNeeded()

  const scrollYBefore = await page.evaluate(() => window.scrollY)
  const transformBefore = await parallax.evaluate((el) => getComputedStyle(el).transform)

  // A real wheel gesture, not page.evaluate(() => window.scrollTo(...)): Lenis
  // intercepts the wheel event itself and drives scroll virtually, so a native
  // scrollTo call would bypass Lenis entirely and prove nothing about either half of
  // the bridge. Dispatched five times to accumulate a decisive cumulative delta well
  // past Lenis's smoothing lag, rather than gambling on a single event being enough.
  for (let i = 0; i < 5; i++) {
    await page.mouse.wheel(0, 300)
  }

  // (a) the ticker wire — the only coverage it has.
  await expect
    .poll(async () => page.evaluate(() => window.scrollY), { timeout: 5000 })
    .toBeGreaterThan(scrollYBefore)

  // (b) a scrub-linked trigger tracks that scroll. Not an isolation of the lenis.on wire — see
  //     the note above.
  await expect
    .poll(async () => parallax.evaluate((el) => getComputedStyle(el).transform), { timeout: 5000 })
    .not.toBe(transformBefore)
})

// Ruling 9: SplitWords' own spec (split-words.spec.ts) can only prove the reveal
// finishes — its one instance is Task 4's above-the-fold h1, whose ScrollTrigger
// (start: 'top 82%', once: true) has already fired by the time the page finishes
// loading, so there is no "before" state left to observe there. This second instance is
// mounted several viewports below the fold specifically so both halves of the reveal are
// observable in one test: displaced before the trigger can have fired, settled after.
test('SplitWords below the fold stays displaced until scrolled into view, then settles', async ({ page }) => {
  await page.goto('/motion-lab')
  const word = page.locator('[data-testid="split-words-below-fold"] [data-word]').first()

  // Polled rather than read once, for exactly the reason the marquee count above is
  // polled: useReducedMotion() returns true on its first render by design, so on first
  // paint the words have not been hidden yet and this transform is still the identity
  // matrix. A synchronous read races that one-render window — it passes only by timing
  // luck, and fails the moment a slower machine or a busier worker widens the gap.
  //
  // Polling for the displaced state also makes the assertion stronger, not merely safer:
  // it positively proves the hide ran, instead of catching it after the fact. It cannot
  // hang in the happy path, because `once: true` has not fired for a below-fold element,
  // so once displaced the words stay displaced until scrolled to. And a static
  // implementation that animates nothing times out here — which is precisely the
  // discrimination this test exists to provide.
  await expect
    .poll(async () => word.evaluate((el) => getComputedStyle(el).transform), { timeout: 5000 })
    .not.toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/)

  await word.scrollIntoViewIfNeeded()

  await expect
    .poll(async () => word.evaluate((el) => getComputedStyle(el).transform), { timeout: 5000 })
    .toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('counter shows its final value with no animation', async ({ page }) => {
    await page.goto('/motion-lab')
    await expect(page.locator('[data-testid="counter"]')).toHaveText('90')
  })

  test('revealed content is visible', async ({ page }) => {
    await page.goto('/motion-lab')
    expect(await page.locator('[data-testid="reveal"]').evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })

  // Ruling 5: the animated path's track-count assertion (toBe(2), above) only proves
  // something if there's a discriminating counterpart under reduced motion. Asserting
  // toBe(1) here — not toBeGreaterThanOrEqual(1), which would pass even if reduced
  // motion were silently ignored and both tracks rendered anyway — is what makes the
  // pair meaningful: together they prove the DOM shape actually changes.
  test('marquee renders a single static track with no animation', async ({ page }) => {
    await page.goto('/motion-lab')
    expect(await page.locator('[data-testid="marquee"] [data-marquee-track]').count()).toBe(1)
  })
})
