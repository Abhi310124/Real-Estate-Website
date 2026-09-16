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
