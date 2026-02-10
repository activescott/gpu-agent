import { test, expect } from "@playwright/test"

const username = process.env.ADMIN_USERNAME || "admin"
const password = process.env.ADMIN_PASSWORD || "admin"
const authHeader =
  "Basic " + Buffer.from(`${username}:${password}`).toString("base64")

test.describe("Historical Data Page", () => {
  test("should access internal historical data page and API endpoint", async ({
    page,
  }) => {
    const apiResponse = await page.request.get(
      "/internal/api/historical/RTX%204090?months=1",
      { headers: { Authorization: authHeader } },
    )
    expect(apiResponse.status()).toBe(200)

    const apiData = await apiResponse.json()
    expect(apiData).toHaveProperty("gpuName")
    expect(apiData).toHaveProperty("priceHistory")
    expect(apiData).toHaveProperty("availabilityTrends")
    expect(apiData).toHaveProperty("volatilityStats")
    expect(apiData.gpuName).toBe("RTX 4090")
  })

  test("should load historical data page route without 404", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      httpCredentials: { username, password },
    })
    const page = await context.newPage()

    const response = await page.goto("/internal/historical-data", {
      waitUntil: "commit",
    })
    expect(response?.status()).toBe(200)

    expect(page.url()).toContain("/internal/historical-data")

    await context.close()
  })
})
