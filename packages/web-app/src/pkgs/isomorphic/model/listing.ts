import { ItemSummary } from "@activescott/ebay-client"
import { Gpu } from "./gpu"

export interface Listing {
  itemId: string
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
  // string | null because prisma :/
  itemGroupType?: string | "SELLER_DEFINED_VARIATIONS" | null
}

/**
 * Extended listing type that includes the metric value from GpuMetricValue.
 * Used by queries that join with GpuMetricValue to get dynamic metric data.
 */
export interface ListingWithMetric extends Listing {
  /** The metric value from GpuMetricValue table for the queried metric slug */
  metricValue: number
}

export function convertEbayItemToListing(
  listing: ItemSummary,
  gpu: Gpu,
): Listing {
  return {
    itemId: listing.itemId,
    title: listing.title,
    priceValue: listing.price.value,
    priceCurrency: listing.price.currency,
    buyingOptions: listing.buyingOptions,
    // listing.image is documented as required, but I've seen it null
    imageUrl: listing.image ? proxyImageUrl(listing.image.imageUrl) : "",
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
    itemGroupType: listing.itemGroupType,
  }
}
function proxyImageUrl(imageUrl: string): string {
  const EBAY_IMAGE_PROXY_PATH = "/ei/"
  const EBAY_IMAGE_HOST = /^https:\/\/i.ebayimg.com\//
  return imageUrl.replace(EBAY_IMAGE_HOST, EBAY_IMAGE_PROXY_PATH)
}

/**
 * Common reasons for excluding a listing from all queries.
 * These listings are data quality issues, not legitimate GPU listings.
 * Preserved for potential ML training to detect similar issues.
 *
 * Usage: When setting excludeReason on a listing, use one of these values.
 * The values are stored as strings in the database for flexibility.
 */
export const EXCLUDE_REASONS = {
  /** GPU accessory like backplate, bracket, fan, shroud */
  ACCESSORY: "accessory",
  /** Empty box only, no GPU included */
  BOX_ONLY: "box_only",
  /** Modified/neutered card with reduced specs */
  NEUTERED: "neutered",
  /** Suspected scam or fraudulent listing */
  SCAM: "scam",
  /** Seller-defined variations bundle (price misleading) */
  VARIATION_BUNDLE: "variation_bundle",
  /** For parts/not working condition */
  FOR_PARTS: "for_parts",
  /** Low seller feedback (< 90%) */
  LOW_FEEDBACK: "low_feedback",
  /** Other data quality issue */
  OTHER: "other",
} as const

export type ExcludeReason =
  (typeof EXCLUDE_REASONS)[keyof typeof EXCLUDE_REASONS]
