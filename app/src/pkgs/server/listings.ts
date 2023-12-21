import {
  createBuyApi,
  BuyApiOptions,
  EbayEnvironment,
  ItemSummary,
} from "ebay-client"
import EBAY_US from "ebay-client/categories/US_EBAY"
import {
  SERVER_CONFIG,
  isNextBuild,
  isProduction,
} from "@/pkgs/isomorphic/config"
import fs from "fs"
import {
  arrayToAsyncIterable,
  flattenIterables,
} from "@/pkgs/isomorphic/collection"
import path from "path"
import { createDiag } from "@activescott/diag"
import { Gpu, Listing, convertEbayItemToListing } from "../isomorphic/model"
import { chainAsync, headAsync } from "irritable-iterable"
import { appRoot } from "./path"
import {
  getGpu,
  getGpuLastCachedListings,
  listGpus,
  updateGpuLastCachedListings,
} from "./db/GpuRepository"
import {
  addListingsForGpu,
  listListingsForGpu,
  markListingsFreshForGpu,
  markListingsStaleForGpu,
} from "./db/ListingRepository"
import { withTransaction } from "./db/db"
import { Integer } from "type-fest"
import { createFilterForGpu } from "./listingFilters"
import { secondsToMilliseconds } from "../isomorphic/duration"

const log = createDiag("shopping-agent:shop:listings")

async function fetchListingsForGpuDirectFromEbay(
  gpu: Gpu,
): Promise<AsyncIterable<Listing>> {
  let rawListings: AsyncIterable<ItemSummary>
  if (
    // eslint-disable-next-line no-constant-binary-expression, no-constant-condition
    false &&
    !isProduction() &&
    !isNextBuild() &&
    fs.existsSync(getTestListingsPath(gpu.name))
  ) {
    log.warn("loading test listings from json (non-production)")
    rawListings = arrayToAsyncIterable(await loadTestListingsFromJson(gpu.name))
  } else {
    log.info("fetching listings from ebay")
    const options: BuyApiOptions = {
      credentials: {
        environment: SERVER_CONFIG.EBAY_ENVIRONMENT() as EbayEnvironment,
        clientID: SERVER_CONFIG.EBAY_CLIENT_ID(),
        clientSecret: SERVER_CONFIG.EBAY_CLIENT_SECRET(),
      },
      affiliateCampaignId: SERVER_CONFIG.EBAY_AFFILIATE_CAMPAIGN_ID(),
    }

    const videoCards =
      EBAY_US.Root["Computers/Tablets & Networking"][
        "Computer Components & Parts"
      ]["Graphics/Video Cards"]

    const ebay = createBuyApi(options)
    const response = await ebay.search({
      query: gpu.label,
      filterCategory: videoCards,
      // NOTE: don't bother with fieldgroups EXTENDED to add shortDescription. It
      //   isn't helpful at all despite what the docs say, it doesn't include
      //   title+aspects, it is just a concise summary of the actual
      //   seller-provided description which varies in value.
      // fieldgroups: ["MATCHING_ITEMS", "EXTENDED"],
    })
    rawListings = response.items

    if (!isProduction() && !fs.existsSync(getTestListingsPath(gpu.name))) {
      log.info("writing listings to json (non-production, json not found)")
      rawListings = arrayToAsyncIterable(
        await dumpTestListingsToJson(gpu.name, response.items),
      )
    }
  }
  return chainAsync(rawListings)
    .map((item) => convertEbayItemToListing(item, gpu))
    .filter(createFilterForGpu(gpu))
    .head(SERVER_CONFIG.MAX_LISTINGS_TO_CACHE_PER_GPU() as Integer<number>)
}

