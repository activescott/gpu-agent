import { createDiag } from "@activescott/diag"
import { millisecondsToSeconds } from "../../isomorphic/duration"
import { ListingStats } from "../listings/listings"
import client, { Registry, Gauge } from "prom-client"

const log = createDiag("shopping-agent:metrics:store")

interface StoredMetrics {
  stats: ListingStats
  timestamp: Date
  success: boolean
  error?: string
}

let currentMetrics: StoredMetrics | null = null

export function updateMetrics(stats: ListingStats, success: boolean, error?: string): void {
  currentMetrics = {
    stats,
    timestamp: new Date(),
    success,
    error,
  }
  log.info(`metrics updated: success=${success}, timestamp=${currentMetrics.timestamp.toISOString()}`)
}

export function getMetrics(): StoredMetrics | null {
  return currentMetrics
}

export function hasMetrics(): boolean {
  return currentMetrics !== null
}

export function resetMetrics(): void {
  currentMetrics = null
}

function buildMetricsRegistry(result: ListingStats, timestamp: Date, success: boolean) {
  const registry = new Registry<client.OpenMetricsContentType>()

  new Gauge({
    name: "coinpoet_last_job_success",
    help: "whether the last cache revalidation job succeeded (1) or failed (0)",
    registers: [registry],
    async collect() {
      this.set(success ? 1 : 0)
    },
  })

  new Gauge({
    name: "coinpoet_last_job_timestamp_seconds",
    help: "unix timestamp of the last cache revalidation job execution",
    registers: [registry],
    async collect() {
      this.set(millisecondsToSeconds(timestamp.getTime()))
    },
  })

  new Gauge({
    name: "coinpoet_listings_oldest_age_start_seconds",
    help: "the age of the oldest cached listing in seconds at the start of the last job operation",
    registers: [registry],
    async collect() {
      if (!result.oldestCachedAtStart) {
        this.set(Number.NaN)
        return
      }
      // unstable_cache returns the dates as strings on cache hit!
      const oldestCachedAt = new Date(result.oldestCachedAtStart).getTime()
      this.set(millisecondsToSeconds(timestamp.getTime() - oldestCachedAt))
    },
  })

  new Gauge({
    name: "coinpoet_listings_oldest_age_remaining_seconds",
    help: "the age of the oldest cached listing in seconds at the end of the last job operation",
    registers: [registry],
    async collect() {
      if (!result.oldestCachedAtRemaining) {
        // this happens when there are no remaining stale gpus
        this.set(Number.NaN)
        return
      }
      // unstable_cache returns the dates as strings on cache hit!
      const oldestCachedAt = new Date(result.oldestCachedAtRemaining).getTime()
      this.set(millisecondsToSeconds(timestamp.getTime() - oldestCachedAt))
    },
  })

  new Gauge({
    name: "coinpoet_listings_cached_total",
    help: "the total number of listings cached in the last job execution",
    registers: [registry],
    async collect() {
      this.set(result.listingCachedCount)
    },
  })

  new Gauge({
    name: "coinpoet_last_job_duration_seconds",
    help: "the time it took to revalidate the cached listings in the last job execution",
    registers: [registry],
    async collect() {
      this.set(millisecondsToSeconds(result.totalDuration))
    },
  })

  new Gauge({
    name: "coinpoet_gpus_stale_start_total",
    help: "The number of GPUs with stale cached listings at the start of the last job",
    registers: [registry],
    async collect() {
      this.set(result.staleGpusAtStart.length)
    },
  })

  new Gauge({
    name: "coinpoet_gpus_stale_remaining_total",
    help: "the number of GPUs that still need to be cached after the last job",
    registers: [registry],
    async collect() {
      this.set(result.staleGpusRemaining)
    },
  })

  new Gauge({
    name: "coinpoet_gpu_max_cache_duration_seconds",
    help: "the maximum time to cache one GPU in seconds during the last job",
    registers: [registry],
    async collect() {
      this.set(millisecondsToSeconds(result.maxTimeToCacheOneGpu))
    },
  })

  return registry
}

export function getPrometheusMetrics(): Registry<client.OpenMetricsContentType> {
  if (!hasMetrics()) {
    log.warn("no metrics available - cache revalidation job may not have run yet, returning NaN values")
    // Return empty/NaN metrics instead of null to keep Prometheus scrapes successful
    const emptyStats: ListingStats = {
      staleGpusAtStart: [],
      listingCachedCount: 0,
      oldestCachedAtStart: null,
      oldestCachedAtRemaining: null,
      totalDuration: 0,
      timeoutMs: 0,
      staleGpusRemaining: 0,
      maxTimeToCacheOneGpu: 0,
    }
    return buildMetricsRegistry(emptyStats, new Date(0), false)
  }

  const storedMetrics = currentMetrics!
  return buildMetricsRegistry(storedMetrics.stats, storedMetrics.timestamp, storedMetrics.success)
}