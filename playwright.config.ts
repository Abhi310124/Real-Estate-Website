import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  // A stray `test.only` committed mid-task would silently green a CI run while skipping
  // every other spec. Deliberately no `retries`: this suite exists to catch animation and
  // hydration timing bugs, and a retry turns exactly that class of failure into a pass.
  forbidOnly: !!process.env.CI,
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
    // Playwright's default is 60s, which a cold `next build` exceeds on its own before
    // `next start` even binds the port. Originally 180s, when a cold build measured ~1.4 min.
    // Raised to 420s after Task 19 added Sanity: the embedded Studio route pushes a cold build
    // to ~2m20s, and 180s was timing out during the build rather than because anything hung.
    // This timeout exists to catch a server that never comes up, not to police build duration —
    // warm rebuilds are still a few seconds.
    timeout: 420_000,
  },
})
