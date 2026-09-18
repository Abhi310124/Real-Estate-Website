import { test, expect } from '@playwright/test'

const ROUTES = ['/', '/projects', '/projects/bkr-lakeview-enclave', '/about', '/contact']

test('home page LCP stays under 2.5s', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' })
  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        new PerformanceObserver((l) => {
          const e = l.getEntries()
          resolve(e[e.length - 1].startTime)
        }).observe({ type: 'largest-contentful-paint', buffered: true })
        // Resolves to a deliberately absurd number rather than hanging, so a missing entry
        // fails the budget loudly instead of timing the whole test out with no diagnosis.
        setTimeout(() => resolve(99999), 6000)
      }),
  )
  expect(lcp).toBeLessThan(2500)
})

test('layout shift stays under 0.05', async ({ page }) => {
  await page.goto('/')
  await page.mouse.wheel(0, 3000)
  await page.waitForTimeout(2500)
  const cls = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0
        new PerformanceObserver((l) => {
          for (const e of l.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
            if (!e.hadRecentInput) total += e.value
          }
        }).observe({ type: 'layout-shift', buffered: true })
        setTimeout(() => resolve(total), 1200)
      }),
  )
  expect(cls).toBeLessThan(0.05)
})

test('no console errors on any route', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  for (const r of ROUTES) {
    await page.goto(r)
    await page.waitForTimeout(1500)
  }
  expect(errors).toEqual([])
})

// Not from the brief. A wrong `sizes` on a `fill` image is the single most common cause of a
// blown LCP in this stack — Next requests a candidate from the srcset based on `sizes`, so a
// `sizes` that overstates the rendered width downloads a far larger file than the layout needs,
// and nothing about the page looks wrong while it happens. Asserting every fill image declares
// one catches the omission that the LCP budget would only punish intermittently.
test('every fill image declares a sizes attribute', async ({ page }) => {
  const missing: string[] = []
  for (const route of ROUTES) {
    await page.goto(route)
    await page.waitForTimeout(1500)
    const found = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img[data-nimg="fill"]'))
        .filter((img) => !img.getAttribute('sizes'))
        .map((img) => (img as HTMLImageElement).currentSrc || img.getAttribute('src') || '(unknown)'),
    )
    missing.push(...found.map((src) => `${route} :: ${src}`))
  }
  expect(missing).toEqual([])
})
