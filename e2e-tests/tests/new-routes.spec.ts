import { test, expect } from "@playwright/test"

test.describe("New GPU Shop Routes", () => {
  test("loads individual GPU shop page", async ({ page }) => {
    await page.goto("/gpu/shop/nvidia-geforce-rtx-4090")
    await expect(page).toHaveTitle(/Best Prices for/)
    await expect(page.locator("h1")).toContainText("Listings")
  })

  test("loads AI cost-per-performance page", async ({ page }) => {
    // Use canonical URL format
    await page.goto("/gpu/price-compare/ai/fp32-flops")
    await expect(page).toHaveTitle(/Compare GPU Prices/)
    // Check that listing cards are present
    await expect(page.locator("#listingContainer")).toBeVisible()
  })

  test("GPU shop page has sort dropdown", async ({ page }) => {
    await page.goto("/gpu/shop/nvidia-geforce-rtx-4090")
    // Just check that the page loaded and has a sort control
    await expect(page.locator("#select-spec")).toBeVisible()
  })
})

test.describe("New GPU Ranking Routes", () => {
  test("loads AI ranking page", async ({ page }) => {
    await page.goto("/gpu/ranking/ai/fp32-flops")
    await expect(page).toHaveTitle(/GPUs Ranked by/)
    await expect(page.locator("h1")).toContainText("GPUs Ranked by")
    await expect(page.locator("table")).toBeVisible()
  })

  test("ranking table shows GPU data", async ({ page }) => {
    await page.goto("/gpu/ranking/ai/fp32-flops")
    // Just check that the table loads with data
    const table = page.locator("table")
    await expect(table).toBeVisible()
    // Check that there's at least one GPU name visible
    await expect(page.locator("body")).toContainText("NVIDIA")
  })
})

test.describe("Gaming Benchmark Sorting", () => {
  test("gaming benchmarks should be sorted consistently with configs grouped", async ({ page }) => {
    // Navigate to a gaming ranking page
    await page.goto("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")

    // Wait for MetricSelector to load
    const metricSelectorLabel = page.getByText("Compare GPUs by metric:")
    await expect(metricSelectorLabel).toBeVisible()

    // Click on Gaming Benchmarks category to make sure it's active
    const gamingBenchmarksButton = page.locator("button.nav-link", { hasText: "Gaming Benchmarks" })
    await expect(gamingBenchmarksButton).toBeVisible()
    await gamingBenchmarksButton.click()

    // Find all gaming benchmark links
    const benchmarkLinks = page.locator(".nav-underline .nav-link[href*='/gpu/ranking/gaming/']")
    const linkCount = await benchmarkLinks.count()

    // Should have gaming benchmarks
    expect(linkCount).toBeGreaterThan(0)

    // Collect link names in display order
    const displayedNames: string[] = []
    for (let i = 0; i < linkCount; i++) {
      const text = await benchmarkLinks.nth(i).textContent()
      if (text) displayedNames.push(text.trim())
    }

    // Same benchmarks should be grouped together (e.g., all Counter-Strike configs together)
    // Check that sorting by name puts configs together
    const sortedNames = [...displayedNames].sort()
    expect(displayedNames).toEqual(sortedNames)
  })
})

test.describe("Benchmark Description Pages", () => {
  test("loads benchmark description page", async ({ page }) => {
    await page.goto("/gpu/benchmark/gaming/counter-strike-2-fps-3840x2160")
    await expect(page).toHaveTitle(/Gaming GPU Benchmark/)
    await expect(page.locator("h1")).toContainText("Counter-Strike")
    // Verify "Gaming" badge appears on the page
    await expect(page.locator("body")).toContainText("Gaming")
  })
})
