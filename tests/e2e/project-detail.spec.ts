import { test, expect } from '@playwright/test'

const SLUG = 'bkr-lakeview-enclave' // must match a published mock project

test('detail page states name, location and price', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('[data-project-hero]')).toContainText(/Hyderabad|Ghatkesar|Kollur|Tellapur|Shamirpet|Adibatla|ECIL/)
  await expect(page.locator('[data-project-hero]')).toContainText(/₹|Price on request/)
})

test('RERA number is displayed as legally required', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await expect(page.getByText(/RERA/i).first()).toBeVisible()
})

test('an unpublished project 404s rather than leaking', async ({ page }) => {
  const res = await page.goto('/projects/unpublished-sample')
  expect(res?.status()).toBe(404)
})

test('an unknown slug 404s', async ({ page }) => {
  const res = await page.goto('/projects/does-not-exist')
  expect(res?.status()).toBe(404)
})

test('section nav appears after the hero and jumps to sections', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.mouse.wheel(0, 1200)
  const nav = page.locator('[data-section-nav]')
  await expect(nav).toBeVisible()
  await nav.getByRole('link', { name: /plans/i }).click()

  // Asserts the real contract — that the click brings #plans to the top of the page — rather than
  // "scrollY exceeded 1200". That threshold was inherited from an older layout and became a
  // coincidence: the wheel above already lands at exactly 1200, so a jump that happened to end
  // there too failed a strict `>`. Measuring the section's own position is both deterministic and
  // what the feature actually promises, and it survives the page's section heights changing again.
  //
  // Tolerance is generous because the target carries `scroll-margin-top` to clear the fixed header
  // and this sticky bar, and Lenis eases the jump rather than snapping to it.
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.getElementById('plans')
          return el ? Math.abs(el.getBoundingClientRect().top) : Number.POSITIVE_INFINITY
        }),
      { timeout: 6000 }
    )
    .toBeLessThan(260)
})

test('section nav marks the section in view', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  // Navigate by clicking the nav's own Amenities link, rather than scripting a scroll.
  //
  // Two earlier approaches both failed for the same underlying reason. `scrollIntoViewIfNeeded()`
  // aligns to the NEAREST edge, which can leave a short section at the bottom of the viewport while
  // the taller one below fills most of the band — and the scrollspy marks whichever section
  // occupies the most of that band, so it was right and the test was wrong. Replacing it with
  // `window.scrollTo` did not help either: Lenis owns scrolling on this site and eases a native
  // scroll back out from under you, so the page never actually settled where the test put it.
  //
  // Clicking the link uses the app's own scroll path, honours the section's `scroll-margin-top`, and
  // tests something better than a synthetic scroll would: that using the nav marks the place it
  // took you to.
  const nav = page.locator('[data-section-nav]')
  await nav.getByRole('link', { name: /^amenities$/i }).click()
  await expect
    .poll(async () => page.locator('[data-section-nav] [aria-current="true"]').textContent(), { timeout: 8000 })
    .toMatch(/amenities/i)
})

test('key stats count up', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.locator('[data-key-stats]').scrollIntoViewIfNeeded()
  await expect
    .poll(async () => Number((await page.locator('[data-key-stats] [data-counter]').first().textContent())?.replace(/\D/g, '')), { timeout: 5000 })
    .toBeGreaterThan(0)
})
