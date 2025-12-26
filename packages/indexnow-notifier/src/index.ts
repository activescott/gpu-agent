// Main notifier
export { runNotifier, findUpdatedUrls } from "./notifier.js"

// Sitemap parsing
export { fetchSitemap, parseSitemapXml } from "./sitemap-parser.js"

// State storage
export {
  getLastNotified,
  setLastNotified,
  needsNotification,
  encodeUrlToFilename,
  decodeFilenameToUrl,
} from "./state-store.js"

// IndexNow API client
export { notifyIndexNow } from "./indexnow-client.js"

// Types
export type {
  SitemapEntry,
  NotifierConfig,
  NotificationResult,
  IndexNowResponse,
} from "./types.js"
