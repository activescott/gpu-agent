import { defineConfig, devices } from "@playwright/test"

// Use BASE_URL environment variable for testing against different environments
// Default to localhost for local development (run `npm run docker:dev` first)
const baseURL = process.env.BASE_URL || "http://localhost:3000"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Limit workers to avoid overwhelming the dev server in Docker
  // CI uses 1 worker, local dev uses 3 (default is half CPU cores which can be too many)
  workers: process.env.CI ? 1 : 3,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
