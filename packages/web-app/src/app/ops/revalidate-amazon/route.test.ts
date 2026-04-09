import { POST } from "./route"
import { revalidateAmazonListings } from "../../../pkgs/server/listings"
import { recordAmazonSearch } from "../../../pkgs/server/metrics/amazonMetrics"

jest.mock("../../../pkgs/server/listings")
jest.mock("../../../pkgs/server/metrics/amazonMetrics")

const mockRevalidateAmazonListings =
  revalidateAmazonListings as jest.MockedFunction<
    typeof revalidateAmazonListings
  >
const mockRecordAmazonSearch = recordAmazonSearch as jest.MockedFunction<
  typeof recordAmazonSearch
>

/**
 * Tests for the Amazon revalidation endpoint called by Kubernetes CronJob.
 *
 * This endpoint is triggered every 10 minutes by a K8s CronJob to refresh the
 * single most-stale GPU listing from Amazon. The endpoint is blocked from external
 * access via ingress and only accessible to internal Kubernetes services.
 */
describe("/ops/revalidate-amazon", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, "now").mockReturnValue(1_000_000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("POST", () => {
    it("should return success response when revalidation succeeds", async () => {
      const amazonResult = {
        gpuName: "RTX 4090",
        listingCachedCount: 25,
        totalDuration: 3000,
        success: true,
      }
      mockRevalidateAmazonListings.mockResolvedValueOnce(amazonResult)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        duration: 0,
        amazon: amazonResult,
      })

      expect(mockRecordAmazonSearch).toHaveBeenCalledWith("RTX 4090", true, 25)
    })

    it("should handle no stale GPUs found", async () => {
      const amazonResult = {
        gpuName: null,
        listingCachedCount: 0,
        totalDuration: 100,
        success: true,
      }
      mockRevalidateAmazonListings.mockResolvedValueOnce(amazonResult)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockRecordAmazonSearch).toHaveBeenCalledWith("unknown", true, 0)
    })

    it("should return error response when revalidation throws", async () => {
      const errorMessage = "Amazon searcher service unavailable"
      mockRevalidateAmazonListings.mockRejectedValueOnce(
        new Error(errorMessage),
      )

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toMatchObject({
        success: false,
        error: errorMessage,
      })

      expect(mockRecordAmazonSearch).toHaveBeenCalledWith("unknown", false)
    })

    it("should handle non-Error exceptions", async () => {
      mockRevalidateAmazonListings.mockRejectedValueOnce("String error")

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("String error")
      expect(mockRecordAmazonSearch).toHaveBeenCalledWith("unknown", false)
    })

    it("should calculate duration correctly", async () => {
      let callCount = 0
      jest.spyOn(Date, "now").mockImplementation(() => {
        callCount++
        if (callCount === 1) return 1_000_000
        return 1_003_000
      })

      mockRevalidateAmazonListings.mockResolvedValueOnce({
        gpuName: "RTX 4090",
        listingCachedCount: 10,
        totalDuration: 2000,
        success: true,
      })

      const response = await POST()
      const data = await response.json()

      expect(data.duration).toBe(3000)
    })
  })
})
