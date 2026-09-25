import { test, expect } from '@playwright/test'

test('a buyer can go from the home page to an enquiry', async ({ page }) => {
  await page.route('**/api/lead', (r) => r.fulfill({ status: 200, json: { ok: true } }))

  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()

  await page.getByRole('link', { name: /view all projects/i }).click()
  await expect(page).toHaveURL(/\/projects/)

  await page.locator('[data-project-card] a').first().click()
  await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+/)
  await expect(page.getByText(/RERA/i).first()).toBeVisible()

  await page.locator('[name="name"]').first().fill('Test Buyer')
  await page.locator('[name="phone"]').first().fill('6301999971')
  await page.getByRole('button', { name: /send|submit|enquire/i }).first().click()
  await expect(page.getByRole('status')).toContainText(/thank|received|touch/i)
})

test('no placeholder image 404s', async ({ page }) => {
  // Four full page loads, each with a long scroll and a settle wait, and one of them (`/projects`)
  // is a dynamic route. That is comfortably over the 30s default when six workers share a single
  // `next start`. The work itself is not slow — there is just a lot of it in one test.
  test.setTimeout(90_000)

  const failed: string[] = []
  page.on('response', (r) => {
    if (r.status() === 404 && /\.(jpg|jpeg|png|webp|avif)/i.test(r.url())) failed.push(r.url())
  })
  for (const r of ['/', '/projects', '/projects/bkr-lakeview-enclave', '/about']) {
    await page.goto(r)
    await page.mouse.wheel(0, 4000)
    await page.waitForTimeout(1500)
  }
  expect(failed).toEqual([])
})

// Not from the brief. The 404 check above only sees images the browser actually requested, which
// misses any asset referenced by a fixture but never rendered — and `lib/data/mock.ts` is the
// single source of truth the generator script reads. Checking every referenced path over HTTP
// catches a fixture that gains an image without its file being generated, which would otherwise
// surface as a broken image on whichever page happens to render it first.
test('every asset referenced by the fixtures is actually served', async ({ page }) => {
  const { readFile } = await import('node:fs/promises')
  const source = await readFile('lib/data/mock.ts', 'utf8')
  const paths = [...new Set(source.match(/\/placeholder\/[A-Za-z0-9/._-]+/g) ?? [])]
  expect(paths.length).toBeGreaterThan(30)

  const broken: string[] = []
  for (const path of paths) {
    const response = await page.request.get(path)
    if (!response.ok()) broken.push(`${response.status()} ${path}`)
  }
  expect(broken).toEqual([])
})
