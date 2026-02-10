import { createLogger } from "../logger"
import {
  AuthToken,
  EbayClientCredentialsGrantResponse,
  EbayOAuthCredentials,
  MapEbayEnvironmentToUrl,
} from "../auth"
import { fetchImpl } from "../util/fetch"
import { secondsToMilliseconds } from "../util/time"
import { AspectFilter, Category, ItemSummary } from "./types"

const logger = createLogger("buy")

export function createBuyApi(options: BuyApiOptions): BuyApi {
  return new BuyApiImpl(options)
}

export interface BuyApi {
  // TODO: allow searching by aspects: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#uri.aspect_filter
  // see https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
  search(options: SearchOptions): Promise<SearchResponse>
}

export interface SearchResponse {
  total: number
  items: AsyncGenerator<ItemSummary, void, unknown>
}

const DEFAULT_MAX_SEARCH_ITEMS = 50
export interface SearchOptions {
  query?: string
  filterCategory?: Pick<Category, "categoryId"> &
    Partial<Pick<Category, "categoryName">>
  filterAspect?: AspectFilter
  /** Determines some of the fields present in the response. See https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#uri.fieldgroups */
  fieldgroups?: SearchFieldGroup[]
  limit?: number
}

type SearchFieldGroup =
  | "ASPECT_REFINEMENTS"
  | "BUYING_OPTION_REFINEMENTS"
  | "CATEGORY_REFINEMENTS"
  | "CONDITION_REFINEMENTS"
  | "EXTENDED"
  | "MATCHING_ITEMS"
  | "FULL"

interface PagedResponseInfo {
  total: number
  limit: number
  /**
   * The URI for the next page of results.
   * This value is returned *if* there is an additional page of results to return from the result set.
   * The following example of the search method returns items 5 thru 10 from the list of items found.
   * https://api.ebay.com/buy/v1/item_summary/search?query=t-shirts&limit=5&offset=10
   */
  next?: string
  /**
   * The URI for the previous page of results. This is returned if there is a previous page of results from the result set.
   */
  prev?: string
  /**
   * This value indicates the offset used for current page of items being
   * returned. Assume the initial request used an offset of 0 and a limit of 3.
   * Then in the first page of results, this value would be 0, and items 1-3 are
   * returned. For the second page, this value is 3 and so on.
   */
  offset: number
}

/**
 * Documentation for the search response at https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#h2-output
 */
export interface SearchPageResponse extends PagedResponseInfo {
  itemSummaries: ItemSummary[]
}

export interface BuyApiOptions {
  credentials: EbayOAuthCredentials
  /**
   * Your affiliate campaign ID from eBay Partner Network (https://epn.ebay.com/).
   * Specify this to ensure links will be attributed to your campaign.
   */
  affiliateCampaignId?: string
}

class BuyApiImpl implements BuyApi {
  private authToken?: AuthToken

  public constructor(private options: BuyApiOptions) {
    if (!options.credentials) {
      throw new Error("missing credentials")
    }
    if (!(options.credentials.environment in MapEbayEnvironmentToUrl)) {
      throw new Error(
        `invalid environment of ${options.credentials.environment}. Expected one of ${Object.keys(MapEbayEnvironmentToUrl)}`,
      )
    }
  }

  public async search({
    query,
    filterCategory,
    fieldgroups,
    limit = DEFAULT_MAX_SEARCH_ITEMS,
  }: SearchOptions): Promise<SearchResponse> {
    // use options to get the first page of results:
    const url = new URL("/buy/browse/v1/item_summary/search", this.baseUrl())
    if (query) {
      url.searchParams.append("q", query)
    }
    if (filterCategory) {
      url.searchParams.append("category_ids", filterCategory.categoryId)
    }
    if (fieldgroups) {
      url.searchParams.append("fieldgroups", fieldgroups.join(","))
    }
    if (limit) {
      url.searchParams.append("limit", limit.toString())
    }
    const resp = await this.httpGet(url)
    const firstPage = (await resp.json()) as SearchPageResponse

    return {
      total: firstPage.total,
      // now searchItems will continue to return items as needed
      items: this.searchItems(firstPage),
    }
  }

  private async *searchItems(
    page: SearchPageResponse,
  ): AsyncGenerator<ItemSummary, void, unknown> {
    try {
      while (page) {
        // NOTE: page.itemSummaries can be undefined
        if (!page.itemSummaries || page.itemSummaries.length === 0) {
          logger.warn("ZERO itemSummaries in page!")
        } else {
          for (const item of page.itemSummaries) {
            yield item
          }
        }
        // after yielding the page items, get the next page. Conveniently ebay provides the HATEOS url to get it
        if (!page.next) {
          return
        }
        const resp = await this.httpGet(new URL(page.next))
        page = (await resp.json()) as SearchPageResponse
      }
    } catch (error) {
      logger.error({ err: error, page }, "error searching items")
    }
  }

  private baseUrl(): string {
    return MapEbayEnvironmentToUrl[this.options.credentials.environment]
  }

  private async httpGet(url: URL): Promise<Response> {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${await this.getAccessToken()}`,
      } as Record<string, string>,
    }
    if (this.options.affiliateCampaignId) {
      options.headers["X-EBAY-C-ENDUSERCTX"] =
        `affiliateCampaignId=${this.options.affiliateCampaignId}`
    }
    const resp = await fetchImpl(url.href, options)
    if (!resp.ok) {
      const body = await resp.text().catch(() => "(unable to read body)")
      throw new Error(
        `eBay API request failed: ${resp.status} ${resp.statusText} - ${body}`,
      )
    }
    return resp
  }

  private async getAccessToken(): Promise<string> {
    if (!this.authToken || this.authToken.expires_at <= Date.now()) {
      logger.debug({ baseUrl: this.baseUrl() }, "fetching access token")
      try {
        // https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html
        const form = new URLSearchParams()
        form.append("grant_type", "client_credentials")
        form.append("scope", "https://api.ebay.com/oauth/api_scope")

        const base64 = Buffer.from(
          `${this.options.credentials.clientID}:${this.options.credentials.clientSecret}`,
        ).toString("base64")
        const options = {
          method: "POST",
          headers: {
            Authorization: `Basic ${base64}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: form.toString(),
        }

        const url = new URL(`/identity/v1/oauth2/token`, this.baseUrl())
        const result = await fetchImpl(url.href, options)
        if (!result.ok) {
          throw new Error(
            `failed to get auth token: ${result.status} ${result.statusText}`,
          )
        }
        const json = (await result.json()) as EbayClientCredentialsGrantResponse
        this.authToken = {
          access_token: json.access_token,
          token_type: json.token_type,
          expires_at: Date.now() + secondsToMilliseconds(json.expires_in),
        }
        if (this.authToken.expires_at <= Date.now()) {
          throw new Error(
            `received an access token that is already expired: ${JSON.stringify(
              this.authToken,
            )}`,
          )
        }
        logger.debug("Access token fetched: %s", this.authToken)
      } catch (error) {
        throw new Error(`failed to get auth token`, { cause: error })
      }
    }
    return this.authToken.access_token
  }
}
