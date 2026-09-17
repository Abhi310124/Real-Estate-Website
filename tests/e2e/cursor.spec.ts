import { test, expect } from '@playwright/test'

test('cursor mounts on pointer devices', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-cursor-root]')).toHaveCount(1)
})

test('cursor never intercepts clicks', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('[data-cursor-root]').evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none')
})

test('cursor adopts the label of the element under it', async ({ page }) => {
  await page.goto('/projects')
  await page.locator('[data-project-card]').first().hover()
  await expect.poll(async () => page.locator('[data-cursor-label]').textContent(), { timeout: 2000 }).toMatch(/view/i)
})

test.describe('touch', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } })
  test('no custom cursor on touch devices', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-cursor-root]')).toHaveCount(0)
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('no custom cursor', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-cursor-root]')).toHaveCount(0)
  })
})
