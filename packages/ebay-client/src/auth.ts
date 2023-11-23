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

export const MapEbayEnvironmentToUrl = {
  [EbayEnvironment.SANDBOX]: "https://api.sandbox.ebay.com",
  [EbayEnvironment.PRODUCTION]: "https://api.ebay.com",
}
