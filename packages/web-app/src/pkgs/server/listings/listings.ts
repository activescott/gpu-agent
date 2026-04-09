import { createLogger } from "@/lib/logger"
import {
  CachedListing,
  listCachedListingsGroupedByGpu,
  findMostStaleGpuForSource,
} from "../db/ListingRepository"
import { EPOCH, secondsToMilliseconds } from "../../isomorphic/duration"
import type { Listing } from "@/pkgs/isomorphic/model"
import { cacheEbayListingsForGpu } from "./ebay"
import { cacheAmazonListingsForGpu } from "./amazon"
import { CACHED_LISTINGS_DURATION_MS } from "../cacheConfig"
import { withTransaction } from "../db/db"
import { chain } from "irritable-iterable"
import {
  withRetry,
  shouldRetryPrismaTransaction,
} from "@/pkgs/isomorphic/retry"

const log = createLogger("shop:listings")

export interface ListingStats {
  staleGpusAtStart: { gpuName: string; oldestCachedAt: Date }[]
  listingCachedCount: number
  oldestCachedAtStart: Date | null
  oldestCachedAtRemaining: Date | null
  // duration in ms
  totalDuration: number
  timeoutMs: number
  staleGpusRemaining: number
  maxTimeToCacheOneGpu: number
}
/**
 * Checks which cached listings need updated and updates them .
 * @param timeoutMs A timeout that the function will attempt to honor when fetching listings for all GPUs. This is a best-effort timeout, and the function may take longer to complete if the timeout is exceeded.
 * @returns
 */
export async function revalidateCachedListings(
  timeoutMs: number,
): Promise<ListingStats> {
  const start = new Date()
  log.info("retrieving cached listings for all GPUs...")

  const statsFinal = await withRetry(
    () =>
      withTransaction(
        async (prisma): Promise<ListingStats> => {
          let staleGpusRemaining = 0
          let oldestCachedAtRemaining: Date | null = null
          let listingCachedCount = 0
          let maxTimeToCacheOneGpu: number | null = null

          const gpus = await listCachedListingsGroupedByGpu(false, prisma)

          // If any gpu has listings older than CACHED_LISTINGS_DURATION_MS, OR has zero listings, then flag for re-caching.
          const gpusWithOldestCachedAt = gpus.map((gpuAndListings) => ({
            ...gpuAndListings,
            oldestCachedAt: getOldestCachedAt(gpuAndListings.listings),
          }))

          // track the oldest cachedAt value
          const oldestCachedAtStart =
            gpusWithOldestCachedAt.length === 0
              ? null
              : gpusWithOldestCachedAt
                  .map((gpu) => gpu.oldestCachedAt)
                  .reduce((oldest, current) => {
                    return oldest.getTime() === EPOCH.getTime() ||
                      current < oldest
                      ? current
                      : oldest
                  }, EPOCH)

          const staleGpus = gpusWithOldestCachedAt.filter((gpu) => {
            return (
              gpu.listings.length === 0 ||
              Date.now() - gpu.oldestCachedAt.getTime() >
                CACHED_LISTINGS_DURATION_MS
            )
          })

          log.info(`found ${staleGpus.length} GPUs that need re-cached`)

          const staleGpusAtStart = staleGpus.map((gpu) => ({
            gpuName: gpu.gpuName,
            oldestCachedAt: gpu.oldestCachedAt,
          }))

          if (staleGpus.length > 0) {
            // Sort oldest first so the most stale GPUs get refreshed first
            gpusWithOldestCachedAt.sort((a, b) => {
              return a.oldestCachedAt.getTime() - b.oldestCachedAt.getTime()
            })

            // Limit to 4 GPUs per run to stay well under eBay's rate limit (5,000 calls/day).
            // Dev and prod share the same API key, so bursting through all stale GPUs
            // in one run can exhaust the budget and cause 429 errors.
            // With 4 GPUs per 20-min cron run, all ~75 GPUs cycle in ~6 hours
            // using ~900-1050 API calls/day (~20% of budget).
            const MAX_GPUS_PER_RUN = 4
            let gpusProcessed = 0

            for (
              let gpu = staleGpus.pop();
              gpu !== undefined;
              gpu = staleGpus.pop()
            ) {
              if (gpusProcessed >= MAX_GPUS_PER_RUN) {
                log.info(
                  `Reached per-run limit of ${MAX_GPUS_PER_RUN} GPUs. ${staleGpus.length} stale GPUs remaining for next run.`,
                )
                staleGpusRemaining = staleGpus.length
                break
              }
              const cachingStart = Date.now()
              const cached = await cacheEbayListingsForGpuWithLogging(
                gpu.gpuName,
                prisma,
              )
              listingCachedCount += chain(cached).size()
              gpusProcessed++
              const cachingEnd = Date.now() - cachingStart
              if (!maxTimeToCacheOneGpu || cachingEnd > maxTimeToCacheOneGpu) {
                maxTimeToCacheOneGpu = cachingEnd
              }
              oldestCachedAtRemaining =
                staleGpus.length > 0
                  ? getOldestCachedAt(staleGpus.flatMap((gpu) => gpu.listings))
                  : null
            }
          }
          return {
            staleGpusAtStart,
            listingCachedCount,
            oldestCachedAtStart,
            oldestCachedAtRemaining,
            totalDuration: Date.now() - start.getTime(),
            timeoutMs,
            staleGpusRemaining,
            maxTimeToCacheOneGpu: maxTimeToCacheOneGpu || Number.NaN,
          }
        },
        {
          timeout: secondsToMilliseconds(timeoutMs),
          // eslint-disable-next-line no-magic-numbers
          maxWait: secondsToMilliseconds(10),
          isolationLevel: "RepeatableRead",
        },
      ),
    shouldRetryPrismaTransaction,
  )

  statsFinal.totalDuration = Date.now() - start.getTime()
  log.debug(
    `fetching cached listings for all GPUs complete. Stats: %o`,
    statsFinal,
  )

  return statsFinal
}

