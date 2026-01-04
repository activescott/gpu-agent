import { createLogger } from "./log.js"
import { fetchSitemap } from "./sitemap-parser.js"
import { needsNotification, setLastNotified } from "./state-store.js"
import { notifyIndexNow } from "./indexnow-client.js"
import { notifyGoogle } from "./google-indexing-client.js"
import {
  NotifierConfig,
  NotificationResult,
  SitemapEntry,
  NotifierProvider,
  ProviderResult,
} from "./types.js"

const log = createLogger("notifier")

const MAX_URLS_TO_LOG = 10

/**
 * Find URLs from the sitemap that need to be notified for a specific provider.
 * A URL needs notification if it has been modified since the last notification,
 * or if it has never been notified for this provider.
 */
export async function findUpdatedUrls(
  entries: SitemapEntry[],
  stateDir: string,
  provider: NotifierProvider,
): Promise<string[]> {
  const updatedUrls: string[] = []

  for (const entry of entries) {
    const needs = await needsNotification(
      stateDir,
      provider,
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
function logDryRunUrls(provider: NotifierProvider, urls: string[]): void {
  log.info(`DRY RUN: Would notify ${provider} with ${urls.length} URLs:`)
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
 * Save notification state for updated URLs for a specific provider
 */
async function saveNotificationState(
  stateDir: string,
  provider: NotifierProvider,
  updatedUrls: string[],
  urlToLastModified: Map<string, Date>,
): Promise<void> {
  log.info(`Updating ${provider} notification state...`)
  const now = new Date()

  for (const url of updatedUrls) {
    const lastModified = urlToLastModified.get(url) ?? now
    await setLastNotified(stateDir, provider, url, lastModified)
  }
}

/**
 * Run notification for a single provider.
 * Returns the provider result with success/failure info.
 */
async function runProviderNotification(
  config: NotifierConfig,
  provider: NotifierProvider,
  sitemapEntries: SitemapEntry[],
  urlToLastModified: Map<string, Date>,
): Promise<ProviderResult> {
  const providerResult: ProviderResult = {
    provider,
    urlsNotified: 0,
    errors: [],
  }

  try {
    log.info(`\n=== Running ${provider} provider ===`)

    // Find URLs that need notification for this provider
    const updatedUrls = await findUpdatedUrls(
      sitemapEntries,
      config.stateDir,
      provider,
    )
    log.info(
      `Found ${updatedUrls.length} URLs that need ${provider} notification`,
    )

    if (updatedUrls.length === 0) {
      log.info(`No URLs need ${provider} notification`)
      return providerResult
    }

    // Dry run mode
    if (config.dryRun) {
      logDryRunUrls(provider, updatedUrls)
      providerResult.urlsNotified = updatedUrls.length
      return providerResult
    }

    // Send notifications based on provider
    let success = false
    let errorMessage = ""

    if (provider === "indexnow") {
      if (!config.indexNow) {
        providerResult.errors.push("IndexNow configuration missing")
        return providerResult
      }
      log.info(`Notifying IndexNow with ${updatedUrls.length} URLs...`)
      const response = await notifyIndexNow(
        config.host,
        config.indexNow.apiKey,
        updatedUrls,
      )
      success = response.success
      if (!success) {
        errorMessage = response.message
      }
    } else if (provider === "google") {
      if (!config.google) {
        providerResult.errors.push("Google Indexing configuration missing")
        return providerResult
      }
      log.info(
        `Notifying Google Indexing API with ${updatedUrls.length} URLs...`,
      )
      const response = await notifyGoogle(config.google, updatedUrls)
      success = response.success
      if (!success) {
        errorMessage = response.message
      }
    }

    if (!success) {
      providerResult.errors.push(
        `${provider} notification failed: ${errorMessage}`,
      )
      return providerResult
    }

    // Save state for successfully notified URLs
    await saveNotificationState(
      config.stateDir,
      provider,
      updatedUrls,
      urlToLastModified,
    )

    providerResult.urlsNotified = updatedUrls.length
    log.info(
      `${provider} notification complete: ${updatedUrls.length} URLs notified`,
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.error(`${provider} provider error: ${errorMessage}`)
    providerResult.errors.push(errorMessage)
  }

  return providerResult
}

/**
 * Run the notifier for all enabled providers.
 *
 * 1. Fetch the sitemap
 * 2. For each enabled provider:
 *    a. Find URLs that have been updated since last notification for that provider
 *    b. Notify the provider about the updated URLs
 *    c. Save the notification timestamps (per-provider)
 *
 * Each provider runs independently - a failure in one doesn't affect others.
 */
export async function runNotifier(
  config: NotifierConfig,
): Promise<NotificationResult> {
  const result: NotificationResult = {
    urlsChecked: 0,
    urlsToNotify: 0,
    providerResults: [],
    errors: [],
  }

  try {
    // Step 1: Fetch sitemap (shared across all providers)
    log.info("Step 1: Fetching sitemap...")
    const sitemapEntries = await fetchSitemap(config.sitemapUrl)
    result.urlsChecked = sitemapEntries.length
    log.info(`Found ${sitemapEntries.length} URLs in sitemap`)

    if (sitemapEntries.length === 0) {
      log.info("No URLs in sitemap, exiting successfully")
      return result
    }

    const urlToLastModified = buildUrlToLastModifiedMap(sitemapEntries)

    // Step 2: Run each enabled provider independently
    log.info(
      `Step 2: Running ${config.enabledProviders.length} provider(s): ${config.enabledProviders.join(", ")}`,
    )

    for (const provider of config.enabledProviders) {
      const providerResult = await runProviderNotification(
        config,
        provider,
        sitemapEntries,
        urlToLastModified,
      )
      result.providerResults.push(providerResult)
    }

    // Calculate total URLs to notify (max across providers)
    const totalNotified = result.providerResults.reduce(
      (sum, pr) => Math.max(sum, pr.urlsNotified),
      0,
    )
    result.urlsToNotify = totalNotified

    // Log summary
    log.info("\n=== Notification Summary ===")
    for (const pr of result.providerResults) {
      if (pr.errors.length > 0) {
        log.error(
          `${pr.provider}: ${pr.urlsNotified} notified, ${pr.errors.length} error(s)`,
        )
      } else {
        log.info(`${pr.provider}: ${pr.urlsNotified} notified successfully`)
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.error(`Notifier error: ${errorMessage}`)
    result.errors.push(errorMessage)
  }

  return result
}
