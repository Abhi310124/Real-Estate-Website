import { test, expect, type Page } from '@playwright/test'

/**
 * The home page's structure, in the order of the layout it follows, and the chrome around it.
 *
 * Structural rather than pixel assertions: the order of the sections, what each is built from, and
 * that every number and label on it traces to the data rather than to copy.
 */

const VIEWPORT = { width: 1440, height: 900 }

/** Waits out the opening: the loading panel unmounts itself when its wipe completes. */
async function openingOver(page: Page) {
  await page.waitForFunction(() => !document.querySelector('[data-load-curtain]'), undefined, { timeout: 20_000 })
}

test.describe('home', () => {
  test.use({ viewport: VIEWPORT })

  test('renders its sections in the layout order, then the footer', async ({ page }) => {
    await page.goto('/')
    const order = await page.evaluate(() => {
      const main = document.getElementById('main')!
      const marks: Array<[string, Element | null]> = [
        ['hero', main.querySelector('[data-hero]')],
        ['showcase', main.querySelector('[aria-roledescription="carousel"]')],
        ['created', main.querySelector('[data-project-card]')],
        ['statistics', main.querySelector('[data-testid="stat-counter"]')],
        ['values', main.querySelector('[data-value]')],
        ['enquiry', main.querySelector('#enquire')],
      ]
      return marks.map(([name, el]) => ({ name, top: el ? el.getBoundingClientRect().top + window.scrollY : null }))
    })
    for (const mark of order) expect(mark.top, `${mark.name} is missing`).not.toBeNull()
    const tops = order.map((m) => m.top as number)
    expect(tops).toEqual([...tops].sort((a, b) => a - b))
    await expect(page.locator('footer')).toHaveCount(1)
  })

  test('the hero points at a real project', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-hero] h1')).toBeVisible()
    const discover = page.locator('[data-hero]').getByRole('link', { name: /^discover /i })
    await expect(discover).toHaveAttribute('href', /^\/projects\/[a-z0-9-]+$/)
  })

  test('the portfolio grid holds four project cards and links to the listing', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#main [data-project-card]')).toHaveCount(4)
    await expect(page.getByRole('link', { name: /view all projects/i })).toHaveAttribute('href', '/projects')
  })

  test('the statistics are computed from the published portfolio', async ({ page }) => {
    // The first figure is the number of published projects, so it must equal the unfiltered listing.
    await page.goto('/projects')
    const published = await page.locator('[data-project-card]').count()
    await page.goto('/')
    await openingOver(page)
    const first = page.locator('[data-testid="stat-counter"]').first()
    await first.scrollIntoViewIfNeeded()
    await expect.poll(async () => Number((await first.textContent())?.replace(/\D/g, '')), { timeout: 8000 }).toBe(published)
  })

  test('the values are the owner’s three pillars', async ({ page }) => {
    await page.goto('/')
    for (const value of ['Develop', 'Design', 'Deliver']) {
      await expect(page.locator('[data-value] h3', { hasText: new RegExp(`^${value}$`) })).toHaveCount(1)
    }
  })

  test('the showcase turns one panel per arrow key', async ({ page }) => {
    await page.goto('/')
    await openingOver(page)
    const frame = page.locator('[aria-roledescription="carousel"]')
    await frame.scrollIntoViewIfNeeded()
    const counter = frame.locator('p.tnum')
    const before = await counter.textContent()
    await frame.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => counter.textContent(), { timeout: 4000 }).not.toBe(before)
  })
})

test.describe('header', () => {
  test.use({ viewport: VIEWPORT })

  test('marks the current page, and links to Contact instead of printing a number', async ({ page }) => {
    await page.goto('/about')
    const nav = page.getByRole('navigation', { name: 'Main' }).first()
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: 'Contact', exact: true })).toHaveAttribute('href', '/contact')
    await expect(page.locator('header a[href^="tel:"]')).toHaveCount(0)
  })

  test('"Enquire Now" glides to the enquiry block on a page that has one', async ({ page }) => {
    await page.goto('/')
    await openingOver(page)
    await page.getByRole('navigation', { name: 'Main' }).first().getByRole('link', { name: /enquire now/i }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect
      .poll(async () => page.evaluate(() => Math.abs(document.getElementById('enquire')!.getBoundingClientRect().top)), {
        timeout: 6000,
      })
      .toBeLessThan(160)
  })
})

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('opens, closes on Escape, and exposes its state', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: /open menu/i })
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await button.click()
    await expect(page.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true')
    const panelId = await page.getByRole('button', { name: /close menu/i }).getAttribute('aria-controls')
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(`[id="${panelId}"]`)).toBeHidden()
  })
})

test.describe('footer', () => {
  test('lists every published project, with the registration of those on sale', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')
    const projects = footer.getByRole('navigation', { name: 'Projects' }).getByRole('link')
    expect(await projects.count()).toBeGreaterThan(0)
    await expect(footer.getByText(/TS RERA : P\d+/).first()).toBeVisible()
    await expect(footer.getByRole('link', { name: 'rera.telangana.gov.in' })).toHaveAttribute('href', 'https://rera.telangana.gov.in')
  })
})

test.describe('renamed routes', () => {
  for (const [from, to] of [
    ['/studio', '/about'],
    ['/journal', '/blog'],
    ['/journal/designing-for-long-term-living', '/blog/designing-for-long-term-living'],
  ] as const) {
    test(`${from} permanently redirects to ${to}`, async ({ page }) => {
      const response = await page.request.get(from, { maxRedirects: 0 })
      expect(response.status()).toBe(308)
      expect(response.headers()['location']).toBe(to)
    })
  }
})
