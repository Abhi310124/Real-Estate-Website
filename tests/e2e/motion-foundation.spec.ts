import { test, expect } from '@playwright/test'

test.describe('smooth scroll', () => {
  test('Lenis is active by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/lenis/)
  })
})

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  // This replaces the brief's `not.toHaveClass(/lenis-smooth/)` assertion, which was
  // deleted rather than kept alongside it, for two compounding reasons.
  //
  // It could never fail: in the installed Lenis, `lenis-smooth` is applied to <html>
  // only while a smooth scroll is actively in flight (`isScrolling === 'smooth'` in
  // lenis/dist/lenis.mjs), never statically at construction — so a `page.goto` with no
  // scroll interaction passes even against a build that ignores reduced motion outright.
  //
  // And it was redundant even on its own terms: Playwright matches `toHaveClass(regex)`
  // against the entire class attribute, so `/lenis/` below already matches the substring
  // in `lenis-smooth`. This assertion is strictly stronger than the one it replaces, not
  // merely different — keeping both would have left a test that contributes no
  // information while reading like coverage, and invited a later cleanup to delete the
  // load-bearing one as the apparent duplicate.
  //
  // The bare `lenis` class is added unconditionally the moment `new Lenis()` runs, so
  // this fails if Lenis is constructed at all under reduced motion, with no scroll needed.
  test('Lenis is never constructed at all', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/lenis/)
  })

  test('no element is stranded at opacity 0', async ({ page }) => {
    await page.goto('/')
    const stranded = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,p,li,a,button')].filter((el) => {
        const s = getComputedStyle(el)
        return s.opacity === '0' && s.display !== 'none' && s.visibility !== 'hidden'
      }).length,
    )
    expect(stranded).toBe(0)
  })
})
