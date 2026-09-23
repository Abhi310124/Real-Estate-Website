import { test, expect } from '@playwright/test'

test('about page introduces the Managing Director', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByText(/B Karthik Reddy/i)).toBeVisible()
  await expect(page.getByText(/Managing Director/i).first()).toBeVisible()
})

test('about page sets out the three pillars', async ({ page }) => {
  await page.goto('/about')
  for (const p of ['Develop', 'Design', 'Deliver']) {
    await expect(page.getByText(new RegExp(p, 'i')).first()).toBeVisible()
  }
})

// Scoped to `#main`: the footer carries the office address and both numbers on every page too, so an
// unscoped query matches twice. The numbers are shown grouped for reading ("+91 6301 999 971"), so the
// pattern allows the spaces; the `tel:` href is asserted to dial the ungrouped number.
test('contact page shows the real office address and both numbers', async ({ page }) => {
  await page.goto('/contact')
  const main = page.locator('#main')
  await expect(main.getByText(/Mythri Apartment/i)).toBeVisible()
  await expect(main.getByText(/ECIL/i)).toBeVisible()
  await expect(main.getByRole('link', { name: /6301\s?999\s?971/ })).toHaveAttribute('href', 'tel:+916301999971')
  await expect(main.getByRole('link', { name: /9676\s?669\s?923/ })).toHaveAttribute('href', 'tel:+919676669923')
})

test('every contact field has a real label', async ({ page }) => {
  await page.goto('/contact')
  for (const n of ['name', 'phone']) {
    await expect(page.locator(`[name="${n}"]`)).toHaveAccessibleName(/.+/)
  }
})
