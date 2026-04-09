import {
  minutesToSeconds,
  secondsToMilliseconds,
} from "@/pkgs/isomorphic/duration"
import { revalidateCachedListings } from "@/pkgs/server/listings"
import { updateMetrics } from "@/pkgs/server/metrics/metricsStore"
import { createLogger } from "@/lib/logger"

const log = createLogger("ops:revalidate-ebay")

// eslint-disable-next-line no-magic-numbers
const DEFAULT_TIMEOUT_SECONDS = minutesToSeconds(25) // 25 minutes - leave buffer for cron job

/**
 * eBay listing revalidation endpoint called by Kubernetes CronJob every 20 minutes.
 * Refreshes up to 4 stale GPUs per run within the time budget,
 * and updates metrics for Prometheus monitoring.
 *
 * Note: This endpoint is blocked from external access via ingress configuration.
 * Only internal Kubernetes services can call this endpoint.
 */
export async function POST() {
  const start = Date.now()
  log.info("starting eBay revalidation job")

  try {
    const result = await revalidateCachedListings(
      secondsToMilliseconds(DEFAULT_TIMEOUT_SECONDS),
    )

    updateMetrics(result, true)

    log.info(
      `eBay revalidation completed: ${result.listingCachedCount} listings cached`,
    )

    return Response.json({
      success: true,
      duration: Date.now() - start,
    })
  } catch (error) {
    const ebayError = error instanceof Error ? error.message : String(error)

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

    log.error({ err: error }, `eBay revalidation failed: ${ebayError}`)

    return Response.json(
      {
        success: false,
        error: ebayError,
        duration: Date.now() - start,
      },
      { status: 500 },
    )
  }
}
