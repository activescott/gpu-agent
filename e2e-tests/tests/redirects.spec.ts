import { test, expect } from "@playwright/test"

// Use waitUntil: "commit" for redirect tests - we only need to verify the redirect
// happens, not wait for the full destination page to load. This makes tests faster
// and more reliable under load.
const gotoOptions = { waitUntil: "commit" as const }

test.describe("Route Redirects", () => {
  test("redirects /ml/shop/gpu/:slug to /gpu/shop/:slug", async ({ page }) => {
    const response = await page.goto("/ml/shop/gpu/nvidia-geforce-rtx-4090", gotoOptions)
    expect(response?.url()).toContain("/gpu/shop/nvidia-geforce-rtx-4090")
    expect(response?.status()).toBe(200)
  })

  test("redirects /ml/shop/gpu to /gpu/price-compare/ai/cost-per-fp32-flops", async ({
    page,
  }) => {
    const response = await page.goto("/ml/shop/gpu", gotoOptions)
    expect(response?.url()).toContain("/gpu/price-compare/ai/cost-per-fp32-flops")
  })

  test("redirects /ml/shop/gpu/performance/* to /gpu/price-compare/ai/*", async ({
    page,
  }) => {
    const response = await page.goto(
      "/ml/shop/gpu/performance/cost-per-fp32-flops",
      gotoOptions,
    )
    expect(response?.url()).toContain("/gpu/price-compare/ai/cost-per-fp32-flops")
  })

  test("redirects /ml/learn/gpu/ranking/* to /gpu/ranking/ai/*", async ({
    page,
  }) => {
    const response = await page.goto("/ml/learn/gpu/ranking/fp32-flops", gotoOptions)
    expect(response?.url()).toContain("/gpu/ranking/ai/fp32-flops")
  })

  test("redirects /ml/learn/gpu/specifications to /gpu/ranking/ai/fp32-flops", async ({
    page,
  }) => {
    const response = await page.goto("/ml/learn/gpu/specifications", gotoOptions)
    expect(response?.url()).toContain("/gpu/ranking/ai/fp32-flops")
  })
})
