import {
  updateMetrics,
  getMetrics,
  hasMetrics,
  getPrometheusMetrics,
  resetMetrics,
} from "./metricsStore"
import type { ListingStats } from "../listings/listings"

describe("metricsStore", () => {
  beforeEach(() => {
    // Reset metrics store before each test
    resetMetrics()
  })

  const mockListingStats: ListingStats = {
    staleGpusAtStart: [
      { gpuName: "test-gpu-1", oldestCachedAt: new Date("2023-01-01") },
      { gpuName: "test-gpu-2", oldestCachedAt: new Date("2023-01-02") },
    ],
    listingCachedCount: 100,
    oldestCachedAtStart: new Date("2023-01-01"),
    oldestCachedAtRemaining: null,
    totalDuration: 5000,
    timeoutMs: 30_000,
    staleGpusRemaining: 0,
    maxTimeToCacheOneGpu: 2000,
  }

  describe("hasMetrics", () => {
    it("should return false when no metrics have been stored", () => {
      expect(hasMetrics()).toBe(false)
    })

    it("should return true after metrics are updated", () => {
      updateMetrics(mockListingStats, true)
      expect(hasMetrics()).toBe(true)
    })
  })

  describe("updateMetrics", () => {
    it("should store successful job metrics", () => {
      updateMetrics(mockListingStats, true)

      const metrics = getMetrics()
      if (!metrics) {
        throw new Error("Expected metrics to be stored")
      }
      expect(metrics.success).toBe(true)
      expect(metrics.stats).toEqual(mockListingStats)
      expect(metrics.error).toBeUndefined()
    })

    it("should store failed job metrics with error", () => {
      const errorMessage = "Job failed due to timeout"
      updateMetrics(mockListingStats, false, errorMessage)

      const metrics = getMetrics()
      if (!metrics) {
        throw new Error("Expected metrics to be stored")
      }
      expect(metrics.success).toBe(false)
      expect(metrics.error).toBe(errorMessage)
    })

    it("should update timestamp when metrics are stored", () => {
      const beforeUpdate = new Date()
      updateMetrics(mockListingStats, true)
      const afterUpdate = new Date()

      const metrics = getMetrics()
      if (!metrics) {
        throw new Error("Expected metrics to be stored")
      }
      expect(metrics.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      )
      expect(metrics.timestamp.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      )
    })
  })

  describe("getPrometheusMetrics", () => {
    it("should return registry with NaN values when no metrics available", async () => {
      const registry = getPrometheusMetrics()
      expect(registry).toBeTruthy()

      const metricsText = await registry.metrics()
      expect(metricsText).toContain("coinpoet_last_job_success 0")
      expect(metricsText).toContain("coinpoet_last_job_timestamp_seconds 0")
    })

    it("should return Prometheus registry when metrics available", async () => {
      updateMetrics(mockListingStats, true)

      const registry = getPrometheusMetrics()

      // Test that we can get metrics text from the registry
      const metricsText = await registry.metrics()
      expect(metricsText).toContain("coinpoet_last_job_success")
      expect(metricsText).toContain("coinpoet_last_job_timestamp_seconds")
      expect(metricsText).toContain("coinpoet_listings_cached_total")
    })

    it("should generate metrics with correct job success value", async () => {
      // Test successful job
      updateMetrics(mockListingStats, true)
      let registry = getPrometheusMetrics()
      let metricsText = await registry.metrics()
      expect(metricsText).toContain("coinpoet_last_job_success 1")

      // Test failed job
      updateMetrics(mockListingStats, false)
      registry = getPrometheusMetrics()
      metricsText = await registry.metrics()
      expect(metricsText).toContain("coinpoet_last_job_success 0")
    })

    it("should include all expected metric types", async () => {
      updateMetrics(mockListingStats, true)
      const registry = getPrometheusMetrics()
      const metricsText = await registry.metrics()

      const expectedMetrics = [
        "coinpoet_last_job_success",
        "coinpoet_last_job_timestamp_seconds",
        "coinpoet_listings_oldest_age_start_seconds",
        "coinpoet_listings_oldest_age_remaining_seconds",
        "coinpoet_listings_cached_total",
        "coinpoet_last_job_duration_seconds",
        "coinpoet_gpus_stale_start_total",
        "coinpoet_gpus_stale_remaining_total",
        "coinpoet_gpu_max_cache_duration_seconds",
      ]

      for (const metric of expectedMetrics) {
        expect(metricsText).toContain(metric)
      }
    })
  })
})
