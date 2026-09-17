import { test, expect } from '@playwright/test'

const SLUG = 'bkr-lakeview-enclave'

test('plans are tabbed by unit type', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#plans`)
  const tabs = page.locator('[data-plans] [role="tab"]')
  expect(await tabs.count()).toBeGreaterThan(1)
  await tabs.nth(1).click()
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
})

test('a floor plan opens in a focus-trapped lightbox and Escape closes it', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#plans`)
  await page.locator('[data-plans] [data-zoom]').first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('gallery advances', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#gallery`)
  const g = page.locator('[data-gallery]')
  await g.scrollIntoViewIfNeeded()
  const first = await g.locator('.swiper-slide-active').getAttribute('data-slide')
  await g.getByRole('button', { name: /next/i }).click()
  // Ruling 7: no fixed wait — poll for the active slide to actually change instead of
  // sleeping a guessed 700ms. The assertion itself (must differ from `first`) is unchanged
  // from the brief; only how we wait for it is different.
  await expect
    .poll(async () => g.locator('.swiper-slide-active').getAttribute('data-slide'), { timeout: 4000 })
    .not.toBe(first)
})

test('amenities are listed with accessible names', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#amenities`)
  const items = page.locator('[data-amenities] li')
  expect(await items.count()).toBeGreaterThan(3)
  await expect(items.first()).toHaveText(/\S/)
})

test('specifications accordion expands', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#specifications`)
  const first = page.locator('[data-specs] button[aria-expanded]').first()
  await first.click()
  await expect(first).toHaveAttribute('aria-expanded', 'true')
})

test('construction updates are dated newest first', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#updates`)
  const dates = await page.locator('[data-updates] time').evaluateAll((els) =>
    els.map((e) => new Date(e.getAttribute('datetime')!).getTime()),
  )
  expect(dates).toEqual([...dates].sort((a, b) => b - a))
})
