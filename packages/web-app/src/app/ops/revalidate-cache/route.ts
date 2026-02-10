import {
  minutesToSeconds,
  secondsToMilliseconds,
} from "@/pkgs/isomorphic/duration"
import { revalidateCachedListings } from "@/pkgs/server/listings"
import { updateMetrics } from "@/pkgs/server/metrics/metricsStore"
import { createLogger } from "@/lib/logger"

const log = createLogger("ops:revalidate-cache")

// eslint-disable-next-line no-magic-numbers
const DEFAULT_TIMEOUT_SECONDS = minutesToSeconds(25) // 25 minutes - leave buffer for cron job

/**
 * Cache revalidation endpoint called by Kubernetes CronJob every 30 minutes.
 * This endpoint triggers the revalidation of stale GPU listing caches and updates
 * metrics for Prometheus monitoring.
 *
 * Note: This endpoint is blocked from external access via ingress configuration.
 * Only internal Kubernetes services can call this endpoint.
 */
export async function POST() {
  const start = Date.now()
  log.info("starting cache revalidation job")

  try {
    const result = await revalidateCachedListings(
      secondsToMilliseconds(DEFAULT_TIMEOUT_SECONDS),
    )

    updateMetrics(result, true)

    const duration = Date.now() - start
    log.info(`cache revalidation completed successfully in ${duration}ms`)

    return Response.json({
      success: true,
      duration,
      stats: {
        staleGpusAtStart: result.staleGpusAtStart.length,
        listingCachedCount: result.listingCachedCount,
        staleGpusRemaining: result.staleGpusRemaining,
        totalDuration: result.totalDuration,
      },
    })
  } catch (error) {
    const duration = Date.now() - start
    const errorMessage = error instanceof Error ? error.message : String(error)

    updateMetrics(
      {
        staleGpusAtStart: [],
        listingCachedCount: 0,
        oldestCachedAtStart: null,
        oldestCachedAtRemaining: null,
        totalDuration: duration,
        timeoutMs: secondsToMilliseconds(DEFAULT_TIMEOUT_SECONDS),
        staleGpusRemaining: 0,
        maxTimeToCacheOneGpu: 0,
      },
      false,
      errorMessage,
    )

    log.error(
      { err: error },
      `cache revalidation failed after ${duration}ms: ${errorMessage}`,
    )

    return Response.json(
      {
        success: false,
        error: errorMessage,
        duration,
      },
      { status: 500 },
    )
  }
}
