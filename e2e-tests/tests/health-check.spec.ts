import { test, expect } from "@playwright/test"

test.describe("Basic Health Checks", () => {
  test("health endpoint returns 200", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.status()).toBe(200)
  })

  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/")
    expect(page.url()).toContain("localhost:3000")
  })

  test("contact page loads without 404", async ({ page }) => {
    const response = await page.goto("/contact")
    expect(response?.status()).not.toBe(404)
  })
})
