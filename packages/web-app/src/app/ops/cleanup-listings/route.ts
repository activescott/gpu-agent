import {
  minutesToSeconds,
  secondsToMilliseconds,
} from "@/pkgs/isomorphic/duration"
import { cleanupInvalidListings, CleanupStats } from "@/pkgs/server/listings"
import { createLogger } from "@/lib/logger"

const log = createLogger("ops:cleanup-listings")

const DEFAULT_TIMEOUT_SECONDS = minutesToSeconds(5)

/**
 * Cleanup endpoint that applies listing filters to all active listings and
 * archives those that don't pass current filter criteria.
 *
 * This is called by Kubernetes CronJob daily to clean up any listings that:
 * - Slipped through previous filtering
 * - Would now be filtered by newly added filter rules
 *
 * Note: This endpoint is blocked from external access via ingress configuration.
 * Only internal Kubernetes services can call this endpoint.
 */
export async function POST() {
  const start = Date.now()
  log.info("starting cleanup job")

  try {
    const result: CleanupStats = await cleanupInvalidListings(
      secondsToMilliseconds(DEFAULT_TIMEOUT_SECONDS),
    )

    const duration = Date.now() - start
    log.info(`cleanup completed successfully in ${duration}ms`)

    return Response.json({
      success: true,
      duration,
      stats: {
        gpusProcessed: result.gpusProcessed,
        totalListingsProcessed: result.totalListingsProcessed,
        archivedCount: result.archivedCount,
        totalDuration: result.totalDuration,
      },
    })
  } catch (error) {
    const duration = Date.now() - start
    const errorMessage = error instanceof Error ? error.message : String(error)

    log.error({ err: error }, `cleanup failed after ${duration}ms`)

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
