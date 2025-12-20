import { test, expect } from "@playwright/test"

test.describe("Shop Page Filters", () => {
  test("budget filter set to 0 should hide all listing cards", async ({ page }) => {
    // Go to a shop page
    await page.goto("/gpu/shop/nvidia-geforce-rtx-3070")

    // Wait for page to fully load - heading visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    // Wait for listing container to have cards (indicates suspense resolved and data loaded)
    // Use the #listingContainer which is inside the actual gallery
    const listingContainer = page.locator("#listingContainer")
    await expect(listingContainer).toBeVisible({ timeout: 10000 })

    // Wait for cards within the listing container
    const listingCards = listingContainer.locator(".card")
    await expect(listingCards.first()).toBeVisible({ timeout: 10000 })

    const initialCount = await listingCards.count()

    // Skip test if no listings
    if (initialCount === 0) {
      test.skip()
      return
    }

    // Find the Budget filter slider
    const budgetSlider = page.getByRole("slider", { name: "Budget slider" }).first()
    await expect(budgetSlider).toBeVisible()

    // Set budget to 0 to filter out all listings
    await budgetSlider.fill("0")

    // Wait for the "Showing 0 of X listings" text to appear
    // This indicates the filter has been applied
    const showingZeroText = page.getByText(/Showing 0 of \d+ listings/i)
    await expect(showingZeroText).toBeVisible({ timeout: 5000 })

    // CRITICAL: Wait for actual card count to become 0
    // Use expect with timeout to wait for React to re-render
    // Longer timeout for dev environment variability
    await expect(listingCards).toHaveCount(0, { timeout: 10000 })
  })
})
