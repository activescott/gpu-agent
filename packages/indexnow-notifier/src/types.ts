/**
 * Supported notification providers
 */
export type NotifierProvider = "indexnow" | "google"

/**
 * A single entry from the sitemap.xml
 */
export interface SitemapEntry {
  /** The full URL of the page */
  url: string
  /** The last modification date from the sitemap */
  lastModified: Date
}

/**
 * Configuration for the IndexNow provider
 */
export interface IndexNowConfig {
  /** The IndexNow API key */
  apiKey: string
}

/**
 * Configuration for the Google Indexing API provider
 */
export interface GoogleIndexingConfig {
  /** Service account email (client_email from JSON key) */
  serviceAccountEmail: string
  /** Private key (private_key from JSON key) */
  privateKey: string
}

/**
 * Configuration for the notifier
 */
export interface NotifierConfig {
  /** URL of the sitemap.xml to fetch */
  sitemapUrl: string
  /** The host/domain (e.g., "gpupoet.com") */
  host: string
  /** Directory path where per-URL state files are stored */
  stateDir: string
  /** If true, log what would be done without actually calling APIs */
  dryRun?: boolean
  /** Which providers to use (default: all configured providers) */
  enabledProviders: NotifierProvider[]
  /** IndexNow configuration (required if indexnow provider is enabled) */
  indexNow?: IndexNowConfig
  /** Google Indexing API configuration (required if google provider is enabled) */
  google?: GoogleIndexingConfig
}

/**
 * Result for a single provider
 */
export interface ProviderResult {
  /** Provider name */
  provider: NotifierProvider
  /** Number of URLs that were notified */
  urlsNotified: number
  /** Any errors that occurred */
  errors: string[]
}

/**
 * Result of running the notifier
 */
export interface NotificationResult {
  /** Total number of URLs found in the sitemap */
  urlsChecked: number
  /** Total number of URLs that needed notification */
  urlsToNotify: number
  /** Results per provider */
  providerResults: ProviderResult[]
  /** Any global errors that occurred (not provider-specific) */
  errors: string[]
}

/**
 * Generic response from a notification API
 */
export interface NotifierResponse {
  /** Whether the request was successful */
  success: boolean
  /** HTTP status code */
  statusCode: number
  /** Human-readable message */
  message: string
}

/**
 * Response from the IndexNow API (alias for compatibility)
 */
export type IndexNowResponse = NotifierResponse

/**
 * Response from the Google Indexing API
 */
export type GoogleIndexingResponse = NotifierResponse
