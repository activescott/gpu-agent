import {
  notifyGoogle,
  setFetchImpl,
  resetFetchImpl,
  clearTokenCache,
  setTokenGetter,
  HTTP_OK,
  HTTP_UNAUTHORIZED,
} from "./google-indexing-client.js"
import { GoogleIndexingConfig } from "./types.js"

const testConfig: GoogleIndexingConfig = {
  serviceAccountEmail: "test@project.iam.gserviceaccount.com",
  privateKey: "test-private-key",
}

describe("google-indexing-client", () => {
  beforeEach(() => {
    clearTokenCache()
    setTokenGetter(null)
  })

  afterEach(() => {
    resetFetchImpl()
    setTokenGetter(null)
  })

  describe("notifyGoogle", () => {
    it("should return success for empty URL list", async () => {
      const result = await notifyGoogle(testConfig, [])

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(HTTP_OK)
      expect(result.message).toBe("No URLs to notify")
    })

    it("should handle authentication failure", async () => {
      // Mock token getter to return null (auth failure)
      setTokenGetter(async () => null)

      const result = await notifyGoogle(testConfig, [
        "https://example.com/page",
      ])

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(HTTP_UNAUTHORIZED)
      expect(result.message).toBe("Failed to obtain access token")
    })

    it("should notify single URL successfully", async () => {
      let indexingRequestMade = false

      // Mock token getter to return a test token
      setTokenGetter(async () => "test-token")

      setFetchImpl(async (url: string, init?: RequestInit) => {
        if (url.includes("indexing.googleapis.com")) {
          indexingRequestMade = true
          // Verify authorization header
          expect(init?.headers).toBeDefined()
          const headers = init?.headers as Record<string, string>
          expect(headers["Authorization"]).toBe("Bearer test-token")

          // Verify request body
          const body = JSON.parse(init?.body as string)
          expect(body.url).toBe("https://example.com/page")
          expect(body.type).toBe("URL_UPDATED")

          return new Response(JSON.stringify({ urlNotificationMetadata: {} }), {
            status: HTTP_OK,
          })
        }

        throw new Error(`Unexpected URL: ${url}`)
      })

      const result = await notifyGoogle(testConfig, [
        "https://example.com/page",
      ])

      expect(indexingRequestMade).toBe(true)
      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(HTTP_OK)
    })

    it("should handle API errors gracefully", async () => {
      // Mock token getter to return a test token
      setTokenGetter(async () => "test-token")

      setFetchImpl(async () => {
        return new Response('{"error": "Permission denied"}', {
          status: 403,
          statusText: "Forbidden",
        })
      })

      const result = await notifyGoogle(testConfig, [
        "https://example.com/page",
      ])

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(403)
    })

    it("should call token getter for each request", async () => {
      let tokenRequestCount = 0

      // Mock token getter
      setTokenGetter(async () => {
        tokenRequestCount++
        return "test-token"
      })

      setFetchImpl(async () => {
        return new Response(JSON.stringify({ urlNotificationMetadata: {} }), {
          status: HTTP_OK,
        })
      })

      // First request
      await notifyGoogle(testConfig, ["https://example.com/page1"])
      expect(tokenRequestCount).toBe(1)

      // Second request calls token getter again (caching is internal to real implementation)
      await notifyGoogle(testConfig, ["https://example.com/page2"])
      expect(tokenRequestCount).toBe(2)
    })
  })
})
