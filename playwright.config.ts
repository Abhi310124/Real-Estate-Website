import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Production build, not `next dev` — hydration and animation timing are exactly
  // where dev-mode double-mounting and on-demand compilation manufacture flake, and
  // the master prompt's performance budgets are measured against `next build && next
  // start` anyway, so one server mode keeps every e2e run consistent with that.
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    // Not specified by the controller ruling; added because a cold `next build` can
    // exceed Playwright's 60s default webServer startup timeout on its own, before
    // `next start` even binds the port.
    timeout: 180_000,
  },
})
