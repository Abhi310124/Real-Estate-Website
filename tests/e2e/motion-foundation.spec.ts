import { test, expect } from '@playwright/test'

test.describe('smooth scroll', () => {
  test('Lenis is active by default', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveClass(/lenis/)
  })
})

test.describe('prefers-reduced-motion: reduce', () => {
  test.use({ reducedMotion: 'reduce' })

  test('Lenis is not initialised', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/lenis-smooth/)
  })

  // Added beyond the brief: in the installed Lenis version, `lenis-smooth` is only
  // applied to <html> while a smooth-scroll animation is actively in flight (see
  // `isScrolling === 'smooth'` in lenis/dist/lenis.mjs) — not as a static class set at
  // construction time. A page load with no scroll interaction never reaches that state
  // regardless of whether Lenis was constructed, so the assertion above would pass
  // even against a build that ignores reduced motion entirely. The bare `lenis` class,
  // by contrast, is added unconditionally the moment `new Lenis()` runs — it is exactly
  // the positive assertion in the "smooth scroll" block above, negated here. This is
  // the test with real teeth: it fails if Lenis is constructed at all under reduced
  // motion, independent of any scroll interaction.
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
