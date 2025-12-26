import { createLogger } from "./log.js"
import { fetchSitemap } from "./sitemap-parser.js"
import { needsNotification, setLastNotified } from "./state-store.js"
import { notifyIndexNow } from "./indexnow-client.js"
import { NotifierConfig, NotificationResult, SitemapEntry } from "./types.js"

const log = createLogger("notifier")

const MAX_URLS_TO_LOG = 10

/**
 * Find URLs from the sitemap that need to be notified.
 * A URL needs notification if it has been modified since the last notification,
 * or if it has never been notified.
 */
export async function findUpdatedUrls(
  entries: SitemapEntry[],
  stateDir: string,
): Promise<string[]> {
  const updatedUrls: string[] = []

  for (const entry of entries) {
    const needs = await needsNotification(
      stateDir,
      entry.url,
      entry.lastModified,
    )
    if (needs) {
      updatedUrls.push(entry.url)
    }
  }

  return updatedUrls
}

/**
 * Log URLs in dry run mode (limited to first 10)
 */
function logDryRunUrls(urls: string[]): void {
  log.info(`DRY RUN: Would notify IndexNow with ${urls.length} URLs:`)
  for (const url of urls.slice(0, MAX_URLS_TO_LOG)) {
    log.info(`  - ${url}`)
  }
  if (urls.length > MAX_URLS_TO_LOG) {
    log.info(`  ... and ${urls.length - MAX_URLS_TO_LOG} more`)
  }
}

/**
 * Build a map of URL to lastModified date from sitemap entries
 */
function buildUrlToLastModifiedMap(entries: SitemapEntry[]): Map<string, Date> {
  const urlToLastModified = new Map<string, Date>()
  for (const entry of entries) {
    urlToLastModified.set(entry.url, entry.lastModified)
  }
  return urlToLastModified
}

/**
 * Save notification state for updated URLs
 */
async function saveNotificationState(
  stateDir: string,
  updatedUrls: string[],
  urlToLastModified: Map<string, Date>,
): Promise<void> {
  log.info("Step 4: Updating notification state...")
  const now = new Date()

  for (const url of updatedUrls) {
    const lastModified = urlToLastModified.get(url) ?? now
    await setLastNotified(stateDir, url, lastModified)
  }
}

/**
 * Send notification to IndexNow API
 * Returns true if successful, false otherwise
 */
async function sendNotification(
  config: NotifierConfig,
  updatedUrls: string[],
  result: NotificationResult,
): Promise<boolean> {
  log.info("Step 3: Notifying IndexNow...")
  const response = await notifyIndexNow(
    config.host,
    config.indexNowKey,
    updatedUrls,
  )

  if (!response.success) {
    result.errors.push(`IndexNow notification failed: ${response.message}`)
    return false
  }

  result.urlsNotified = updatedUrls.length
  return true
}

/**
 * Run the IndexNow notifier.
 *
 * 1. Fetch the sitemap
 * 2. Find URLs that have been updated since last notification
 * 3. Notify IndexNow about the updated URLs
 * 4. Save the notification timestamps
 */
export async function runNotifier(
  config: NotifierConfig,
): Promise<NotificationResult> {
  const result: NotificationResult = {
    urlsChecked: 0,
    urlsNotified: 0,
    errors: [],
  }

  try {
    // Step 1: Fetch sitemap
    log.info("Step 1: Fetching sitemap...")
    const sitemapEntries = await fetchSitemap(config.sitemapUrl)
    result.urlsChecked = sitemapEntries.length
    log.info(`Found ${sitemapEntries.length} URLs in sitemap`)

    // Step 2: Find updated URLs
    log.info("Step 2: Finding updated URLs...")
    const updatedUrls = await findUpdatedUrls(sitemapEntries, config.stateDir)
    log.info(`Found ${updatedUrls.length} URLs that need notification`)

    if (updatedUrls.length === 0) {
      log.info("No URLs need notification, exiting successfully")
      return result
    }

    // Step 3: Notify IndexNow (or log in dry run mode)
    if (config.dryRun) {
      logDryRunUrls(updatedUrls)
      result.urlsNotified = updatedUrls.length
      return result
    }

    const notificationSuccess = await sendNotification(
      config,
      updatedUrls,
      result,
    )
    if (!notificationSuccess) {
      return result
    }

    // Step 4: Update state
    const urlToLastModified = buildUrlToLastModifiedMap(sitemapEntries)
    await saveNotificationState(config.stateDir, updatedUrls, urlToLastModified)

    log.info(`Notification complete: ${result.urlsNotified} URLs notified`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.error(`Notifier error: ${errorMessage}`)
    result.errors.push(errorMessage)
  }

  return result
}
