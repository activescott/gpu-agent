import { test, expect } from "@playwright/test"

test.describe("Route Redirects", () => {
  test("redirects /ml/shop/gpu/:slug to /gpu/listing/:slug", async ({ page }) => {
    const response = await page.goto("/ml/shop/gpu/nvidia-geforce-rtx-4090")
    expect(response?.url()).toContain("/gpu/listing/nvidia-geforce-rtx-4090")
    expect(response?.status()).toBe(200)
  })

  test("redirects /ml/shop/gpu to /gpu/buy/ai/cost-per-fp32-flops", async ({
    page,
  }) => {
    const response = await page.goto("/ml/shop/gpu")
    expect(response?.url()).toContain("/gpu/buy/ai/cost-per-fp32-flops")
  })

  test("redirects /ml/shop/gpu/performance/* to /gpu/buy/ai/*", async ({
    page,
  }) => {
    const response = await page.goto(
      "/ml/shop/gpu/performance/cost-per-fp32-flops",
    )
    expect(response?.url()).toContain("/gpu/buy/ai/cost-per-fp32-flops")
  })

  test("redirects /ml/learn/gpu/ranking/* to /gpu/ranking/ai/*", async ({
    page,
  }) => {
    const response = await page.goto("/ml/learn/gpu/ranking/fp32-flops")
    expect(response?.url()).toContain("/gpu/ranking/ai/fp32-flops")
  })

  test("redirects /ml/learn/use-case/:slug to /gpu/learn/ai/use-case/:slug", async ({
    page,
  }) => {
    const response = await page.goto(
      "/ml/learn/use-case/large-language-model-llm",
    )
    expect(response?.url()).toContain(
      "/gpu/learn/ai/use-case/large-language-model-llm",
    )
  })

  test("redirects /ml/learn/models/:slug to /gpu/learn/ai/models/:slug", async ({
    page,
  }) => {
    const response = await page.goto("/ml/learn/models/bert")
    expect(response?.url()).toContain("/gpu/learn/ai/models/bert")
  })

  test("redirects /ml/learn/gpu/specifications to /gpu/ranking/ai/fp32-flops", async ({
    page,
  }) => {
    const response = await page.goto("/ml/learn/gpu/specifications")
    expect(response?.url()).toContain("/gpu/ranking/ai/fp32-flops")
  })
})
