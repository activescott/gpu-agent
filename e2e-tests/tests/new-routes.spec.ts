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
  test("gaming benchmarks should be sorted with resolutions: 4K first, then 1440p, then 1080p", async ({ page }) => {
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

    // Group benchmarks by game (base name without resolution)
    const gameGroups = new Map<string, string[]>()
    for (const name of displayedNames) {
      const baseName = name.replace(/\s*\([^)]*\)\s*$/, "").trim()
      if (!gameGroups.has(baseName)) {
        gameGroups.set(baseName, [])
      }
      gameGroups.get(baseName)!.push(name)
    }

    // For each game with multiple resolutions, verify order is: 4K, 1440p, 1080p
    for (const [gameName, variants] of gameGroups) {
      if (variants.length <= 1) continue

      const index4k = variants.findIndex((v) => v.includes("(4K)"))
      const index1440p = variants.findIndex((v) => v.includes("(1440p)"))
      const index1080p = variants.findIndex((v) => v.includes("(1080p)"))

      if (index4k !== -1 && index1440p !== -1) {
        expect(index4k, `${gameName}: 4K should come before 1440p`).toBeLessThan(index1440p)
      }
      if (index1440p !== -1 && index1080p !== -1) {
        expect(index1440p, `${gameName}: 1440p should come before 1080p`).toBeLessThan(index1080p)
      }
      if (index4k !== -1 && index1080p !== -1) {
        expect(index4k, `${gameName}: 4K should come before 1080p`).toBeLessThan(index1080p)
      }
    }
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
