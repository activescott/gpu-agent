import { createDiag } from "@activescott/diag"
import { Listing } from "../../isomorphic/model"
import {
  CachedListing,
  listListingsAll,
  listListingsForAllGpus,
  listListingsForGpus,
} from "../db/ListingRepository"
import { secondsToMilliseconds } from "../../isomorphic/duration"
import { cacheEbayListingsForGpu } from "./ebay"
import { CACHED_LISTINGS_DURATION_MS } from "../cacheConfig"

const log = createDiag("shopping-agent:shop:listings")

export async function fetchListingsForGpuWithCache(
  gpuName: string,
): Promise<Iterable<Listing>> {
  log.info(`getting cached listings for gpu ${gpuName} from db`)
  const cached = await listListingsForGpus([gpuName])
  if (!areListingsStale(cached)) {
    log.info(`listings for gpu ${gpuName} are fresh, returning cached listings`)
    return cached
  }

  log.info(`listings for gpu ${gpuName} are stale, fetching from ebay`)
  // fetch from ebay and update the GPU repository
  const collected = await cacheEbayListingsForGpu(gpuName)
  log.info(
    "caching listings for gpu %s complete. Returning cached listings.",
    gpuName,
  )
  return collected
}

/**
 * Fetches listings for all GPUs.
 * @param timeoutMs A timeout that the function will attempt to honor when fetching listings for all GPUs. This is a best-effort timeout, and the function may take longer to complete if the timeout is exceeded.
 * @returns
 */
export async function fetchListingsForAllGPUsWithCache(
  timeoutMs: number,
): Promise<Iterable<Listing>> {
  log.info("fetching listings for all GPUs with cache...")
  const start = new Date()

  const gpus = await listListingsForAllGpus()

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
      Date.now() - gpu.oldestCachedAt.valueOf() > CACHED_LISTINGS_DURATION_MS
    )
  })

  log.info(`found ${staleGpus.length} GPUs that need re-cached`)

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
      await cacheEbayListingsForGpu(gpu.gpuName)
      timeBudgetRemaining -= Date.now() - cachingStart
    }
  }

  const listings = await listListingsAll()

  const totalDuration = Date.now() - start.valueOf()
  log.info(
    `fetching cached listings for all GPUs complete. Took ${totalDuration}ms`,
  )

  return listings
}

/**
 * Returns true if the listings for the given GPU are stale.
 * The oldest cached listing is used to determine staleness.
 */
function areListingsStale(listings: CachedListing[]) {
  if (listings.length === 0) {
    return true
  }

  const oldestCachedAt = getOldestCachedDate(listings)
  return (
    listings.length === 0 ||
    Date.now() - oldestCachedAt.valueOf() > CACHED_LISTINGS_DURATION_MS
  )
}

function getOldestCachedDate(listings: CachedListing[]): Date {
  return listings
    .map((listing) => listing.cachedAt)
    .reduce((oldest, current) => {
      return current < oldest ? current : oldest
    }, new Date())
}
