import { test, expect } from "@playwright/test"

const username = process.env.ADMIN_USERNAME || "admin"
const password = process.env.ADMIN_PASSWORD || "admin"
const validAuth =
  "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
const invalidAuth =
  "Basic " + Buffer.from("wrong:credentials").toString("base64")

test.describe("Internal Auth", () => {
  test("unauthenticated request to internal page returns 401", async ({
    request,
  }) => {
    const response = await request.get("/internal/excluded-listings", {
      headers: {},
      maxRedirects: 0,
    })
    expect(response.status()).toBe(401)
    const headers = response.headers()
    expect(headers["www-authenticate"]).toContain("Basic")
  })

  test("unauthenticated request to internal API returns 401", async ({
    request,
  }) => {
    const response = await request.get("/internal/api/excluded-listings", {
      headers: {},
      maxRedirects: 0,
    })
    expect(response.status()).toBe(401)
    const headers = response.headers()
    expect(headers["www-authenticate"]).toContain("Basic")
  })

  test("wrong credentials return 401", async ({ request }) => {
    const response = await request.get("/internal/excluded-listings", {
      headers: { Authorization: invalidAuth },
      maxRedirects: 0,
    })
    expect(response.status()).toBe(401)
  })

  test("valid credentials return 200 for internal page", async ({
    request,
  }) => {
    const response = await request.get("/internal/excluded-listings", {
      headers: { Authorization: validAuth },
    })
    expect(response.status()).toBe(200)
  })

  test("valid credentials return 200 for internal API", async ({
    request,
  }) => {
    const response = await request.get("/internal/api/excluded-listings", {
      headers: { Authorization: validAuth },
    })
    expect(response.status()).toBe(200)
  })
})