async function cacheEbayListingsForGpuWithLogging(
  gpuName: string,
  prisma: Parameters<typeof cacheEbayListingsForGpu>[1],
): Promise<Iterable<Listing>> {
  try {
    return await cacheEbayListingsForGpu(gpuName, prisma)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.error(
      { err: error, gpuName },
      `caching listings failed for gpu=${gpuName}: ${errorMessage}`,
    )
    throw error
  }
}

function getOldestCachedAt(listings: CachedListing[]): Date {
  return listings
    .map((listing) => listing.cachedAt)
    .reduce((oldest, current) => {
      return current < oldest ? current : oldest
    }, new Date())
}

interface AmazonListingStats {
  gpuName: string | null
  listingCachedCount: number
  totalDuration: number
  success: boolean
  error?: string
}

/**
 * Revalidates Amazon listings for the single most-stale GPU.
 * Only one GPU is refreshed per run to avoid bot detection by Amazon.
 */
export async function revalidateAmazonListings(): Promise<AmazonListingStats> {
  const start = Date.now()
  let gpuName: string | null = null

  try {
    gpuName = await findMostStaleGpuForSource(
      "amazon",
      CACHED_LISTINGS_DURATION_MS,
    )

    if (!gpuName) {
      log.info("No stale Amazon GPUs found, skipping Amazon revalidation")
      return {
        gpuName: null,
        listingCachedCount: 0,
        totalDuration: Date.now() - start,
        success: true,
      }
    }

    log.info(`Revalidating Amazon listings for ${gpuName}`)

    const listings = await withRetry(
      () =>
        withTransaction(
          async (prisma) => cacheAmazonListingsForGpu(gpuName!, prisma),
          {
            // eslint-disable-next-line no-magic-numbers
            timeout: secondsToMilliseconds(120),
            // eslint-disable-next-line no-magic-numbers
            maxWait: secondsToMilliseconds(10),
            isolationLevel: "RepeatableRead",
          },
        ),
      shouldRetryPrismaTransaction,
    )

    const listingCount = listings.length
    const duration = Date.now() - start
    log.info(
      `Amazon revalidation completed: ${listingCount} listings for ${gpuName} in ${duration}ms`,
    )

    return {
      gpuName,
      listingCachedCount: listingCount,
      totalDuration: duration,
      success: true,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const duration = Date.now() - start
    log.error(
      { err: error },
      `Amazon revalidation failed for ${gpuName ?? "unknown"} after ${duration}ms: ${errorMessage}`,
    )
    return {
      gpuName,
      listingCachedCount: 0,
      totalDuration: duration,
      success: false,
      error: errorMessage,
    }
  }
}
