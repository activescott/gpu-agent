import { test, expect } from "@playwright/test"

test.describe("MetricSelector - Filter Preservation", () => {
  test("switching metric within same category preserves budget filter in URL", async ({
    page,
  }) => {
    // Navigate to a ranking page
    await page.goto("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i)

    // Wait for table to load
    const table = page.getByRole("table").first()
    await expect(table).toBeVisible()
    await page.waitForTimeout(500)

    // Apply a budget filter
    const budgetSlider = page
      .getByRole("slider", { name: "Budget slider" })
      .first()
    await expect(budgetSlider).toBeVisible()
    await budgetSlider.fill("500")

    // Wait for filter to apply and URL to update
    await page.waitForTimeout(300)

    // Verify the filter is in the URL
    const urlBeforeSwitch = page.url()
    expect(urlBeforeSwitch).toContain("filter.")

    // Click on a different metric within the same Gaming Benchmarks category
    // First make sure the Gaming Benchmarks tab is active
    const gamingBenchmarksTab = page.locator("button.nav-link", {
      hasText: "Gaming Benchmarks",
    })
    await expect(gamingBenchmarksTab).toHaveClass(/active/)

    // Find another gaming benchmark link (not the current one)
    const metricLinks = page.locator(
      '.nav-underline .nav-link[href*="/gpu/ranking/gaming/"]',
    )
    const linkCount = await metricLinks.count()
    expect(linkCount).toBeGreaterThan(1)

    // Click on a different metric (not the current active one)
    for (let i = 0; i < linkCount; i++) {
      const link = metricLinks.nth(i)
      const isActive = await link.evaluate((el) =>
        el.classList.contains("active"),
      )
      if (!isActive) {
        await link.click()
        break
      }
    }

    // Wait for navigation
    await page.waitForURL(/\/gpu\/ranking\/gaming\//)

    // Verify the filter is STILL in the URL after switching metrics
    const urlAfterSwitch = page.url()
    expect(urlAfterSwitch).toContain("filter.")
    expect(urlAfterSwitch).toContain("500") // The budget value should be preserved
  })

  test("switching category preserves budget filter in URL", async ({ page }) => {
    // Navigate to a gaming ranking page
    await page.goto("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i)

    // Wait for table to load
    const table = page.getByRole("table").first()
    await expect(table).toBeVisible()
    await page.waitForTimeout(500)

    // Apply a budget filter
    const budgetSlider = page
      .getByRole("slider", { name: "Budget slider" })
      .first()
    await expect(budgetSlider).toBeVisible()
    await budgetSlider.fill("750")

    // Wait for filter to apply
    await page.waitForTimeout(300)

    // Verify filter is in URL
    expect(page.url()).toContain("filter.")

    // Click on AI Specs tab to switch category
    const aiSpecsTab = page.locator("button.nav-link", { hasText: "AI Specs" })
    await expect(aiSpecsTab).toBeVisible()
    await aiSpecsTab.click()

    // Wait for navigation to AI category
    await page.waitForURL(/\/gpu\/ranking\/ai\//)

    // Verify the filter is STILL in the URL after switching categories
    const urlAfterSwitch = page.url()
    expect(urlAfterSwitch).toContain("filter.")
    expect(urlAfterSwitch).toContain("750") // The budget value should be preserved
  })
})

test.describe("MetricSelector - Gaming Benchmark Sort Order", () => {
  test("gaming benchmarks should be sorted with 4K first, then 1440p, then 1080p", async ({
    page,
  }) => {
    // Navigate to a gaming ranking page
    await page.goto("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i)

    // Click on Gaming Benchmarks tab to ensure we see all benchmarks
    const gamingBenchmarksTab = page.locator("button.nav-link", {
      hasText: "Gaming Benchmarks",
    })
    await expect(gamingBenchmarksTab).toBeVisible()
    await gamingBenchmarksTab.click()

    // Wait for the metric links to be visible
    await page.waitForTimeout(300)

    // Get all gaming benchmark links in display order
    const benchmarkLinks = page.locator(
      '.nav-underline .nav-link[href*="/gpu/ranking/gaming/"]',
    )
    const linkCount = await benchmarkLinks.count()
    expect(linkCount).toBeGreaterThan(0)

    // Extract the names in order
    const displayedNames: string[] = []
    for (let i = 0; i < linkCount; i++) {
      const text = await benchmarkLinks.nth(i).textContent()
      if (text) {
        displayedNames.push(text.trim())
      }
    }

    // Group benchmarks by game (base name without resolution)
    const gameGroups = new Map<string, string[]>()
    for (const name of displayedNames) {
      // Extract base name (e.g., "Counter-Strike 2" from "Counter-Strike 2 (4K)")
      const baseName = name.replace(/\s*\([^)]*\)\s*$/, "").trim()
      if (!gameGroups.has(baseName)) {
        gameGroups.set(baseName, [])
      }
      gameGroups.get(baseName)!.push(name)
    }

    // For each game that has multiple resolutions, verify the order is: 4K, 1440p, 1080p
    for (const [gameName, variants] of gameGroups) {
      if (variants.length <= 1) continue // Skip games with only one resolution

      // Get the index of each resolution variant (if present)
      const index4k = variants.findIndex((v) => v.includes("(4K)"))
      const index1440p = variants.findIndex((v) => v.includes("(1440p)"))
      const index1080p = variants.findIndex((v) => v.includes("(1080p)"))

      // Verify ordering: 4K should come before 1440p, 1440p should come before 1080p
      if (index4k !== -1 && index1440p !== -1) {
        expect(
          index4k,
          `${gameName}: 4K should come before 1440p`,
        ).toBeLessThan(index1440p)
      }
      if (index1440p !== -1 && index1080p !== -1) {
        expect(
          index1440p,
          `${gameName}: 1440p should come before 1080p`,
        ).toBeLessThan(index1080p)
      }
      if (index4k !== -1 && index1080p !== -1) {
        expect(
          index4k,
          `${gameName}: 4K should come before 1080p`,
        ).toBeLessThan(index1080p)
      }
    }
  })
})
