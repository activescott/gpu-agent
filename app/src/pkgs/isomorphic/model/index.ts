import { GpuSpecs } from "./specs"
import { ItemSummary } from "ebay-client"

export interface Gpu extends GpuSpecs {
  name: string
  label: string
  gpuArchitecture: string
  /**
   * A list of the supported precisions for hardware-accelerated generalized matrix multiplication operations (GEMM).
   * Each value indicates a precision that is supported. In most cases this won't matter that much as the result will be reflected in OPS specs such as @see GpuSpecs.fp32TFLOPS or @see GpuSpecs.fp32TFLOPS. However, in some cases such as BF16, it may be less than clear that the GPU does or does not support the precision in those operations.
   * For example, the Turing and Volta Nvidia architectures support FP16, but not BF16.
   */
  supportedHardwareOperations: string[]
  // .. | null because prisma :/
  supportedCUDAComputeCapability?: number | null
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
  // string | null because prisma :/
  itemGroupType?: string | "SELLER_DEFINED_VARIATIONS" | null
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
