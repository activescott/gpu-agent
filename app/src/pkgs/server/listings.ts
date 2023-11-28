import {
  createBuyApi,
  BuyApiOptions,
  EbayEnvironment,
  ItemSummary,
} from "ebay-client"
import EBAY_US from "ebay-client/categories/US_EBAY"
import {
  SERVER_CONFIG,
  isNextProductionBuild,
  isProduction,
} from "@/pkgs/isomorphic/config"
import fs from "fs"
import { arrayToAsyncIterable } from "@/pkgs/isomorphic/collection"
import { cache } from "react"
import path from "path"
import { createDiag } from "@activescott/diag"

const log = createDiag("shopping-agent:shop:listings")

async function getListingsUncached(): Promise<AsyncIterable<ItemSummary>> {
  if (
    !isProduction() &&
    !isNextProductionBuild() &&
    fs.existsSync(getJsonListingsPath())
  ) {
    log.info("loading listings from json (non-production)")
    const listings = await loadListingsFromJson()
    return arrayToAsyncIterable(listings)
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
    query: "nvidia t4",
    filterCategory: videoCards,
    // NOTE: don't bother with fieldgroups EXTENDED to add shortDescription. It
    //   isn't helpful at all despite what the docs say, it doesn't include
    //   title+aspects, it is just a concise summary of the actual
    //   seller-provided description which varies in value.
    // fieldgroups: ["MATCHING_ITEMS", "EXTENDED"],
  })

  if (!isProduction()) {
    log.info("writing listings to json (non-production, json not found)")
    const items = await dumpListingsToJson(response.items)
    return arrayToAsyncIterable(items)
  }
  return response.items
}

export const getListings = cache(getListingsUncached)

function getJsonListingsPath(): string {
  /* eslint-disable unicorn/prefer-module */
  const appRoot = path.resolve(__dirname, "../../../..")
  const relativePathPrefix = path
    .relative(appRoot, __dirname)
    .replaceAll("/", "-")

  return path.resolve(
    __dirname,
    "../../../../../../../../data/test-data/api-responses",
    `${relativePathPrefix}-listings.json`,
  )
}

async function dumpListingsToJson(
  items: AsyncIterable<ItemSummary>,
): Promise<ItemSummary[]> {
  log.info("Dumping listings to json:", getJsonListingsPath())
  let count = 0
  const listings: ItemSummary[] = []
  for await (const item of items) {
    listings.push(item)
    // eslint-disable-next-line no-magic-numbers
    if (++count > 100) {
      break
    }
  }
  // eslint-disable-next-line no-magic-numbers
  const json = JSON.stringify(listings, null, 2)
  fs.writeFileSync(getJsonListingsPath(), json)
  return listings
}

async function loadListingsFromJson(): Promise<ItemSummary[]> {
  const json = fs.readFileSync(getJsonListingsPath(), "utf8")
  return JSON.parse(json)
}
