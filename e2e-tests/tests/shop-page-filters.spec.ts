import { test, expect } from "@playwright/test"

test.describe("Shop Page Filters", () => {
  test("budget filter set to 0 should hide all listing cards", async ({ page }) => {
    // Go to a shop page - networkidle ensures JS bundles + data fetches are complete
    await page.goto("/gpu/shop/nvidia-geforce-rtx-3070", { waitUntil: "networkidle" })

    // Wait for listing cards to appear (proves hydration + data loaded)
    const listingContainer = page.locator("#listingContainer")
    const listingCards = listingContainer.locator(".card")
    await expect(listingCards.first()).toBeVisible({ timeout: 15000 })

    const initialCount = await listingCards.count()
    if (initialCount === 0) {
      test.skip()
      return
    }

    // Set budget slider to 0 to filter out all listings
    const budgetSlider = page.getByRole("slider", { name: "Budget slider" }).first()
    await expect(budgetSlider).toBeVisible()
    await budgetSlider.fill("0")

    // Wait for filter text and card count to update
    await expect(page.getByText(/Showing 0 of \d+ listings/i)).toBeVisible({ timeout: 10000 })
    await expect(listingCards).toHaveCount(0, { timeout: 10000 })
  })
})
