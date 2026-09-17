import { test, expect } from '@playwright/test'

test('about page introduces the Managing Director', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByText(/B Karthik Reddy/i)).toBeVisible()
  await expect(page.getByText(/Managing Director/i)).toBeVisible()
})

test('about page expands the three pillars', async ({ page }) => {
  await page.goto('/about')
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(page.getByText(new RegExp(p, 'i')).first()).toBeVisible()
  }
})

test('contact page shows the real office address and both numbers', async ({ page }) => {
  await page.goto('/contact')
  await expect(page.getByText(/Mythri Apartment/i)).toBeVisible()
  await expect(page.getByText(/ECIL/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /6301999971/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /9676669923/ })).toBeVisible()
})

test('every contact field has a real label', async ({ page }) => {
  await page.goto('/contact')
  for (const n of ['name', 'phone']) {
    await expect(page.locator(`[name="${n}"]`)).toHaveAccessibleName(/.+/)
  }
})
