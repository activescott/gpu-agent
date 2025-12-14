import { test, expect } from "@playwright/test"

test.describe("Filter Items - Price Compare Page", () => {
  test("setting very low budget shows significantly fewer listings", async ({ page }) => {
    await page.goto("/gpu/price-compare")

    // Wait for page to load by checking for the heading
    await expect(page.getByRole("heading", { name: "Shop All GPUs" })).toBeVisible()

    // Wait for content to stabilize
    await page.waitForTimeout(500)

    // Find the Budget filter slider (use first() for desktop/mobile duplicates)
    const budgetSlider = page.getByRole("slider", { name: "Budget slider" }).first()
    await expect(budgetSlider).toBeVisible()

    // Set budget to a very low value (50 should filter out most/all GPUs)
    await budgetSlider.fill("50")

    // Wait for filter to apply (debounce is 150ms)
    await page.waitForTimeout(300)

    // Check for the "Showing X of Y listings" text
    const showingText = page.getByText(/Showing \d+ of \d+ listings/i)
    await expect(showingText).toBeVisible({ timeout: 5000 })

    // Verify fewer items are showing
    const text = await showingText.textContent()
    const match = text?.match(/Showing (\d+) of (\d+)/i)
    expect(match).toBeTruthy()

    const shownCount = Number.parseInt(match![1], 10)
    const totalCount = Number.parseInt(match![2], 10)

    // Should show fewer than total
    expect(shownCount).toBeLessThan(totalCount)
    // Total should be > 0 (we have listings in the system)
    expect(totalCount).toBeGreaterThan(0)
  })

  test("setting budget to 0 filters out all listings", async ({ page }) => {
    await page.goto("/gpu/price-compare")

    // Wait for page to load
    await expect(page.getByRole("heading", { name: "Shop All GPUs" })).toBeVisible()
    await page.waitForTimeout(500)

    // Find the Budget filter slider
    const budgetSlider = page.getByRole("slider", { name: "Budget slider" }).first()
    await expect(budgetSlider).toBeVisible()

    // Set budget to 0
    await budgetSlider.fill("0")
    await page.waitForTimeout(300)

    // Check for the "Showing X of Y listings" text - should show 0
    const showingText = page.getByText(/Showing \d+ of \d+ listings/i)
    await expect(showingText).toBeVisible({ timeout: 5000 })

    const text = await showingText.textContent()
    expect(text).toMatch(/Showing 0 of/i)
  })
})

test.describe("Filter Items - Ranking Page", () => {
  test("setting very low budget shows significantly fewer GPUs", async ({ page }) => {
    await page.goto("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i)

    // Wait for the table to be visible
    const table = page.getByRole("table").first()
    await expect(table).toBeVisible()
    await page.waitForTimeout(500)

    // Find the Budget filter slider
    const budgetSlider = page.getByRole("slider", { name: "Budget slider" }).first()
    await expect(budgetSlider).toBeVisible()

    // Set budget to a low value (50 should filter out most GPUs)
    await budgetSlider.fill("50")
    await page.waitForTimeout(300)

    // Check that the "Showing X of Y GPUs" message appears
    const showingText = page.getByText(/Showing \d+ of \d+ GPUs/i)
    await expect(showingText).toBeVisible({ timeout: 5000 })

    // Verify fewer items are showing
    const text = await showingText.textContent()
    const match = text?.match(/Showing (\d+) of (\d+)/i)
    expect(match).toBeTruthy()

    const shownCount = Number.parseInt(match![1], 10)
    const totalCount = Number.parseInt(match![2], 10)

    // Should show fewer than total
    expect(shownCount).toBeLessThan(totalCount)
    expect(totalCount).toBeGreaterThan(0)
  })

  test("setting budget to 0 filters out all GPUs", async ({ page }) => {
    await page.goto("/gpu/ranking/gaming/counter-strike-2-fps-3840x2160")

    // Wait for page to load
    await expect(page).toHaveTitle(/Counter.*Strike|GPUs Ranked by/i)

    // Wait for table to load
    const table = page.getByRole("table").first()
    await expect(table).toBeVisible()
    await page.waitForTimeout(500)

    // Find the Budget filter slider
    const budgetSlider = page.getByRole("slider", { name: "Budget slider" }).first()
    await expect(budgetSlider).toBeVisible()

    // Set budget to 0
    await budgetSlider.fill("0")
    await page.waitForTimeout(300)

    // Check for the "Showing X of Y GPUs" text - should show 0
    const showingText = page.getByText(/Showing \d+ of \d+ GPUs/i)
    await expect(showingText).toBeVisible({ timeout: 5000 })

    const text = await showingText.textContent()
    expect(text).toMatch(/Showing 0 of/i)
  })
})
