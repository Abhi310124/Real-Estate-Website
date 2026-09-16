import { test, expect } from '@playwright/test'

test('header exposes the primary routes through the mega-menu', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /menu/i }).click()
  const nav = page.getByRole('navigation', { name: /main/i })
  for (const label of ['Projects', 'About', 'Contact']) {
    await expect(nav.getByRole('link', { name: new RegExp(label, 'i') })).toBeVisible()
  }
})

test('Escape closes the mega-menu and returns focus to its trigger', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: /menu/i })
  await trigger.click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: /main/i })).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('header becomes opaque after scrolling past the hero', async ({ page }) => {
  // Ruling 7 deviation #1: the brief points this test at `/`, but Batch B's home page
  // (app/page.tsx) is still just Task 4's single above-the-fold headline — there is
  // nowhere near 1200px of scrollable height to prove a "scrolled past the hero" state
  // with. `/motion-lab` already stacks multiple h-screen sections for exactly this kind
  // of scroll-distance test (see motion-primitives.spec.ts), so this test targets that
  // route instead. Task 10 gives `/` a full-height hero; re-point this back to `/` then
  // if preferred.
  await page.goto('/motion-lab')
  const header = page.locator('header')
  const before = await header.evaluate((el) => getComputedStyle(el).backgroundColor)
  await page.mouse.wheel(0, 1200)
  // Ruling 7 deviation #2: the brief's `await page.waitForTimeout(900)` followed by a
  // single `getComputedStyle` read assumes Lenis's eased scroll always settles inside a
  // fixed 900ms window. That is exactly the class of fixed-wait flake this suite polls
  // around everywhere else (see the `expect.poll` usage throughout motion-primitives.spec.ts
  // for the same Lenis-smoothed-scroll timing concern) — a slower CI runner or a change to
  // Lenis's `lerp` easing could blow past 900ms with no code regression at all. Polling for
  // the background colour to actually differ proves the same thing without hard-coding a
  // settle time.
  await expect
    .poll(async () => header.evaluate((el) => getComputedStyle(el).backgroundColor), { timeout: 5000 })
    .not.toBe(before)
})

test('the WhatsApp action deep-links to a real BKR INFRA number', async ({ page }) => {
  await page.goto('/')
  const wa = page.getByRole('link', { name: /whatsapp/i })
  await expect(wa).toHaveAttribute('href', /wa\.me\/91(6301999971|9676669923)/)
})

test('the call action uses a tel: link', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /call/i }).first()).toHaveAttribute('href', /^tel:\+91/)
})

// The five tests above are the brief's given coverage (verbatim, aside from the two Ruling 7
// deviations documented inline). Ruling 10 lists several more hard a11y requirements for the
// mega-menu that those five tests never exercise directly — aria-expanded, the body scroll
// lock, and the reduced-motion collapse of the staggered reveal. The two tests below are my
// own addition, not from the brief, to give those requirements real coverage instead of
// resting on code review alone. (The focus-trap requirement is not covered by an automated
// test in this batch — see the final report for why.)
test('menu trigger tracks aria-expanded and locks body scroll while open', async ({ page }) => {
  await page.goto('/')
  const trigger = page.getByRole('button', { name: /menu/i })

  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')

  await trigger.click()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden')

  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('mega-menu links render fully visible with no staggered delay', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /menu/i }).click()
    const nav = page.getByRole('navigation', { name: /main/i })
    // Under reduced motion the stagger reveal must never run (same useReducedMotion()
    // gate as Reveal/SplitWords elsewhere in this codebase) — every link should already
    // sit at full opacity instead of settling there over a tween.
    const opacities = await nav
      .locator('[data-menu-link]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))
    expect(opacities.length).toBeGreaterThan(0)
    expect(opacities.every((o) => o === '1')).toBe(true)
  })
})
