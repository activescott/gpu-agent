import { POST as revalidateCachePost } from "./revalidate-cache/route"
import { GET as metricsGet } from "./metrics/route"
import { revalidateCachedListings } from "../../pkgs/server/listings"
import {
  resetMetrics,
  hasMetrics,
} from "../../pkgs/server/metrics/metricsStore"
import type { ListingStats } from "../../pkgs/server/listings/listings"

// Mock the revalidateCachedListings function
jest.mock("../../pkgs/server/listings")

const mockRevalidateCachedListings =
  revalidateCachedListings as jest.MockedFunction<
    typeof revalidateCachedListings
  >

/**
 * Integration tests for the complete cache revalidation system.
 *
 * Tests the end-to-end flow from Kubernetes CronJob triggering revalidation
 * to Prometheus scraping the resulting metrics. This simulates the actual
 * production workflow.
 */
describe("Cache Revalidation Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetMetrics() // Start with clean metrics state
  })

  const mockSuccessResult: ListingStats = {
    staleGpusAtStart: [
      { gpuName: "nvidia-rtx-4090", oldestCachedAt: new Date("2023-01-01") },
      { gpuName: "nvidia-h100-pcie", oldestCachedAt: new Date("2023-01-02") },
    ],
    listingCachedCount: 250,
    oldestCachedAtStart: new Date("2023-01-01"),
    oldestCachedAtRemaining: null,
    totalDuration: 8000,
    timeoutMs: 1_500_000, // 25 minutes
    staleGpusRemaining: 0,
    maxTimeToCacheOneGpu: 3000,
  }

  describe("End-to-End Flow", () => {
    it("should complete full revalidation → metrics flow successfully", async () => {
      // Step 1: Verify initial state - no metrics available
      expect(hasMetrics()).toBe(false)

      // Step 2: Verify metrics endpoint returns safe defaults before any job
      // (success=1 and current timestamp to avoid triggering alerts before first CronJob run)
      const initialMetricsResponse = await metricsGet()
      const initialMetricsText = await initialMetricsResponse.text()

      expect(initialMetricsResponse.status).toBe(200)
      expect(initialMetricsText).toContain("coinpoet_last_job_success 1")
      // Timestamp should be current time (not 0)
      const timestampMatch = initialMetricsText.match(
        /coinpoet_last_job_timestamp_seconds (\d+)/,
      )
      expect(timestampMatch).toBeTruthy()
      expect(Number.parseInt(timestampMatch![1], 10)).toBeGreaterThan(0)

      // Step 3: Mock successful revalidation and trigger job (simulates CronJob call)
      mockRevalidateCachedListings.mockResolvedValueOnce(mockSuccessResult)

      const revalidationResponse = await revalidateCachePost()
      const revalidationData = await revalidationResponse.json()

      // Step 4: Verify revalidation succeeded
      expect(revalidationResponse.status).toBe(200)
      expect(revalidationData.success).toBe(true)
      expect(revalidationData.stats.staleGpusAtStart).toBe(2)
      expect(revalidationData.stats.listingCachedCount).toBe(250)
      expect(revalidationData.stats.staleGpusRemaining).toBe(0)

      // Step 5: Verify metrics are now available
      expect(hasMetrics()).toBe(true)

      // Step 6: Verify metrics endpoint now returns actual job data (simulates Prometheus scrape)
      const updatedMetricsResponse = await metricsGet()
      const updatedMetricsText = await updatedMetricsResponse.text()

      expect(updatedMetricsResponse.status).toBe(200)
      expect(updatedMetricsText).toContain("coinpoet_last_job_success 1")
      expect(updatedMetricsText).toContain("coinpoet_listings_cached_total 250")
      expect(updatedMetricsText).toContain("coinpoet_gpus_stale_start_total 2")
      expect(updatedMetricsText).toContain(
        "coinpoet_gpus_stale_remaining_total 0",
      )
      expect(updatedMetricsText).toContain(
        "coinpoet_last_job_duration_seconds 8",
      )
    })

    it("should handle revalidation failure → metrics flow correctly", async () => {
      // Step 1: Mock failed revalidation (simulates CronJob encountering error)
      const errorMessage = "Database timeout during cache refresh"
      mockRevalidateCachedListings.mockRejectedValueOnce(
        new Error(errorMessage),
      )

      const revalidationResponse = await revalidateCachePost()
      const revalidationData = await revalidationResponse.json()

      // Step 2: Verify revalidation failed appropriately
      expect(revalidationResponse.status).toBe(500)
      expect(revalidationData.success).toBe(false)
      expect(revalidationData.error).toBe(errorMessage)

      // Step 3: Verify failure metrics are available
      expect(hasMetrics()).toBe(true)

      // Step 4: Verify metrics endpoint reflects failure state (for Prometheus alerting)
      const failureMetricsResponse = await metricsGet()
      const failureMetricsText = await failureMetricsResponse.text()

      expect(failureMetricsResponse.status).toBe(200) // Still 200 for Prometheus
      expect(failureMetricsText).toContain("coinpoet_last_job_success 0") // Indicates failure
      expect(failureMetricsText).toContain("coinpoet_listings_cached_total 0") // No listings cached
      expect(failureMetricsText).toContain("coinpoet_gpus_stale_start_total 0") // Empty failure state
    })

    it("should handle multiple job executions with metrics updates", async () => {
      // Step 1: First successful job
      const firstResult = { ...mockSuccessResult, listingCachedCount: 100 }
      mockRevalidateCachedListings.mockResolvedValueOnce(firstResult)

      await revalidateCachePost()

      let metricsResponse = await metricsGet()
      let metricsText = await metricsResponse.text()
      expect(metricsText).toContain("coinpoet_listings_cached_total 100")

      // Step 2: Second successful job with different results
      const secondResult = { ...mockSuccessResult, listingCachedCount: 300 }
      mockRevalidateCachedListings.mockResolvedValueOnce(secondResult)

      await revalidateCachePost()

      metricsResponse = await metricsGet()
      metricsText = await metricsResponse.text()
      expect(metricsText).toContain("coinpoet_listings_cached_total 300") // Updated value

      // Step 3: Failed job should update metrics to reflect failure
      mockRevalidateCachedListings.mockRejectedValueOnce(
        new Error("Network error"),
      )

      await revalidateCachePost()

      metricsResponse = await metricsGet()
      metricsText = await metricsResponse.text()
      expect(metricsText).toContain("coinpoet_last_job_success 0") // Now shows failure
    })

    it("should maintain proper HTTP status codes for Kubernetes and Prometheus", async () => {
      // Verify that revalidation failures return 500 (for K8s CronJob failure detection)
      mockRevalidateCachedListings.mockRejectedValueOnce(
        new Error("Test error"),
      )
      const revalidationResponse = await revalidateCachePost()
      expect(revalidationResponse.status).toBe(500)

      // Verify that metrics always return 200 (for Prometheus scrape success)
      const metricsResponse = await metricsGet()
      expect(metricsResponse.status).toBe(200)
    })

    it("should include proper Content-Type headers for each endpoint", async () => {
      // Test revalidation endpoint returns JSON
      mockRevalidateCachedListings.mockResolvedValueOnce(mockSuccessResult)
      const revalidationResponse = await revalidateCachePost()
      expect(revalidationResponse.headers.get("Content-Type")).toContain(
        "application/json",
      )

      // Test metrics endpoint returns Prometheus format
      const metricsResponse = await metricsGet()
      expect(metricsResponse.headers.get("Content-Type")).toContain(
        "text/plain",
      )
      expect(metricsResponse.headers.get("Content-Type")).toContain(
        "version=0.0.4",
      )
    })
  })
})
