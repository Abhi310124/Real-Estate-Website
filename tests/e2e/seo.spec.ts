import { test, expect } from '@playwright/test'

test('every route has a unique, non-empty title', async ({ page }) => {
  const titles: string[] = []
  for (const r of ['/', '/projects', '/about', '/contact', '/projects/bkr-lakeview-enclave']) {
    await page.goto(r)
    const t = await page.title()
    expect(t.length).toBeGreaterThan(10)
    titles.push(t)
  }
  expect(new Set(titles).size).toBe(titles.length)
})

test('project pages emit valid Residence/Place structured data', async ({ page }) => {
  await page.goto('/projects/bkr-lakeview-enclave')
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent()
  const json = JSON.parse(raw!)
  expect(json['@context']).toBe('https://schema.org')
  expect(json.name).toBeTruthy()
})

test('sitemap lists published projects only', async ({ page }) => {
  const xml = await (await page.request.get('/sitemap.xml')).text()
  expect(xml).toContain('/projects/bkr-lakeview-enclave')
  expect(xml).not.toContain('unpublished-sample')
  expect(xml).not.toContain('/motion-lab')
})

test('robots.txt keeps the Studio and motion lab out of the index', async ({ page }) => {
  const txt = await (await page.request.get('/robots.txt')).text()
  expect(txt).toMatch(/Disallow: \/studio/)
  expect(txt).toMatch(/Disallow: \/motion-lab/)
})

test('404 page offers a way back', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('link', { name: /home|projects/i }).first()).toBeVisible()
})
