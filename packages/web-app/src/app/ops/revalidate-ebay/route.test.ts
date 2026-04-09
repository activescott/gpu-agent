import { POST } from "./route"
import { revalidateCachedListings } from "../../../pkgs/server/listings"
import { updateMetrics } from "../../../pkgs/server/metrics/metricsStore"
import type { ListingStats } from "../../../pkgs/server/listings/listings"

jest.mock("../../../pkgs/server/listings")
jest.mock("../../../pkgs/server/metrics/metricsStore")

const mockRevalidateCachedListings =
  revalidateCachedListings as jest.MockedFunction<
    typeof revalidateCachedListings
  >
const mockUpdateMetrics = updateMetrics as jest.MockedFunction<
  typeof updateMetrics
>

/**
 * Tests for the eBay revalidation endpoint called by Kubernetes CronJob.
 *
 * This endpoint is triggered every 20 minutes by a K8s CronJob to refresh stale
 * GPU listing caches from eBay. The endpoint is blocked from external access via
 * ingress and only accessible to internal Kubernetes services.
 */
describe("/ops/revalidate-ebay", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, "now").mockReturnValue(1_000_000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockSuccessResult: ListingStats = {
    staleGpusAtStart: [
      { gpuName: "test-gpu-1", oldestCachedAt: new Date("2023-01-01") },
      { gpuName: "test-gpu-2", oldestCachedAt: new Date("2023-01-02") },
    ],
    listingCachedCount: 150,
    oldestCachedAtStart: new Date("2023-01-01"),
    oldestCachedAtRemaining: null,
    totalDuration: 5000,
    timeoutMs: 1_500_000, // 25 minutes
    staleGpusRemaining: 0,
    maxTimeToCacheOneGpu: 2000,
  }

  describe("POST", () => {
    it("should return success response when revalidation succeeds", async () => {
      mockRevalidateCachedListings.mockResolvedValueOnce(mockSuccessResult)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        duration: 0,
      })

      expect(mockRevalidateCachedListings).toHaveBeenCalledWith(1_500_000)
      expect(mockUpdateMetrics).toHaveBeenCalledWith(mockSuccessResult, true)
    })

    it("should return error response when revalidation fails", async () => {
      const errorMessage = "Database connection failed"
      const error = new Error(errorMessage)
      mockRevalidateCachedListings.mockRejectedValueOnce(error)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toMatchObject({
        success: false,
        error: errorMessage,
        duration: 0,
      })

      expect(mockUpdateMetrics).toHaveBeenCalledWith(
        {
          staleGpusAtStart: [],
          listingCachedCount: 0,
          oldestCachedAtStart: null,
          oldestCachedAtRemaining: null,
          totalDuration: 0,
          timeoutMs: 1_500_000,
          staleGpusRemaining: 0,
          maxTimeToCacheOneGpu: 0,
        },
        false,
        errorMessage,
      )
    })

    it("should handle non-Error exceptions", async () => {
      const errorValue = "String error"
      mockRevalidateCachedListings.mockRejectedValueOnce(errorValue)

      const response = await POST()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("String error")
      expect(mockUpdateMetrics).toHaveBeenCalledWith(
        expect.any(Object),
        false,
        "String error",
      )
    })

    it("should calculate duration correctly", async () => {
      let callCount = 0
      jest.spyOn(Date, "now").mockImplementation(() => {
        callCount++
        if (callCount === 1) return 1_000_000
        return 1_005_000
      })

      mockRevalidateCachedListings.mockResolvedValueOnce(mockSuccessResult)

      const response = await POST()
      const data = await response.json()

      expect(data.duration).toBe(5000)
    })

    it("should return correct Content-Type header", async () => {
      mockRevalidateCachedListings.mockResolvedValueOnce(mockSuccessResult)

      const response = await POST()

      expect(response.headers.get("Content-Type")).toContain("application/json")
    })

    it("should use correct timeout value", async () => {
      mockRevalidateCachedListings.mockResolvedValueOnce(mockSuccessResult)

      await POST()

      // 25 minutes timeout (25 * 60 * 1000 = 1_500_000ms)
      expect(mockRevalidateCachedListings).toHaveBeenCalledWith(1_500_000)
    })
  })
})
