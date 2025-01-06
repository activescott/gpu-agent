import { createDiag } from "@activescott/diag"
import {
  CachedListing,
  listCachedListingsGroupedByGpu,
} from "../db/ListingRepository"
import { secondsToMilliseconds } from "../../isomorphic/duration"
import { cacheEbayListingsForGpu } from "./ebay"
import { CACHED_LISTINGS_DURATION_MS } from "../cacheConfig"
import { withTransaction } from "../db/db"
import { chain } from "irritable-iterable"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { withRetry } from "@/pkgs/isomorphic/retry"

const log = createDiag("shopping-agent:shop:listings")

interface ListingStats {
  staleGpusAtStart: { gpuName: string; oldestCachedAt: Date }[]
  listingCachedCount: number
  oldestCachedAt: Date
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

  const stats: ListingStats = {
    timeoutMs,
    totalDuration: 0,
    listingCachedCount: 0,
    oldestCachedAt: new Date(),
    staleGpusAtStart: [],
    staleGpusRemaining: 0,
    maxTimeToCacheOneGpu: 0,
  }

  await withRetry(
    () =>
      withTransaction(
        async (prisma): Promise<void> => {
          const gpus = await listCachedListingsGroupedByGpu(false, prisma)

          // If any gpu has listings older than CACHED_LISTINGS_DURATION_MS, OR has zero listings, then flag for re-caching.
          const gpusWithOldestCachedAt = gpus.map((gpuAndListings) => ({
            ...gpuAndListings,
            oldestCachedAt: getOldestCachedAt(gpuAndListings.listings),
          }))

          // track the oldest cachedAt value
          stats.oldestCachedAt = gpusWithOldestCachedAt
            .map((gpu) => gpu.oldestCachedAt)
            .reduce((oldest, current) => {
              return current < oldest ? current : oldest
            }, new Date())

          const staleGpus = gpusWithOldestCachedAt.filter((gpu) => {
            return (
              gpu.listings.length === 0 ||
              Date.now() - gpu.oldestCachedAt.getTime() >
                CACHED_LISTINGS_DURATION_MS
            )
          })

          log.info(`found ${staleGpus.length} GPUs that need re-cached`)

          stats.staleGpusAtStart = staleGpus.map((gpu) => ({
            gpuName: gpu.gpuName,
            oldestCachedAt: gpu.oldestCachedAt,
          }))

          if (staleGpus.length > 0) {
            // first sort the listings with the oldest ones first so that we re-cache those first (in case we exceed time budget)
            gpusWithOldestCachedAt.sort((a, b) => {
              return a.oldestCachedAt.getTime() - b.oldestCachedAt.getTime()
            })

            let timeBudgetRemaining = timeoutMs - (Date.now() - start.getTime())

            // remove some buffer time to allow listListingsAll to still return results from DB
            // eslint-disable-next-line no-magic-numbers
            timeBudgetRemaining -= secondsToMilliseconds(5)

            // it's really 1-3 seconds in practice just from some anecdotal monitoring
            // eslint-disable-next-line no-magic-numbers
            const TIME_TO_CACHE_ONE_GPU = secondsToMilliseconds(3)

            for (
              let gpu = staleGpus.pop();
              gpu !== undefined;
              gpu = staleGpus.pop()
            ) {
              if (timeBudgetRemaining < TIME_TO_CACHE_ONE_GPU) {
                log.warn(
                  `time budget exceeded, stopping caching of GPUs early. Remaining time: ${timeBudgetRemaining}ms, total duration: ${
                    Date.now() - start.getTime()
                  }ms. Remaining GPUs: ${staleGpus.length}.`,
                )
                stats.staleGpusRemaining = staleGpus.length
                break
              }
              const cachingStart = Date.now()
              const cached = await cacheEbayListingsForGpu(gpu.gpuName, prisma)
              stats.listingCachedCount += chain(cached).size()
              const cachingEnd = Date.now() - cachingStart
              if (cachingEnd > stats.maxTimeToCacheOneGpu) {
                stats.maxTimeToCacheOneGpu = cachingEnd
              }
              timeBudgetRemaining -= cachingEnd
            }
          }
        },
        {
          timeout: secondsToMilliseconds(timeoutMs),
          // eslint-disable-next-line no-magic-numbers
          maxWait: secondsToMilliseconds(10),
          isolationLevel: "RepeatableRead",
        },
      ),
    shouldRetryTransaction,
  )

  stats.totalDuration = Date.now() - start.getTime()
  log.info(`fetching cached listings for all GPUs complete. Stats: %o`, stats)

  return stats
}

function shouldRetryTransaction(error: unknown, retryCount: number): boolean {
  const prismaError =
    error instanceof PrismaClientKnownRequestError
      ? (error as PrismaClientKnownRequestError)
      : null

  log.warn(`transaction failed. checking if retryable...`, {
    prismaErrorCode: prismaError?.code,
    retryCount,
    err: error,
  })
  // https://www.prisma.io/docs/orm/reference/error-reference#error-codes
  const TRANSACTION_DEADLOCK_OR_WRITE_CONFLICT = "P2034"
  const MAX_RETRIES = 3
  if (
    retryCount < MAX_RETRIES &&
    prismaError?.code === TRANSACTION_DEADLOCK_OR_WRITE_CONFLICT
  ) {
    return true
  }
  log.error(`transaction failed permanently after ${retryCount} retries`, error)
  return false
}

function getOldestCachedAt(listings: CachedListing[]): Date {
  return listings
    .map((listing) => listing.cachedAt)
    .reduce((oldest, current) => {
      return current < oldest ? current : oldest
    }, new Date())
}
