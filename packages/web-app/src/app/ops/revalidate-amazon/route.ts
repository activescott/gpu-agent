import { revalidateAmazonListings } from "@/pkgs/server/listings"
import { recordAmazonSearch } from "@/pkgs/server/metrics/amazonMetrics"
import { createLogger } from "@/lib/logger"

const log = createLogger("ops:revalidate-amazon")

/**
 * Amazon listing revalidation endpoint called by Kubernetes CronJob every 10 minutes.
 * Refreshes the single most-stale GPU per run to avoid bot detection.
 *
 * Note: This endpoint is blocked from external access via ingress configuration.
 * Only internal Kubernetes services can call this endpoint.
 */
export async function POST() {
  const start = Date.now()
  log.info("starting Amazon revalidation job")

  try {
    const result = await revalidateAmazonListings()

    recordAmazonSearch(
      result.gpuName ?? "unknown",
      result.success,
      result.listingCachedCount,
    )

    const duration = Date.now() - start
    log.info(
      `Amazon revalidation completed: ${result.listingCachedCount} listings for ${result.gpuName ?? "none"} in ${duration}ms`,
    )

    return Response.json({
      success: true,
      duration,
      amazon: result,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const duration = Date.now() - start

    log.error({ err: error }, `Amazon revalidation failed: ${errorMessage}`)
    recordAmazonSearch("unknown", false)

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
