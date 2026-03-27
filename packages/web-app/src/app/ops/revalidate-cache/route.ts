import {
  minutesToSeconds,
  secondsToMilliseconds,
} from "@/pkgs/isomorphic/duration"
import {
  revalidateCachedListings,
  revalidateAmazonListings,
} from "@/pkgs/server/listings"
import type { AmazonListingStats } from "@/pkgs/server/listings"
import { updateMetrics } from "@/pkgs/server/metrics/metricsStore"
import { recordAmazonSearch } from "@/pkgs/server/metrics/amazonMetrics"
import { createLogger } from "@/lib/logger"

const log = createLogger("ops:revalidate-cache")

// eslint-disable-next-line no-magic-numbers
const DEFAULT_TIMEOUT_SECONDS = minutesToSeconds(25) // 25 minutes - leave buffer for cron job

/**
 * Cache revalidation endpoint called by Kubernetes CronJob every 10 minutes.
 * This endpoint triggers the revalidation of stale GPU listing caches from
 * both eBay and Amazon, and updates metrics for Prometheus monitoring.
 *
 * eBay: Refreshes all stale GPUs within the time budget.
 * Amazon: Refreshes only the single most-stale GPU per run (anti-bot measure).
 *
 * Note: This endpoint is blocked from external access via ingress configuration.
 * Only internal Kubernetes services can call this endpoint.
 */
export async function POST() {
  const start = Date.now()
  log.info("starting cache revalidation job")

  let ebaySuccess = true
  let ebayError: string | undefined

  // eBay revalidation
  try {
    const result = await revalidateCachedListings(
      secondsToMilliseconds(DEFAULT_TIMEOUT_SECONDS),
    )

    updateMetrics(result, true)

    log.info(
      `eBay cache revalidation completed: ${result.listingCachedCount} listings cached`,
    )
  } catch (error) {
    ebaySuccess = false
    ebayError = error instanceof Error ? error.message : String(error)

    updateMetrics(
      {
        staleGpusAtStart: [],
        listingCachedCount: 0,
        oldestCachedAtStart: null,
        oldestCachedAtRemaining: null,
        totalDuration: Date.now() - start,
        timeoutMs: secondsToMilliseconds(DEFAULT_TIMEOUT_SECONDS),
        staleGpusRemaining: 0,
        maxTimeToCacheOneGpu: 0,
      },
      false,
      ebayError,
    )

    log.error({ err: error }, `eBay cache revalidation failed: ${ebayError}`)
  }

  // Amazon revalidation (non-fatal — eBay results are unaffected)
  let amazonResult: AmazonListingStats | null = null
  try {
    amazonResult = await revalidateAmazonListings()

    recordAmazonSearch(
      amazonResult.gpuName ?? "unknown",
      amazonResult.success,
      amazonResult.listingCachedCount,
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.warn(
      { err: error },
      `Amazon revalidation failed (non-fatal): ${errorMessage}`,
    )
    recordAmazonSearch("unknown", false)
  }

  const duration = Date.now() - start

  if (!ebaySuccess) {
    return Response.json(
      {
        success: false,
        error: ebayError,
        duration,
        amazon: amazonResult,
      },
      { status: 500 },
    )
  }

  return Response.json({
    success: true,
    duration,
    amazon: amazonResult,
  })
}
