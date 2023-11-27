import { ReactNode, cache } from "react"
import { createDiag } from "@activescott/diag"
import {
  createBuyApi,
  BuyApiOptions,
  EbayEnvironment,
  ItemSummary,
} from "ebay-client"
import EBAY_US from "ebay-client/categories/US_EBAY"
import { SERVER_CONFIG, isProduction } from "@/pkgs/isomorphic/config"
import fs from "fs"
import path from "path"
import type { Metadata } from "next"
import { arrayToAsyncIterable } from "@/pkgs/isomorphic/collection"
import { BootstrapIcon } from "@/pkgs/client/components/BootstrapIcon"

const log = createDiag("shopping-agent:shop:nvidia-t4")

// revalidate the data at most every hour:
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Price Compare NVIDIA T4 GPUs",
  description: "Compare prices for NVIDIA T4 GPUs",
  alternates: { canonical: "https://coinpoet.com/shop/nvidia-t4" },
}

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

async function getListingsUncached(): Promise<AsyncIterable<ItemSummary>> {
  if (!isProduction() && fs.existsSync(getJsonListingsPath())) {
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

const getListings = cache(getListingsUncached)

export default async function Page() {
  const items = await getListings()

  // TODO: add a slice function to irritable-iterable
  const listings: ItemSummary[] = []
  let count = 0

  // TODO: Eliminate this loop. Add first(n) to irritable-iterable
  for await (const item of items) {
    // filter items:
    if (typeof item.itemAffiliateWebUrl !== "string") {
      log.error("item has no affiliate link", item.itemId)
      continue
    }
    if (!item.buyingOptions.includes("FIXED_PRICE")) {
      log.info("item is not fixed price", item.itemId)
      continue
    }

    listings.push(item)
    // eslint-disable-next-line no-magic-numbers
    if (++count > 50) {
      break
    }
  }

  return (
    <main>
      <h1>Listings</h1>
      <div id="listingContainer" className="d-flex flex-wrap">
        {listings.map((item) => (
          <ListingCard
            key={item.itemId}
            {...{
              itemId: item.itemId,
              itemUrl: item.itemAffiliateWebUrl!,
              priceValue: item.price.value,
              title: item.title,
              imageUrl: proxyImageUrl(chooseBestImageUrl(item)),
              buyingOptions: item.buyingOptions,
              condition: item.condition,
            }}
          />
        ))}
      </div>
    </main>
  )
}

function chooseBestImageUrl(item: ItemSummary): string {
  // thumbnailImages is conditional, but usually the same image as image, but smaller.
  if (item.thumbnailImages && item.thumbnailImages.length > 0) {
    return item.thumbnailImages[0].imageUrl
  }
  return item.image.imageUrl
}

function proxyImageUrl(imageUrl: string): string {
  const EBAY_IMAGE_PROXY_PATH = "/ei/"
  const EBAY_IMAGE_HOST = /^https:\/\/i.ebayimg.com\//
  return imageUrl.replace(EBAY_IMAGE_HOST, EBAY_IMAGE_PROXY_PATH)
}

interface ListingCardProps {
  itemId: string
  itemUrl: string
  priceValue: string
  title: string
  imageUrl: string
  condition: string | undefined
}
const ListingCard = ({
  itemId,
  itemUrl,
  priceValue,
  title,
  imageUrl,
  condition,
}: ListingCardProps) => {
  return (
    <div key={itemId} className="card m-1" style={{ width: "18rem" }}>
      <img
        src={imageUrl}
        className="card-img-top mx-auto mt-1"
        alt={title}
        style={{ maxWidth: "215px", maxHeight: "215px" }}
      />
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">
          <Pill>${priceValue}</Pill>
          {condition && <Pill>{condition}</Pill>}
        </p>
        <a
          href={itemUrl}
          className="btn btn-primary btn-sm"
          target="_blank"
          rel="noreferrer"
        >
          Buy Now
        </a>
      </div>
      <div className="card-footer text-end">
        <span className="fs-6 fw-lighter fst-italic">
          Is this accurate?
          <a className="" target="_blank">
            <BootstrapIcon icon="hand-thumbs-up" size="xs" />
          </a>{" "}
          /
          <a className="" target="_blank">
            <BootstrapIcon icon="hand-thumbs-down" size="xs" />
          </a>
        </span>
      </div>
    </div>
  )
}

const Pill = ({ children }: { children: ReactNode }) => {
  return (
    <span className="badge rounded-pill text-bg-secondary mx-1">
      {children}
    </span>
  )
}
