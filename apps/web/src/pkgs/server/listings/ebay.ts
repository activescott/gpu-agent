import { convertEbayItemToListing, Gpu, Listing } from "@/pkgs/isomorphic/model"
import { getGpu } from "../db/GpuRepository"
import { PrismaClientWithinTransaction } from "../db/db"
import {
  addOrRefreshListingsForGpu,
  deleteStaleListingsForGpu,
} from "../db/ListingRepository"
import {
  BuyApiOptions,
  createBuyApi,
  EbayEnvironment,
  ItemSummary,
} from "@activescott/ebay-client"
import {
  isNextBuild,
  isProduction,
  SERVER_CONFIG,
} from "@/pkgs/isomorphic/config"
import { arrayToAsyncIterable } from "@/pkgs/isomorphic/collection"
import { createDiag } from "@activescott/diag"
import { chainAsync } from "irritable-iterable"
import fs from "fs"
import EBAY_US from "@activescott/ebay-client/categories/US_EBAY"
import { createFilterForGpu } from "../listingFilters"
import { Integer } from "type-fest"
import path from "path"
import { appRoot } from "../path"

const log = createDiag("shopping-agent:shop:listings:ebay")

/**
 * Fetches new listings from ebay for the specified GPU and caches them.
 * @returns The newly updated (and now cached) listings.
 */
export async function cacheEbayListingsForGpu(
  gpuName: string,
  prisma: PrismaClientWithinTransaction,
): Promise<Iterable<Listing>> {
  const start = new Date()
  const gpu = await getGpu(gpuName)
  const fetched = await fetchListingsForGpuDirectFromEbay(gpu)
  let collected: Listing[] = await chainAsync(fetched).collect()
  log.info(
    `Caching listings for ${gpuName}... fetched ${collected.length} listings from eBay`,
  )

  // remove any duplicate itemId's from the listings (it seems eBay returns these?)
  const originalListingCount = collected.length
  collected = collected.filter(
    (listing, index, self) =>
      self.findIndex((l) => l.itemId === listing.itemId) === index,
  )
  log.info(
    `Found ${
      originalListingCount - collected.length
    } duplicate listings from eBay for ${gpuName}`,
  )

  await addOrRefreshListingsForGpu(collected, gpuName, prisma)
  await deleteStaleListingsForGpu(gpuName, prisma)

  const duration = Date.now() - start.getTime()
  log.info(`Caching listings for ${gpuName} completed in ${duration}ms`)
  return collected
}

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

function getTestListingsPath(gpuName: string): string {
  return path.resolve(
    appRoot(),
    "../../../data/test-data/api-responses",
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

async function loadTestListingsFromJson(
  gpuName: string,
): Promise<ItemSummary[]> {
  const json = fs.readFileSync(getTestListingsPath(gpuName), "utf8")
  return JSON.parse(json)
}
