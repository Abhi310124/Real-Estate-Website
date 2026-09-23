import { test, expect, type Page } from '@playwright/test'

/**
 * The motion the layout is built on, asserted against the values decoded from its own interaction
 * config (Webflow IX2) and the ones this site adds:
 *
 *   loader          % counter 0 → 100, a 2px rule sliding in, then the panel wiping off to the right
 *                   (translateX 0 → 100%); the full opening once per session on the home page only
 *   scroll hold     engaged from the server-rendered markup, released as the wipe begins
 *   route wipe      a navy panel that covers on navigation and wipes off the same way
 *   thread          the gradient track scrubbed with the page
 *   image reveal    a tinted block dropped off the photograph (translateY 0 → 100%)
 *   card hover      an 8px gradient bar drawn across the photograph's foot
 *   ring button     the gradient ring's angle swung 90° → 200° on hover
 *   doors           the enquiry frame's halves narrowing from 50% to 25% as it arrives
 */

const VIEWPORT = { width: 1440, height: 900 }

async function openingOver(page: Page) {
  await page.waitForFunction(() => !document.querySelector('[data-load-curtain]'), undefined, { timeout: 20_000 })
}

test.describe('the first-load sequence', () => {
  test.use({ viewport: VIEWPORT })

  test('holds scroll from first paint, counts to 100%, releases as the wipe begins, then clears', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' })
    const t0 = Date.now()

    // The hold is in the server-rendered markup, so its presence at first paint is a fact rather
    // than a race against a chunk.
    await page.waitForFunction(() => !!document.documentElement)
    expect(await page.evaluate(() => document.documentElement.classList.contains('load-locked'))).toBe(true)

    let sawHundred = false
    let releasedAt: number | null = null
    let curtainGoneAt: number | null = null
    while (Date.now() - t0 < 15_000) {
      const s = await page.evaluate(() => ({
        held: document.documentElement.classList.contains('load-locked'),
        counter: document.querySelector('[data-load-counter]')?.textContent ?? null,
        curtain: !!document.querySelector('[data-load-curtain]'),
      }))
      const at = Date.now() - t0
      if (s.counter === '100%') sawHundred = true
      if (!s.held && releasedAt === null) releasedAt = at
      if (!s.curtain && curtainGoneAt === null) curtainGoneAt = at
      if (releasedAt !== null && curtainGoneAt !== null) break
      await page.waitForTimeout(50)
    }

    expect(sawHundred, 'the counter never reached 100%').toBe(true)
    expect(releasedAt, 'scroll is never released').not.toBeNull()
    expect(curtainGoneAt, 'the panel never leaves the DOM').not.toBeNull()
    // Released as the panel starts to move, so the page is scrollable the instant it begins to appear,
    // and the panel only unmounts once its wipe has finished.
    expect(releasedAt!).toBeLessThanOrEqual(curtainGoneAt!)
    expect(releasedAt!).toBeGreaterThan(1200)
  })

  test('the panel leaves by sliding off to the right, not by fading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' })
    await page.waitForSelector('[data-load-curtain]')
    // Sample until the wipe is under way, then check it is a horizontal translation at full opacity.
    const sample = await page.waitForFunction(
      () => {
        const el = document.querySelector<HTMLElement>('[data-load-curtain]')
        if (!el) return null
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
        return m.m41 > 50 ? { x: m.m41, y: m.m42, opacity: getComputedStyle(el).opacity } : null
      },
      undefined,
      { timeout: 15_000, polling: 30 }
    )
    const value = (await sample.jsonValue()) as { x: number; y: number; opacity: string }
    expect(value.y).toBe(0)
    expect(value.opacity).toBe('1')
  })

  test('a second home-page load in the session plays the quick wipe only', async ({ page }) => {
    await page.goto('/')
    await openingOver(page)
    await page.reload({ waitUntil: 'commit' })
    await page.waitForSelector('[data-load-counter]')
    // The counter and rule are hidden for the quick wipe; the panel alone slides away.
    await expect
      .poll(async () => page.evaluate(() => getComputedStyle(document.querySelector('[data-load-counter]')!).opacity), {
        timeout: 8000,
      })
      .toBe('0')
    await openingOver(page)
  })

  test('a wheel gesture during the opening does not move the page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' })
    await page.waitForFunction(() => !!document.documentElement?.classList.contains('load-locked'))
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5)
  })
})

