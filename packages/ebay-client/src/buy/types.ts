/** Represents an ebay item aspect.
 * You can get a list of all aspects for a given category via https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getItemAspectsForCategory
 */
export interface AspectFilter {
  /** The category ID that these aspects are for */
  category: Pick<Category, "categoryId"> &
    Partial<Pick<Category, "categoryName">>
  /** The list of aspects+values to apply as a filter */
  aspects: AspectPair[]
}

/** The combination of an aspect name and value. For use in filtering by that values. */
export interface AspectPair {
  /** The name of the aspect */
  localizedAspectName: string
  /** One or more values for the filter */
  values: AspectValue[]
}

/** The value of an aspect. See https://developer.ebay.com/api-docs/commerce/taxonomy/types/txn:AspectValue */
export interface AspectValue {
  value: string
}

/**
 * Represents an item category.
 * A complete list of categories can be retrieved via https://developer.ebay.com/api-docs/commerce/taxonomy/resources/category_tree/methods/getCategoryTree
 * See also https://developer.ebay.com/api-docs/buy/browse/types/gct:Category
 */
export interface Category {
  categoryId: string
  categoryName: string
}

/**
 * For all available fields see https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#h2-output */
export interface ItemSummary {
  itemId: string
  title: string
  price: Price
  buyingOptions: ItemBuyingOption[]
  image: Image
  adultOnly: boolean
  /** The URI for the Browse API getItem method, which can be used to retrieve more details about items in the search results. */
  itemHref: string
  /** The leaf category IDs of the item. When the item belongs to two leaf categories, the ID values are returned in the order primary, secondary. */
  leafCategoryIds: string[]
  /** The ID of the eBay marketplace where the seller listed the item. */
  listingMarketplaceId: string
  seller: Seller
  categories?: Category[]
  condition?: string
  conditionId?: string
  /**
   * The URL to the View Item page of the item which includes the affiliate tracking ID.
   *
   * Note: In order to receive commissions on sales, eBay Partner Network affiliates must use this URL to forward buyers to the listing on the eBay marketplace.
   *
   * The itemAffiliateWebUrl is only returned if:
   * - The marketplace through which the item is being viewed is part of the eBay Partner Network. Currently Poland (EBAY_PL) and Singapore (EBAY_SG) are not supported.
   * - The seller enables affiliate tracking for the item by including the X-EBAY-C-ENDUSERCTX request header in the method (see @see BuyApiOptions.affiliateCampaignId ).
   */
  itemAffiliateWebUrl?: string

  thumbnailImages?: Image[]

  /** An ePID is the eBay product identifier of a product from the eBay product catalog. This indicates the product in which the item belongs.  */
  epid?: string
}

export interface Price {
  value: string
  currency: string
}

export interface Image {
  imageUrl: string
}

export type ItemBuyingOption =
  | "FIXED_PRICE"
  | "AUCTION"
  | "BEST_OFFER"
  | "CLASSIFIED_AD"

/** See https://developer.ebay.com/api-docs/buy/browse/types/gct:ItemLocationImpl */
export interface ItemLocation {
  country: CountryCode
}

export type CountryCode = "US" | string

export interface Seller {
  username: string
  /**The percentage of the total positive feedback. */
  feedbackPercentage: string
  feedbackScore: number
  sellerAccountType: SellerAccountType
}

type SellerAccountType = "INDIVIDUAL" | "BUSINESS"
