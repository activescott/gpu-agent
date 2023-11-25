import { cache } from "react"
import { createDiag } from "@activescott/diag"
import {
  createBuyApi,
  BuyApiOptions,
  EbayEnvironment,
  ItemSummary,
} from "ebay-client"
import EBAY_US from "ebay-client/categories/US_EBAY"
import { SERVER_CONFIG } from "@/pkgs/isomorphic/config"
import Link from "next/link"

const log = createDiag("shopping-agent:shop:nvidia-t4")

// revalidate the data at most every hour:
export const revalidate = 3600

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Price Compare NVIDIA T4 GPUs",
  description: "Compare prices for NVIDIA T4 GPUs",
  alternates: { canonical: "https://coinpoet.com/shop/nvidia-t4" },
}

async function getListingsUncached() {
  log.info("fetching listings")
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
  return await ebay.search({
    query: "nvidia t4",
    filterCategory: videoCards,
  })
}

const getListings = cache(getListingsUncached)

export default async function Page() {
  const response = await getListings()

  // TODO: add a slice function to irritable-iterable
  const listings: ItemSummary[] = []
  let count = 0

  for await (const item of response.items) {
    listings.push(item)
    // eslint-disable-next-line no-magic-numbers
    if (++count > 10) {
      break
    }
  }

  return (
    <main>
      <h1>Listings</h1>
      <ul>
        {listings
          .filter((item) => {
            if (typeof item.itemAffiliateWebUrl !== "string") {
              log.error("item has no affiliate link", item.itemId)
              return false
            }
            return true
          })
          .map((item) => (
            <li key={item.itemId}>
              <Link href={item.itemAffiliateWebUrl!}>
                ${item.price.value} {item.title} ({item.itemId})
              </Link>
            </li>
          ))}
      </ul>
    </main>
  )
}
