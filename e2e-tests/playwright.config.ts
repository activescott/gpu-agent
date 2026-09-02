import { defineConfig, devices } from "@playwright/test";

// Use BASE_URL environment variable for testing against different environments
// Default to the local kind dev instance (run `./scripts/dev` first)
const baseURL = process.env.BASE_URL || "http://gpupoet.localhost:3400";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Limit workers to avoid overwhelming the dev server
  // CI uses 1 worker, local dev uses 2 (keeps load manageable for the local kind cluster)
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"]],
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
});
