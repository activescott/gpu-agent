import { test, expect } from "@playwright/test"

test.describe("New GPU Shop Routes", () => {
  test("loads individual GPU shop page", async ({ page }) => {
    await page.goto("/gpu/shop/nvidia-geforce-rtx-4090")
    await expect(page).toHaveTitle(/Best Prices for/)
    await expect(page.locator("h1")).toContainText("Listings")
  })

  test("loads AI cost-per-performance page", async ({ page }) => {
    await page.goto("/gpu/price-compare/ai/cost-per-fp32-flops")
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

test.describe("Benchmark Description Pages", () => {
  test.skip("loads benchmark description page (gaming benchmarks not yet scraped)", async ({
    page,
  }) => {
    await page.goto(
      "/gpu/benchmark/gaming/counter-strike-2-fps-3840x2160",
    )
    await expect(page).toHaveTitle(/Gaming GPU Benchmark/)
    await expect(page.locator("h1")).toContainText("Counter-Strike")
    await expect(page.locator(".badge")).toContainText("Gaming")
  })
})
