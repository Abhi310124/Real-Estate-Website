import { test, expect } from '@playwright/test'

test('all five categories link into filtered listings', async ({ page }) => {
  await page.goto('/')
  const grid = page.locator('[data-categories]')
  await grid.scrollIntoViewIfNeeded()
  const links = grid.getByRole('link')
  expect(await links.count()).toBe(5)
  await expect(links.first()).toHaveAttribute('href', /\/projects\?category=/)
})

test('stats counters reach non-zero values', async ({ page }) => {
  await page.goto('/')
  const stats = page.locator('[data-stats]')
  await stats.scrollIntoViewIfNeeded()
  await expect
    .poll(async () => Number((await stats.locator('[data-counter]').first().textContent())?.replace(/\D/g, '')), { timeout: 5000 })
    .toBeGreaterThan(0)
})

test('alternating chapters put navy against ivory', async ({ page }) => {
  await page.goto('/')
  const bg = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(await bg('[data-stats]')).not.toBe(await bg('[data-categories]'))
})

test('CTA band invites an enquiry', async ({ page }) => {
  await page.goto('/')
  const cta = page.locator('[data-cta]')
  await cta.scrollIntoViewIfNeeded()
  await expect(cta.getByRole('link', { name: /enquire|contact|talk/i }).first()).toBeVisible()
})
