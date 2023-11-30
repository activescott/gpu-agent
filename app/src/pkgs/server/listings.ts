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
import { arrayToAsyncIterable } from "@/pkgs/isomorphic/collection"
import path from "path"
import { createDiag } from "@activescott/diag"
import { Listing, convertEbayItemToListing } from "../isomorphic/model"
import { chainAsync, headAsync } from "irritable-iterable"
import { appRoot } from "./path"
import { getGpu, updateGpuLastCachedListings } from "./db/GpuRepository"
import {
  addListingsForGpu,
  listListingsForGpu,
  markListingsFreshForGpu,
  markListingsStaleForGpu,
} from "./db/ListingRepository"
import { withTransaction } from "./db/db"
import { Integer } from "type-fest"

const log = createDiag("shopping-agent:shop:listings")

async function fetchListingsDirectFromEbay(
  gpuName: string,
): Promise<AsyncIterable<Listing>> {
  if (
    !isProduction() &&
    !isNextBuild() &&
    fs.existsSync(getTestListingsPath())
  ) {
    log.info("loading test listings from json (non-production)")
    const listings = await loadTestListingsFromJson()
    const converted = listings.map((item) => convertEbayItemToListing(item))
    return arrayToAsyncIterable(converted)
  }

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
    query: gpuName,
    filterCategory: videoCards,
    // NOTE: don't bother with fieldgroups EXTENDED to add shortDescription. It
    //   isn't helpful at all despite what the docs say, it doesn't include
    //   title+aspects, it is just a concise summary of the actual
    //   seller-provided description which varies in value.
    // fieldgroups: ["MATCHING_ITEMS", "EXTENDED"],
  })

  if (!isProduction()) {
    log.info("writing listings to json (non-production, json not found)")
    const items = await dumpTestListingsToJson(response.items)
    const converted = items.map((item) => convertEbayItemToListing(item))
    return arrayToAsyncIterable(converted)
  }
  return chainAsync(response.items).map((item) =>
    convertEbayItemToListing(item),
  )
}

export async function fetchListingsWithCache(
  gpuName: string,
): Promise<Iterable<Listing>> {
  log.debug("checking DB to see if listings need updated for gpu %s", gpuName)
  const gpu = await getGpu(gpuName)
  const now = new Date()
  const lastCachedListings = gpu.lastCachedListings
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
    log.info("found %s cached listings for %s", cached.length)
    return cached
  }
  log.info("listings for %s are stale, fetching from ebay", gpuName)
  // fetch from ebay and update the GPU repository
  const fetched = await fetchListingsDirectFromEbay(gpu.label)
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

  await withTransaction(async (prisma) => {
    await markListingsStaleForGpu(gpuName, prisma)
    await addListingsForGpu(collected, gpuName, prisma)
    // addListings will skip any duplicates and not add them again, so here we mark those as stale
    const promised = [
      markListingsFreshForGpu(gpuName, collected, prisma),
      updateGpuLastCachedListings(gpuName, prisma),
    ]
    await Promise.all(promised)
  })
  log.info(
    "caching listings for gpu %s complete. Returning cached listings.",
    gpuName,
  )
  return collected
}

function getTestListingsPath(): string {
  const listingsResponseId = "nvidia-t4"
  return path.resolve(
    appRoot(),
    "../../data/test-data/api-responses",
    `${listingsResponseId}-listings.json`,
  )
}

async function dumpTestListingsToJson(
  items: AsyncIterable<ItemSummary>,
): Promise<ItemSummary[]> {
  log.info("Dumping listings to json at", getTestListingsPath())
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
    // eslint-disable-next-line no-magic-numbers
    if (++count > 100) {
      break
    }
  }
  // eslint-disable-next-line no-magic-numbers
  const json = JSON.stringify(listings, null, 2)
  fs.writeFileSync(getTestListingsPath(), json)
  return listings
}

export async function loadTestListingsFromJson(): Promise<ItemSummary[]> {
  const json = fs.readFileSync(getTestListingsPath(), "utf8")
  return JSON.parse(json)
}
