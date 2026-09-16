import { test, expect } from '@playwright/test'

test('footer carries the real business details', async ({ page }) => {
  await page.goto('/')
  const f = page.locator('footer')
  await expect(f).toContainText('Mythri')
  await expect(f).toContainText('ECIL')
  await expect(f).toContainText('6301999971')
  await expect(f).toContainText('9676669923')
})

test('footer shows the RERA disclaimer required on Indian property marketing', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('footer')).toContainText(/RERA/i)
})

test('footer lists the three pillars', async ({ page }) => {
  await page.goto('/')
  const f = page.locator('footer')
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(f).toContainText(new RegExp(p, 'i'))
  }
})
