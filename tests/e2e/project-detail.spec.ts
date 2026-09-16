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
  await expect.poll(async () => page.evaluate(() => window.scrollY), { timeout: 4000 }).toBeGreaterThan(1200)
})

test('section nav marks the section in view', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.locator('#amenities').scrollIntoViewIfNeeded()
  await expect
    .poll(async () => page.locator('[data-section-nav] [aria-current="true"]').textContent(), { timeout: 4000 })
    .toMatch(/amenities/i)
})

test('key stats count up', async ({ page }) => {
  await page.goto(`/projects/${SLUG}`)
  await page.locator('[data-key-stats]').scrollIntoViewIfNeeded()
  await expect
    .poll(async () => Number((await page.locator('[data-key-stats] [data-counter]').first().textContent())?.replace(/\D/g, '')), { timeout: 5000 })
    .toBeGreaterThan(0)
})
