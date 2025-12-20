import { test, expect } from "@playwright/test"

test.describe("Basic Health Checks", () => {
  test("health endpoint returns 200", async ({ request }) => {
    // The /api/health endpoint was deprecated - use /api/health/liveness instead
    const response = await request.get("/api/health/liveness")
    expect(response.status()).toBe(200)
  })

  test("homepage loads successfully", async ({ page }) => {
    const response = await page.goto("/")
    // Verify homepage loads without error (not checking specific URL since it could be localhost or production)
    expect(response?.status()).toBe(200)
    expect(page.url()).toBeTruthy()
  })

  test("contact page loads without 404", async ({ page }) => {
    const response = await page.goto("/contact")
    expect(response?.status()).not.toBe(404)
  })
})
