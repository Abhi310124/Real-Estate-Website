import { test, expect } from '@playwright/test'

test('listing shows published projects', async ({ page }) => {
  await page.goto('/projects')
  expect(await page.locator('[data-project-card]').count()).toBeGreaterThan(0)
})

test('never shows an unpublished project', async ({ page }) => {
  await page.goto('/projects')
  // Kept verbatim from the brief, but this string never actually appears in lib/data/mock.ts —
  // the unpublished fixture's real title is "BKR Horizon Towers" (slug `unpublished-sample`,
  // per the fixture comment: "The show/hide fixture: isPublished false must remove this project
  // from every surface"). So this assertion is true regardless of whether publish-gating works;
  // per the master prompt ("never weaken a test — if a test is wrong, say so before changing
  // it"), it stays exactly as given rather than being silently dropped, and the assertion below
  // is added to actually exercise the fixture that exists.
  await expect(page.locator('body')).not.toContainText('Unpublished Sample')
  await expect(page.locator('body')).not.toContainText('BKR Horizon Towers')
})

test('category filter narrows results and writes to the URL', async ({ page }) => {
  await page.goto('/projects')
  // Scoped to FilterBar's own category nav rather than the bare page. The brief's unscoped
  // `page.getByRole('link', { name: /^villas$/i })` is genuinely ambiguous on this route:
  // components/layout/Footer.tsx is mounted on every page via app/layout.tsx and independently
  // renders an "Explore" column with one link per `settings.categories` entry (label "Villas"
  // included), so an unscoped query strict-mode-fails with two matches. Same class of fix as
  // tests/e2e/header.spec.ts's WhatsApp-locator regression after Task 12's CtaBand — verified by
  // reading Footer.tsx, not assumed.
  const categoryNav = page.getByRole('navigation', { name: /filter by category/i })
  await categoryNav.getByRole('link', { name: /^villas$/i }).click()
  // 15s, not the 5s default. `/projects` reads searchParams so Next renders it dynamically —
  // a filter click is a server round-trip, not a client-side swap. Measured at ~2.5s idle,
  // but this suite runs six workers against a single `next start`, and it exceeded 5s there.
  // Raising the wait for a genuinely slower route, not masking a failure: the navigation does
  // happen, and the assertions below still prove the filter narrowed the results.
  await expect(page).toHaveURL(/category=villas/, { timeout: 15_000 })
  const cards = page.locator('[data-project-card]')
  expect(await cards.count()).toBeGreaterThan(0)
  for (const c of await cards.all()) {
    await expect(c).toHaveAttribute('data-category', 'villas')
  }
})

test('a deep-linked filter is honoured on first load', async ({ page }) => {
  await page.goto('/projects?category=apartments')
  const categoryNav = page.getByRole('navigation', { name: /filter by category/i })
  await expect(categoryNav.getByRole('link', { name: /^apartments$/i })).toHaveAttribute('aria-current', 'true')
})

test('status filter composes with category', async ({ page }) => {
  await page.goto('/projects?category=villas&status=ongoing')
  const cards = page.locator('[data-project-card]')
  expect(await cards.count()).toBeGreaterThan(0)
  for (const c of await cards.all()) {
    await expect(c).toHaveAttribute('data-status', 'ongoing')
  }
})

test('an empty combination explains itself instead of showing a blank grid', async ({ page }) => {
  await page.goto('/projects?category=developers&status=sold-out')
  const cards = await page.locator('[data-project-card]').count()
  if (cards === 0) await expect(page.getByText(/no projects/i)).toBeVisible()
})

test('cards link to their detail page', async ({ page }) => {
  await page.goto('/projects')
  await expect(page.locator('[data-project-card] a').first()).toHaveAttribute('href', /\/projects\/[a-z0-9-]+/)
})