test.describe('reduced motion', () => {
  test.use({ viewport: VIEWPORT, reducedMotion: 'reduce' })

  test('there is no panel to wait behind and nothing is held', async ({ page }) => {
    await page.goto('/')
    await expect
      .poll(async () => page.evaluate(() => document.documentElement.classList.contains('load-locked')), { timeout: 5000 })
      .toBe(false)
    await expect(page.locator('[data-load-curtain]')).toHaveCount(0)
  })
})

test.describe('navigation', () => {
  test.use({ viewport: VIEWPORT })

  test('an internal link is covered by the route wipe and the new page is uncovered', async ({ page }) => {
    await page.goto('/about')
    await openingOver(page)
    const nav = page.getByRole('navigation', { name: 'Main' }).first()
    await nav.getByRole('link', { name: 'Projects' }).click()
    await expect(page).toHaveURL(/\/projects$/)
    await expect(page.locator('h1')).toContainText(/Land and homes/)
    // Once revealed, the panel sits off-screen (translated a full width) and is inert.
    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const panels = Array.from(document.querySelectorAll<HTMLElement>('body > div, body div')).filter((el) =>
              el.className.includes('z-[999999]')
            )
            return panels.every((el) => {
              const r = el.getBoundingClientRect()
              return r.right <= 0 || r.left >= window.innerWidth || getComputedStyle(el).display === 'none'
            })
          }),
        { timeout: 6000 }
      )
      .toBe(true)
  })
})

test.describe('scroll-linked motion', () => {
  test.use({ viewport: VIEWPORT })

  test('the gradient thread flows with the page', async ({ page }) => {
    await page.goto('/')
    await openingOver(page)
    const track = page.locator('.bg-thread').nth(1)
    await track.scrollIntoViewIfNeeded()
    const read = () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)
    const before = await read()
    await page.mouse.wheel(0, 500)
    await expect.poll(read, { timeout: 5000 }).not.toBe(before)
  })

  test('a card photograph is uncovered by its tinted block dropping away', async ({ page }) => {
    await page.goto('/')
    await openingOver(page)
    const card = page.locator('#main [data-project-card]').first()
    await card.scrollIntoViewIfNeeded()
    const block = card.locator('.bg-tint').first()
    await expect
      .poll(async () => block.evaluate((el) => {
        const r = el.getBoundingClientRect()
        const frame = el.parentElement!.getBoundingClientRect()
        return Math.round(r.top - frame.top) >= Math.round(frame.height) - 1
      }), { timeout: 6000 })
      .toBe(true)
  })

  test('the enquiry doors part as the frame arrives', async ({ page }) => {
    await page.goto('/')
    await openingOver(page)
    const doors = page.locator('#enquire [aria-hidden="true"] > div').nth(1)
    const share = () =>
      doors.evaluate((el) => el.getBoundingClientRect().width / el.parentElement!.getBoundingClientRect().width)
    // Just short of the trigger line, the left door is still half the frame (closed).
    const top = await page.evaluate(() => document.getElementById('enquire')!.getBoundingClientRect().top + window.scrollY)
    await page.evaluate((y) => window.scrollTo(0, y), top - 900)
    await page.waitForTimeout(800)
    expect(await share()).toBeGreaterThan(0.45)
    // In view, it narrows to about a quarter (projected a little narrower by its swing).
    await page.evaluate((y) => window.scrollTo(0, y), top - 200)
    await expect.poll(share, { timeout: 5000 }).toBeLessThan(0.3)
  })
})

test.describe('hover', () => {
  test.use({ viewport: VIEWPORT })

  test('a project card draws its gradient bar across on hover', async ({ page }) => {
    await page.goto('/projects')
    await openingOver(page)
    const card = page.locator('[data-project-card]').first()
    await card.scrollIntoViewIfNeeded()
    const bar = card.locator('.bg-brand-x').first()
    const width = () => bar.evaluate((el) => el.getBoundingClientRect().width / el.parentElement!.getBoundingClientRect().width)
    expect(await width()).toBeLessThan(0.05)
    await card.hover()
    await expect.poll(width, { timeout: 3000 }).toBeGreaterThan(0.95)
  })

  test('the ring button swings its gradient on hover', async ({ page }) => {
    await page.goto('/about')
    await openingOver(page)
    const ring = page.getByRole('navigation', { name: 'Main' }).first().getByRole('link', { name: /enquire now/i })
    const angle = () => ring.evaluate((el) => getComputedStyle(el).getPropertyValue('--ring-angle').trim())
    expect(await angle()).toBe('90deg')
    await ring.hover()
    await expect.poll(angle, { timeout: 3000 }).toBe('200deg')
  })
})
