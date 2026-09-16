import { test, expect } from '@playwright/test'

test('navigation works and lands on the target route', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /menu/i }).click()
  await page.getByRole('link', { name: /projects/i }).first().click()
  await expect(page).toHaveURL(/\/projects/)
  await expect(page.locator('h1')).toBeVisible()
})

test('the curtain clears itself and never traps the page', async ({ page }) => {
  await page.goto('/projects')
  const curtain = page.locator('[data-curtain]')
  await expect
    .poll(async () => curtain.evaluate((el) => getComputedStyle(el).pointerEvents), { timeout: 6000 })
    .toBe('none')
})

test('intro plays once per session, not on every navigation', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-intro]')).toHaveCount(1)
  await page.goto('/about')
  await expect(page.locator('[data-intro]')).toHaveCount(0)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('no intro, no curtain, content immediately visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-intro]')).toHaveCount(0)
    await expect(page.locator('h1')).toBeVisible()
  })
})
