import { GpuSpecs } from "./specs"
import { ItemSummary } from "ebay-client"

export interface Gpu extends GpuSpecs {
  name: string
  label: string
  // lastCachedListings is stored in the database to help us track cache of listings. | null because prisma :/
  lastCachedListings?: Date | null
  summary: string
  references: string[]
}

export interface Listing {
  itemId: string
  stale: boolean
  title: string
  priceValue: string
  priceCurrency: string
  buyingOptions: string[]
  imageUrl: string
  adultOnly: boolean
  itemHref: string
  leafCategoryIds: string[]
  // have seen results from ebay where listingMarketplaceId is not present
  // string | null because prisma :/
  listingMarketplaceId?: string | null
  sellerUsername: string
  sellerFeedbackPercentage: string
  sellerFeedbackScore: number
  condition: string | null
  conditionId: string | null
  itemAffiliateWebUrl: string
  thumbnailImageUrl: string
  epid: string
  itemCreationDate?: Date | null
  // string | null because prisma :/
  itemLocationCountry?: string | null
  gpu: Gpu
}

export function convertEbayItemToListing(
  listing: ItemSummary,
  gpu: Gpu,
): Listing {
  return {
    itemId: listing.itemId,
    stale: false,
    title: listing.title,
    priceValue: listing.price.value,
    priceCurrency: listing.price.currency,
    buyingOptions: listing.buyingOptions,
    imageUrl: proxyImageUrl(listing.image.imageUrl),
    adultOnly: listing.adultOnly,
    itemHref: listing.itemHref,
    leafCategoryIds: listing.leafCategoryIds,
    listingMarketplaceId: listing.listingMarketplaceId,
    sellerUsername: listing.seller.username,
    sellerFeedbackPercentage: listing.seller.feedbackPercentage,
    sellerFeedbackScore: listing.seller.feedbackScore,
    condition: listing.condition ?? null,
    conditionId: listing.conditionId ?? null,
    itemAffiliateWebUrl: listing.itemAffiliateWebUrl ?? "",
    thumbnailImageUrl: listing.thumbnailImages?.length
      ? proxyImageUrl(listing.thumbnailImages[0].imageUrl)
      : "",
    epid: listing.epid ?? "",
    itemCreationDate: listing.itemCreationDate,
    gpu,
    itemLocationCountry: listing.itemLocation?.country,
  }
}

function proxyImageUrl(imageUrl: string): string {
  const EBAY_IMAGE_PROXY_PATH = "/ei/"
  const EBAY_IMAGE_HOST = /^https:\/\/i.ebayimg.com\//
  return imageUrl.replace(EBAY_IMAGE_HOST, EBAY_IMAGE_PROXY_PATH)
}
