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

const log = createDiag("shopping-agent:shop:listings")

const ISOLATION_LEVEL = "RepeatableRead"

interface ListingStats {
  staleGpus: { gpuName: string; oldestCachedAt: Date }[]
  updateCount: number
  oldestCachedAt: Date
  totalDuration: number
  timeoutMs: number
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
    updateCount: 0,
    staleGpus: [],
    oldestCachedAt: new Date(),
  }

  // add some buffer to the transaction to make absolutely sure it doesn't deadlock before we finish our work here:
  const TRANSACTION_TIMEOUT_BUFFER_MS = 1000
  // eslint-disable-next-line no-magic-numbers
  const MAX_WAIT_TRANSACTION_TIMEOUT = secondsToMilliseconds(
    timeoutMs + TRANSACTION_TIMEOUT_BUFFER_MS,
  )
  const MAX_RUNTIME_TRANSACTION_TIMEOUT = secondsToMilliseconds(
    timeoutMs + TRANSACTION_TIMEOUT_BUFFER_MS,
  )

  await withTransaction(
    async (prisma) => {
      const gpus = await listCachedListingsGroupedByGpu(false, prisma)

      // If any gpu has listings older than CACHED_LISTINGS_DURATION_MS, OR has zero listings, then flag for re-caching.
      const gpusWithOldestCacheDate = gpus.map((gpuAndListings) => {
        const oldestCachedAt = getOldestCachedDate(gpuAndListings.listings)
        return {
          ...gpuAndListings,
          oldestCachedAt,
        }
      })

      const staleGpus = gpusWithOldestCacheDate.filter((gpu) => {
        return (
          gpu.listings.length === 0 ||
          Date.now() - gpu.oldestCachedAt.valueOf() >
            CACHED_LISTINGS_DURATION_MS
        )
      })

      log.info(`found ${staleGpus.length} GPUs that need re-cached`)

      stats.staleGpus = staleGpus.map((gpu) => ({
        gpuName: gpu.gpuName,
        oldestCachedAt: gpu.oldestCachedAt,
      }))

      stats.oldestCachedAt = staleGpus
        .map((gpu) => gpu.oldestCachedAt)
        .reduce((oldest, current) => {
          return current < oldest ? current : oldest
        }, new Date())

      if (staleGpus.length > 0) {
        // first sort the listings with the oldest ones first so that we re-cache those first (in case we exceed time budget)
        gpusWithOldestCacheDate.sort((a, b) => {
          return a.oldestCachedAt.valueOf() - b.oldestCachedAt.valueOf()
        })

        let timeBudgetRemaining = timeoutMs - (Date.now() - start.valueOf())

        // remove some buffer time to allow listListingsAll to still return results from DB
        // eslint-disable-next-line no-magic-numbers
        timeBudgetRemaining -= secondsToMilliseconds(4)

        // it's really 1-3 seconds in practice just from some anecdotal monitoring
        // eslint-disable-next-line no-magic-numbers
        const TIME_TO_CACHE_ONE_GPU = secondsToMilliseconds(2)
        for (const gpu of staleGpus) {
          if (timeBudgetRemaining < TIME_TO_CACHE_ONE_GPU) {
            log.warn(`time budget exceeded, stopping caching of GPUs early`, {
              timeBudgetRemaining,
              totalDuration: Date.now() - start.valueOf(),
            })
            break
          }

          const cachingStart = Date.now()
          const cached = await cacheEbayListingsForGpu(gpu.gpuName, prisma)
          timeBudgetRemaining -= Date.now() - cachingStart
          stats.updateCount += chain(cached).size()
        }
      }
    },
    {
      timeout: MAX_RUNTIME_TRANSACTION_TIMEOUT,
      maxWait: MAX_WAIT_TRANSACTION_TIMEOUT,
      isolationLevel: ISOLATION_LEVEL,
    },
  )

  stats.totalDuration = Date.now() - start.valueOf()
  log.info(
    `fetching cached listings for all GPUs complete. Took ${stats.totalDuration}ms`,
  )

  return stats
}

function getOldestCachedDate(listings: CachedListing[]): Date {
  return listings
    .map((listing) => listing.cachedAt)
    .reduce((oldest, current) => {
      return current < oldest ? current : oldest
    }, new Date())
}
