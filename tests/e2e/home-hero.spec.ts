import { test, expect } from '@playwright/test'

test('hero states the brand promise', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText(/Redefining|Excellence|Address/i)
  await expect(page.getByText(/REDEFINING REAL ESTATE EXCELLENCE/i).first()).toBeVisible()
})

test('hero offers both primary actions', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /view projects/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /enquire/i }).first()).toBeVisible()
})

test('hero image is a priority LCP candidate', async ({ page }) => {
  await page.goto('/')
  const img = page.locator('section[data-hero] img').first()
  await expect(img).toBeVisible()
  expect(await img.getAttribute('loading')).not.toBe('lazy')
})

test('pillars strip names all three', async ({ page }) => {
  await page.goto('/')
  const strip = page.locator('[data-pillars]')
  await strip.scrollIntoViewIfNeeded()
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(strip).toContainText(new RegExp(p, 'i'))
  }
})
