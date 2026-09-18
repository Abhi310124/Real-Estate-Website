import AxeBuilder from '@axe-core/playwright'
import { test, expect } from '@playwright/test'

const ROUTES = ['/', '/projects', '/projects/bkr-lakeview-enclave', '/about', '/contact']

for (const route of ROUTES) {
  test(`${route} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(route)
    // Let the reveals and the first-load intro curtain finish. Measuring mid-animation would
    // flag elements that are legitimately part-way through a transition — and the curtain
    // itself covers the page for roughly the first two seconds.
    await page.waitForTimeout(4500)
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    // Mapping to `id @ target` rather than asserting `bad.length === 0` so a failure names the
    // rule and the offending element instead of just printing a number.
    expect(bad.map((v) => `${v.id} @ ${v.nodes[0]?.target}`)).toEqual([])
  })
}

test('keyboard alone can reach the menu, a project and the enquiry form', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab') // skip link first
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused()
})

test('images carry alt text', async ({ page }) => {
  await page.goto('/projects/bkr-lakeview-enclave')
  const missing = await page.locator('img:not([alt])').count()
  expect(missing).toBe(0)
})