export async function fetchListingsForGpuWithCache(
  gpuName: string,
): Promise<Iterable<Listing>> {
  log.debug("checking DB to see if listings need updated for gpu %s", gpuName)
  // NOTE: there is a race condition here: Between the time we read the GPU and lastCachedListings and the time we update them below another request may cause the same listings to be fetched again. This is ok, we will just update the lastCachedListings again and the listings will be cached again. This is a small window, doesn't have much impact when it happens.
  const now = new Date()
  const lastCachedListings = await getGpuLastCachedListings(gpuName)
  log.info("last cached listings for %s at %s", gpuName, lastCachedListings)
  // eslint-disable-next-line no-magic-numbers
  const ONE_HOUR_MS = 1000 * 60 * 60
  if (
    lastCachedListings &&
    now.valueOf() - lastCachedListings.valueOf() < ONE_HOUR_MS
  ) {
    log.info("listings for %s are still fresh, returning cached", gpuName)
    // return the cached listings
    const cached = await listListingsForGpu(gpuName)
    log.info("found %s cached listings for %s", cached.length, gpuName)
    if (cached.length > 0) {
      return cached
    } else {
      log.info("Since there are zero cached listings, fetching from ebay..")
    }
  }
  log.info("listings for %s are stale, fetching from ebay", gpuName)
  // fetch from ebay and update the GPU repository
  const gpu = await getGpu(gpuName)
  const fetched = await fetchListingsForGpuDirectFromEbay(gpu)
  //  note ebay-client will fetch them ALL and there could be a LOT so we limit it here:
  const limited = headAsync(
    fetched,
    SERVER_CONFIG.MAX_LISTINGS_TO_CACHE_PER_GPU() as Integer<number>,
  )
  const collected = await limited.collect()
  log.info(
    "fetched '%s' listings from ebay for '%s'. Caching listings...",
    collected.length,
    gpuName,
  )
  // eslint-disable-next-line no-magic-numbers
  const INSERT_TRANSACTION_TIMEOUT = secondsToMilliseconds(15)
  // max wait: The maximum amount of time Prisma Client will wait to acquire a transaction from the database. The default value is 2 seconds.
  // eslint-disable-next-line no-magic-numbers
  const WAIT_TRANSACTION_TIMEOUT = secondsToMilliseconds(5)
  await withTransaction(
    async (prisma) => {
      await markListingsStaleForGpu(gpuName, prisma)
      await addListingsForGpu(collected, gpuName, prisma)
      // addListings will skip any duplicates and not add them again, so here we mark those as stale
      const promised = [
        await markListingsFreshForGpu(gpuName, collected, prisma),
        await updateGpuLastCachedListings(gpuName, prisma),
      ]
      await Promise.all(promised)
    },
    { timeout: INSERT_TRANSACTION_TIMEOUT, maxWait: WAIT_TRANSACTION_TIMEOUT },
  )
  log.info(
    "caching listings for gpu %s complete. Returning cached listings.",
    gpuName,
  )
  return collected
}

export async function fetchListingsForAllGPUsWithCache(): Promise<
  Iterable<Listing>
> {
  const gpus = await listGpus()
  const fetches = gpus.map((gpu) => fetchListingsForGpuWithCache(gpu.name))
  const listings = await Promise.all(fetches)
  return flattenIterables(listings)
}

function getTestListingsPath(gpuName: string): string {
  return path.resolve(
    appRoot(),
    "../../data/test-data/api-responses",
    `search-listings-${gpuName}.json`,
  )
}

async function dumpTestListingsToJson(
  gpuName: string,
  items: AsyncIterable<ItemSummary>,
): Promise<ItemSummary[]> {
  log.info("Dumping listings to json at", getTestListingsPath(gpuName))
  let count = 0
  const listings: ItemSummary[] = []
  for await (const item of items) {
    const mapped = {
      ...item,
      seller: {
        ...item.seller,
        username:
          "redacted-" + (Number.MAX_SAFE_INTEGER * Math.random()).toString(),
      },
    }
    listings.push(mapped)
    if (++count > SERVER_CONFIG.MAX_LISTINGS_TO_CACHE_PER_GPU()) {
      break
    }
  }
  const INDENT = 2
  const json = JSON.stringify(listings, null, INDENT)
  fs.writeFileSync(getTestListingsPath(gpuName), json)
  return listings
}

export async function loadTestListingsFromJson(
  gpuName: string,
): Promise<ItemSummary[]> {
  const json = fs.readFileSync(getTestListingsPath(gpuName), "utf8")
  return JSON.parse(json)
}
