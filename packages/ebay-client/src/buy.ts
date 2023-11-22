import { fetchImpl } from "./util/fetch.js"

export interface BuyApi {
  // TODO: allow searching by aspects: https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search#uri.aspect_filter
  // see https://developer.ebay.com/api-docs/buy/browse/resources/item_summary/methods/search
  search(options: { query: string }): Promise<SearchResponse>
}

export interface SearchResponse {
  itemSummaries: ItemSummary[]
}

export interface ItemSummary {
  itemId: string
  title: string
  price: Price
  itemAffiliateWebUrl: string
}

export interface Price {
  value: string
  currency: string
}

export interface BuyApiOptions {
  credentials: EbayOAuthCredentials
  /**
   * Your affiliate campaign ID from eBay Partner Network (https://epn.ebay.com/).
   * Specify this to ensure links will be attributed to your campaign.
   */
  affiliateCampaignId?: string
}

export function createBuyApi(options: BuyApiOptions): BuyApi {
  return new BuyApiImpl(options)
}

/**
 * Represents eBay OAuth credentials.
 */
export interface EbayOAuthCredentials {
  environment: EbayEnvironment
  clientID: string
  clientSecret: string
}

export enum EbayEnvironment {
  SANDBOX,
  PRODUCTION,
}

const MapEbayEnvironmentToUrl = {
  [EbayEnvironment.SANDBOX]: "https://api.sandbox.ebay.com",
  [EbayEnvironment.PRODUCTION]: "https://api.ebay.com",
}

class BuyApiImpl implements BuyApi {
  private authToken?: AuthToken

  constructor(private options: BuyApiOptions) {
    if (!options.credentials) {
      throw new Error("missing credentials")
    }
  }
  async search(options: { query: string }): Promise<SearchResponse> {
    const resp = await this.httpGet("/buy/browse/v1/item_summary/search")
    const json = (await resp.json()) as SearchResponse
    return { itemSummaries: [] }
  }

  private baseUrl(): string {
    return MapEbayEnvironmentToUrl[this.options.credentials.environment]
  }

  async httpGet(relativePath: string): Promise<Response> {
    await this.ensureAuth()
    if (!this.authToken) {
      throw new Error("expected authToken")
    }
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.authToken.access_token}`,
      },
    }
    return fetchImpl(`${this.baseUrl()}${relativePath}`, options)
  }

  async ensureAuth(): Promise<void> {
    if (this.authToken && this.authToken.expires_at > Date.now()) {
      return
    }

    try {
      // https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html
      const form = new FormData()
      form.append("grant_type", "client_credentials")
      form.append("scope", "https://api.ebay.com/oauth/api_scope")
      const base64 = Buffer.from(
        `${this.options.credentials.clientID}:${this.options.credentials.clientSecret}`,
      ).toString("base64")
      const options = {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64}`,
        },
        body: form,
      }

      const url = `${this.baseUrl()}/identity/v1/oauth2/token`
      const result = await fetchImpl(url, options)
      if (!result.ok) {
        throw new Error(
          `failed to get auth token: ${result.status} ${result.statusText}`,
        )
      }
      const json = (await result.json()) as EbayClientCredentialsGrantResponse
      this.authToken = {
        access_token: json.access_token,
        token_type: json.token_type,
        expires_at: Date.now() + json.expires_in * 1000,
      }
    } catch (error) {
      throw new Error(`failed to get auth token`, { cause: error })
    }
  }
}

/**
 * Represents raw eBay OAuth tokens.
 */
export interface AuthToken {
  access_token: string
  token_type: "Application Access Token"
  /** milliseconds after epoch that token expires at */
  expires_at: number
}

/** The raw response from ebay per: https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html#request */
export interface EbayClientCredentialsGrantResponse {
  access_token: string
  // seconds until token expires
  expires_in: number
  token_type: "Application Access Token"
}
