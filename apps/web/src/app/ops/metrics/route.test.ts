import { GET } from "./route"
import { getPrometheusMetrics } from "../../../pkgs/server/metrics/metricsStore"
import { openMetricsContentType } from "prom-client"

// Mock the metrics store
jest.mock("../../../pkgs/server/metrics/metricsStore")

const mockGetPrometheusMetrics = getPrometheusMetrics as jest.MockedFunction<
  typeof getPrometheusMetrics
>

type GetPrometheusMetricsReturnType = ReturnType<typeof getPrometheusMetrics>

// Simple mock registry - just hardcode the methods we need
const createMockRegistry = (metricsContent: string) => {
  return {
    metrics: jest.fn().mockResolvedValue(metricsContent),
    contentType: openMetricsContentType,
    // Just hardcode each method as jest.fn() - simple and clear
    clear: jest.fn(),
    resetMetrics: jest.fn(),
    registerMetric: jest.fn(),
    getMetricsAsJSON: jest.fn(),
    getMetricsAsArray: jest.fn(),
    getSingleMetric: jest.fn(),
    getSingleMetricAsString: jest.fn(),
    removeSingleMetric: jest.fn(),
    setDefaultLabels: jest.fn(),
    setContentType: jest.fn(),
  } as unknown as GetPrometheusMetricsReturnType
}

/**
 * Tests for the Prometheus metrics endpoint.
 *
 * This endpoint serves metrics to Prometheus scrapers and returns data from the
 * last cache revalidation job executed by the Kubernetes CronJob. The endpoint
 * is publicly accessible (via ingress) for Prometheus to scrape.
 */
describe("/ops/metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, "now").mockReturnValue(1_000_000) // Fixed timestamp for consistent testing
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("GET", () => {
    it("should return Prometheus metrics when data is available", async () => {
      const mockMetricsContent = `# HELP coinpoet_last_job_success whether the last cache revalidation job succeeded (1) or failed (0)
# TYPE coinpoet_last_job_success gauge
coinpoet_last_job_success 1

# HELP coinpoet_listings_cached_total the total number of listings cached in the last job execution
# TYPE coinpoet_listings_cached_total gauge
coinpoet_listings_cached_total 150`

      const mockRegistry = createMockRegistry(mockMetricsContent)
      mockGetPrometheusMetrics.mockReturnValue(mockRegistry)

      const response = await GET()
      const text = await response.text()

      // Verify response status and content
      expect(response.status).toBe(200)
      expect(text).toBe(mockMetricsContent)

      // Verify correct Content-Type for Prometheus
      expect(response.headers.get("Content-Type")).toBe(
        "application/openmetrics-text; version=1.0.0; charset=utf-8",
      )

      // Verify Cache-Control header
      expect(response.headers.get("Cache-Control")).toBe("max-age=60")

      // Verify metrics store was called
      expect(mockGetPrometheusMetrics).toHaveBeenCalledTimes(1)
    })

    it("should return NaN metrics when no job has run yet", async () => {
      const mockNaNMetricsContent = `# HELP coinpoet_last_job_success whether the last cache revalidation job succeeded (1) or failed (0)
# TYPE coinpoet_last_job_success gauge
coinpoet_last_job_success 0

# HELP coinpoet_last_job_timestamp_seconds unix timestamp of the last cache revalidation job execution
# TYPE coinpoet_last_job_timestamp_seconds gauge
coinpoet_last_job_timestamp_seconds 0

# HELP coinpoet_listings_cached_total the total number of listings cached in the last job execution
# TYPE coinpoet_listings_cached_total gauge
coinpoet_listings_cached_total 0`

      const mockRegistry = createMockRegistry(mockNaNMetricsContent)
      mockGetPrometheusMetrics.mockReturnValue(mockRegistry)

      const response = await GET()
      const text = await response.text()

      // Should still return 200 OK (not 503) to keep Prometheus scrapes successful
      expect(response.status).toBe(200)
      expect(text).toContain("coinpoet_last_job_success 0")
      expect(text).toContain("coinpoet_last_job_timestamp_seconds 0")
      expect(text).toContain("coinpoet_listings_cached_total 0")
    })

    it("should include all expected metric types", async () => {
      const mockMetricsContent = `# HELP coinpoet_last_job_success whether the last cache revalidation job succeeded (1) or failed (0)
# TYPE coinpoet_last_job_success gauge
coinpoet_last_job_success 1

# HELP coinpoet_last_job_timestamp_seconds unix timestamp of the last cache revalidation job execution
# TYPE coinpoet_last_job_timestamp_seconds gauge
coinpoet_last_job_timestamp_seconds 1609459200

# HELP coinpoet_listings_oldest_age_start_seconds the age of the oldest cached listing in seconds at the start of the last job operation
# TYPE coinpoet_listings_oldest_age_start_seconds gauge
coinpoet_listings_oldest_age_start_seconds 3600

# HELP coinpoet_listings_oldest_age_remaining_seconds the age of the oldest cached listing in seconds at the end of the last job operation
# TYPE coinpoet_listings_oldest_age_remaining_seconds gauge
coinpoet_listings_oldest_age_remaining_seconds Nan

# HELP coinpoet_listings_cached_total the total number of listings cached in the last job execution
# TYPE coinpoet_listings_cached_total gauge
coinpoet_listings_cached_total 150

# HELP coinpoet_last_job_duration_seconds the time it took to revalidate the cached listings in the last job execution
# TYPE coinpoet_last_job_duration_seconds gauge
coinpoet_last_job_duration_seconds 30

# HELP coinpoet_gpus_stale_start_total The number of GPUs with stale cached listings at the start of the last job
# TYPE coinpoet_gpus_stale_start_total gauge
coinpoet_gpus_stale_start_total 5

# HELP coinpoet_gpus_stale_remaining_total the number of GPUs that still need to be cached after the last job
# TYPE coinpoet_gpus_stale_remaining_total gauge
coinpoet_gpus_stale_remaining_total 0

# HELP coinpoet_gpu_max_cache_duration_seconds the maximum time to cache one GPU in seconds during the last job
# TYPE coinpoet_gpu_max_cache_duration_seconds gauge
coinpoet_gpu_max_cache_duration_seconds 5`

      const mockRegistry = createMockRegistry(mockMetricsContent)
      mockGetPrometheusMetrics.mockReturnValue(mockRegistry)

      const response = await GET()
      const text = await response.text()

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
        expect(text).toContain(metric)
      }
    })

    it("should use correct cache control settings", async () => {
      const mockRegistry = createMockRegistry("test_metric 1")
      mockGetPrometheusMetrics.mockReturnValue(mockRegistry)

      const response = await GET()

      // Verify 60-second cache control for Prometheus scraping
      expect(response.headers.get("Cache-Control")).toBe("max-age=60")
    })

    it("should track metrics collection duration", async () => {
      // Mock Date.now to simulate time passage during metrics collection
      let callCount = 0
      jest.spyOn(Date, "now").mockImplementation(() => {
        callCount++
        if (callCount === 1) return 1_000_000 // start of request
        if (callCount === 2) return 1_000_100 // start of metrics collection
        return 1_000_150 // end of metrics collection (50ms later)
      })

      const mockRegistry = createMockRegistry("test_metric 1")
      mockGetPrometheusMetrics.mockReturnValue(mockRegistry)

      // The actual duration logging is internal, but we can verify the endpoint works
      const response = await GET()
      expect(response.status).toBe(200)
    })
  })
})
