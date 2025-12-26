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
 * Configuration for the IndexNow notifier
 */
export interface NotifierConfig {
  /** URL of the sitemap.xml to fetch */
  sitemapUrl: string
  /** The IndexNow API key */
  indexNowKey: string
  /** The host/domain (e.g., "gpupoet.com") */
  host: string
  /** Directory path where per-URL state files are stored */
  stateDir: string
  /** If true, log what would be done without actually calling IndexNow */
  dryRun?: boolean
}

/**
 * Result of running the notifier
 */
export interface NotificationResult {
  /** Total number of URLs found in the sitemap */
  urlsChecked: number
  /** Number of URLs that were notified to IndexNow */
  urlsNotified: number
  /** Any errors that occurred */
  errors: string[]
}

/**
 * Response from the IndexNow API
 */
export interface IndexNowResponse {
  /** Whether the request was successful */
  success: boolean
  /** HTTP status code */
  statusCode: number
  /** Human-readable message */
  message: string
}
