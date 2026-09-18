import { test, expect } from '@playwright/test'

test('rejects a bad phone number inline without navigating', async ({ page }) => {
  await page.goto('/contact')
  await page.locator('[name="name"]').fill('Karthik')
  await page.locator('[name="phone"]').fill('123')
  await page.getByRole('button', { name: /send|submit|enquire/i }).click()
  await expect(page.getByText(/valid.*(phone|mobile)/i)).toBeVisible()
  await expect(page).toHaveURL(/\/contact/)
})

test('accepts a valid enquiry and confirms it', async ({ page }) => {
  await page.route('**/api/lead', (r) => r.fulfill({ status: 200, json: { ok: true } }))
  await page.goto('/contact')
  await page.locator('[name="name"]').fill('Karthik')
  await page.locator('[name="phone"]').fill('6301999971')
  await page.getByRole('button', { name: /send|submit|enquire/i }).click()
  await expect(page.getByRole('status')).toContainText(/thank|received|touch/i)
})

test('brochure download is gated behind the form', async ({ page }) => {
  await page.goto('/projects/bkr-lakeview-enclave#brochure')
  await expect(page.getByRole('button', { name: /brochure/i })).toBeVisible()
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0)
})

// Not from the brief. The assertion above proves no `<a href="*.pdf">` is rendered, but the URL
// could still be sitting in the HTML somewhere else — a hidden input, a data- attribute, an
// inline script payload — and the gate would be just as defeated, because anyone could read it
// out of view-source without ever submitting a detail. This checks the whole served document.
test('the brochure URL appears nowhere in the page source until a lead is submitted', async ({ page }) => {
  const response = await page.request.get('/projects/bkr-lakeview-enclave')
  const html = await response.text()
  expect(html).not.toContain('.pdf')
})
