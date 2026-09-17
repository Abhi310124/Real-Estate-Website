import { test, expect } from '@playwright/test'

const SLUG = 'bkr-lakeview-enclave' // a mock project that HAS a masterPlan

test('plots are rendered as keyboard-reachable hotspots', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  const plots = page.locator('[data-plot]')
  expect(await plots.count()).toBeGreaterThan(2)
  await expect(plots.first()).toHaveAttribute('tabindex', '0')
})

test('selecting a plot reveals its size and availability', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  await page.locator('[data-plot]').first().click()
  const panel = page.locator('[data-plot-detail]')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(/available|blocked|sold/i)
})

test('a plot is selectable by keyboard alone', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  await page.locator('[data-plot]').first().focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-plot-detail]')).toBeVisible()
})

test('zoom controls change the plan scale', async ({ page }) => {
  await page.goto(`/projects/${SLUG}#masterplan`)
  const stage = page.locator('[data-plan-stage]')
  const scale = () => stage.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a)
  const before = await scale()
  await page.getByRole('button', { name: /zoom in/i }).click()
  // Ruling 4 (this suite's sixth timing-luck fix — no more may be added): the brief's
  // `await page.waitForTimeout(500)` followed by a single read of the scale passes on timing
  // luck, exactly the flake shape horizontal-showcase.spec.ts and others already had to poll
  // around. The assertion itself — scale must exceed `before` — is unchanged; only the
  // observation is polled instead of slept for.
  await expect.poll(scale, { timeout: 4000 }).toBeGreaterThan(before)
})

test('the section is skipped when a project has no masterplan', async ({ page }) => {
  await page.goto('/projects/bkr-skyline-residences') // a mock project WITHOUT a masterPlan
  await expect(page.locator('[data-plan-stage]')).toHaveCount(0)
})
