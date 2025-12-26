import {
  notifyIndexNow,
  setFetchImpl,
  resetFetchImpl,
  IndexNowPayload,
  HTTP_OK,
  HTTP_ACCEPTED,
  HTTP_BAD_REQUEST,
  HTTP_FORBIDDEN,
  HTTP_TOO_MANY_REQUESTS,
} from "./indexnow-client.js"

describe("notifyIndexNow", () => {
  afterEach(() => {
    resetFetchImpl()
  })

  it("should return success for empty URL list without making API call", async () => {
    let fetchCalled = false
    setFetchImpl(async () => {
      fetchCalled = true
      return new Response("OK", { status: HTTP_OK })
    })

    const result = await notifyIndexNow("gpupoet.com", "testkey", [])

    expect(result.success).toBe(true)
    expect(result.message).toBe("No URLs to notify")
    expect(fetchCalled).toBe(false)
  })

  it("should send correct payload to IndexNow API", async () => {
    let capturedUrl: string | undefined
    let capturedPayload: IndexNowPayload | undefined

    setFetchImpl(async (url: string, init?: RequestInit) => {
      capturedUrl = url
      capturedPayload = JSON.parse(init?.body as string)
      return new Response("OK", { status: HTTP_OK })
    })

    await notifyIndexNow("gpupoet.com", "mykey123", [
      "https://gpupoet.com/page1",
      "https://gpupoet.com/page2",
    ])

    expect(capturedUrl).toBe("https://api.indexnow.org/indexnow")
    expect(capturedPayload).toEqual({
      host: "gpupoet.com",
      key: "mykey123",
      keyLocation: "https://gpupoet.com/mykey123.txt",
      urlList: ["https://gpupoet.com/page1", "https://gpupoet.com/page2"],
    })
  })

  it("should return success for 200 OK response", async () => {
    setFetchImpl(async () => new Response("OK", { status: HTTP_OK }))

    const result = await notifyIndexNow("gpupoet.com", "key", [
      "https://gpupoet.com/",
    ])

    expect(result.success).toBe(true)
    expect(result.statusCode).toBe(HTTP_OK)
  })

  it("should return success for 202 Accepted response", async () => {
    setFetchImpl(
      async () => new Response("Accepted", { status: HTTP_ACCEPTED }),
    )

    const result = await notifyIndexNow("gpupoet.com", "key", [
      "https://gpupoet.com/",
    ])

    expect(result.success).toBe(true)
    expect(result.statusCode).toBe(HTTP_ACCEPTED)
  })

  it("should return failure for 400 Bad Request", async () => {
    setFetchImpl(
      async () => new Response("Invalid format", { status: HTTP_BAD_REQUEST }),
    )

    const result = await notifyIndexNow("gpupoet.com", "key", [
      "https://gpupoet.com/",
    ])

    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(HTTP_BAD_REQUEST)
    expect(result.message).toContain("400")
  })

  it("should return failure for 403 Forbidden", async () => {
    setFetchImpl(
      async () =>
        new Response("Invalid key or key file not found", {
          status: HTTP_FORBIDDEN,
        }),
    )

    const result = await notifyIndexNow("gpupoet.com", "key", [
      "https://gpupoet.com/",
    ])

    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(HTTP_FORBIDDEN)
  })

  it("should return failure for 429 Too Many Requests", async () => {
    setFetchImpl(
      async () =>
        new Response("Rate limited", { status: HTTP_TOO_MANY_REQUESTS }),
    )

    const result = await notifyIndexNow("gpupoet.com", "key", [
      "https://gpupoet.com/",
    ])

    expect(result.success).toBe(false)
    expect(result.statusCode).toBe(HTTP_TOO_MANY_REQUESTS)
    expect(result.message).toContain("Rate limited")
  })

  it("should throw for more than 10000 URLs", async () => {
    const tooManyUrls = Array.from(
      { length: 10001 },
      (_, i) => `https://gpupoet.com/page${i}`,
    )

    await expect(
      notifyIndexNow("gpupoet.com", "key", tooManyUrls),
    ).rejects.toThrow("Too many URLs: 10001. Maximum is 10000")
  })

  it("should set correct Content-Type header", async () => {
    let capturedHeaders: Record<string, string> | undefined

    setFetchImpl(async (_url: string, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>
      return new Response("OK", { status: HTTP_OK })
    })

    await notifyIndexNow("gpupoet.com", "key", ["https://gpupoet.com/"])

    expect(capturedHeaders).toEqual({
      "Content-Type": "application/json; charset=utf-8",
    })
  })
})
