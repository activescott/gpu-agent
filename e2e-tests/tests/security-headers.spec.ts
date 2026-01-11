import { test, expect } from "@playwright/test"

test.describe("Security Headers", () => {
  test("x-powered-by header is not present", async ({ request }) => {
    const response = await request.get("/")
    const headers = response.headers()
    expect(headers["x-powered-by"]).toBeUndefined()
  })

  test("x-powered-by header is not present on API routes", async ({
    request,
  }) => {
    const response = await request.get("/api/health/liveness")
    const headers = response.headers()
    expect(headers["x-powered-by"]).toBeUndefined()
  })
})
