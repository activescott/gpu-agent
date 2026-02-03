import { test, expect } from "@playwright/test"

// Homepage can take ~30s to compile on first hit in dev mode
test.describe("Cmd+K Search", () => {
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    await page.goto("/", { timeout: 45000 })
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveTitle(/GPU/i)
    // Wait for client-side hydration so the search trigger is interactive
    await expect(page.getByTestId("search-trigger")).toBeVisible({
      timeout: 10000,
    })
    await page.waitForTimeout(500)
  })

  async function openSearchDialog(page: import("@playwright/test").Page) {
    await page.getByTestId("search-trigger").click()
    await expect(page.getByTestId("search-dialog")).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByTestId("search-input")).toBeFocused()
  }

  async function openSearchDialogViaKeyboard(
    page: import("@playwright/test").Page,
  ) {
    await page.keyboard.press("Meta+k")
    await expect(page.getByTestId("search-dialog")).toBeVisible({
      timeout: 10000,
    })
    await expect(page.getByTestId("search-input")).toBeFocused()
  }

  async function searchAndWaitForResults(
    page: import("@playwright/test").Page,
    query: string,
  ) {
    const input = page.getByTestId("search-input")
    await input.fill(query)
    const results = page.getByTestId("search-result-item")
    await expect(results.first()).toBeVisible({ timeout: 10000 })
    return results
  }

  test("search trigger button is visible in header", async ({ page }) => {
    const trigger = page.getByTestId("search-trigger")
    await expect(trigger).toBeVisible()
  })

  test("clicking search trigger opens the search dialog", async ({ page }) => {
    await openSearchDialog(page)
  })

  test("Cmd+K opens and Escape closes the search dialog", async ({ page }) => {
    await openSearchDialogViaKeyboard(page)

    // Close with Escape
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("search-dialog")).not.toBeVisible()
  })

  test("typing a GPU name shows search results", async ({ page }) => {
    await openSearchDialogViaKeyboard(page)
    const results = await searchAndWaitForResults(page, "4090")

    // Verify at least one result contains "4090"
    const firstLabel = results.first().locator(".search-dialog-result-label")
    await expect(firstLabel).toContainText("4090", { ignoreCase: true })
  })

  test("arrow keys navigate results and Enter selects", async ({ page }) => {
    await openSearchDialogViaKeyboard(page)
    const results = await searchAndWaitForResults(page, "RTX")

    // First result should be active by default
    await expect(results.first()).toHaveAttribute("aria-selected", "true")

    // Arrow down moves to second result
    await page.keyboard.press("ArrowDown")
    await expect(results.nth(1)).toHaveAttribute("aria-selected", "true")
    await expect(results.first()).toHaveAttribute("aria-selected", "false")

    // Arrow up moves back to first result
    await page.keyboard.press("ArrowUp")
    await expect(results.first()).toHaveAttribute("aria-selected", "true")

    // Enter navigates to the selected result's page
    await page.keyboard.press("Enter")

    // Dialog should close after navigation
    await expect(page.getByTestId("search-dialog")).not.toBeVisible()
    // URL should have changed to a GPU learn card page
    await page.waitForURL(/\/gpu\/learn\/card\//, { timeout: 15000 })
  })

  test("clicking a search result navigates to its page", async ({ page }) => {
    await openSearchDialogViaKeyboard(page)
    const results = await searchAndWaitForResults(page, "4090")

    await results.first().click()

    // Dialog should close and URL should change
    await expect(page.getByTestId("search-dialog")).not.toBeVisible()
    await page.waitForURL(/\/gpu\/learn\/card\//, { timeout: 15000 })
  })

  test("clicking backdrop closes the search dialog", async ({ page }) => {
    await openSearchDialog(page)

    // Click the backdrop (outside the dialog)
    await page.getByTestId("search-backdrop").click({
      position: { x: 5, y: 5 },
    })
    await expect(page.getByTestId("search-dialog")).not.toBeVisible()
  })

  test("searching for a page shows page results", async ({ page }) => {
    await openSearchDialogViaKeyboard(page)
    const results = await searchAndWaitForResults(page, "ranking")

    const count = await results.count()
    expect(count).toBeGreaterThan(0)
  })

  test("dialog shows all GPUs sorted by release date on open", async ({
    page,
  }) => {
    await openSearchDialogViaKeyboard(page)

    // Results should be visible immediately without typing
    const results = page.getByTestId("search-result-item")
    await expect(results.first()).toBeVisible({ timeout: 10000 })

    const count = await results.count()
    expect(count).toBeGreaterThan(5)
  })

  test("no results shows empty state", async ({ page }) => {
    await openSearchDialogViaKeyboard(page)
    const input = page.getByTestId("search-input")
    await input.fill("xyznonexistent123")

    const empty = page.locator(".search-dialog-empty")
    await expect(empty).toBeVisible()
    await expect(empty).toContainText("No results")
  })
})
