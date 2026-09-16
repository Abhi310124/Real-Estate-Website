import { test, expect } from '@playwright/test'

test('heading text stays readable as text for a11y and copy-paste', async ({ page }) => {
  await page.goto('/')
  const h1 = page.locator('h1').first()
  await expect(h1).toHaveText(/\S/)
  const words = h1.locator('[data-word]')
  expect(await words.count()).toBeGreaterThan(1)
})

// Ruling 2 (task-4-report.md): interword spacing comes from real space text nodes
// between masks, not CSS word-spacing, specifically so the accessible/copy-pasted text
// is never a run-on token. This is the test that proves that holds — it fails loudly if
// the spacing regresses to "RedefiningRealEstateExcellence".
test('heading text is the exact expected copy, with real spaces between words', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1').first()).toHaveText('Redefining Real Estate Excellence')
})

test('each word sits inside an overflow-hidden mask', async ({ page }) => {
  await page.goto('/')
  const overflow = await page.locator('h1 [data-word-mask]').first().evaluate((el) => getComputedStyle(el).overflow)
  expect(overflow).toBe('hidden')
})

test('words settle at translateY(0) after the reveal', async ({ page }) => {
  await page.goto('/')
  const inner = page.locator('h1 [data-word]').first()
  await expect
    .poll(async () => inner.evaluate((el) => getComputedStyle(el).transform), { timeout: 4000 })
    .toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/)
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('words are visible immediately and untransformed', async ({ page }) => {
    await page.goto('/')
    const inner = page.locator('h1 [data-word]').first()
    expect(await inner.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    expect(await inner.evaluate((el) => getComputedStyle(el).transform)).toMatch(/matrix\(1, 0, 0, 1, 0, 0\)|none/)
  })
})
