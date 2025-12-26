import { createDiag } from "@activescott/diag"
import { SitemapEntry } from "./types.js"

const log = createDiag("indexnow-notifier:sitemap-parser")

/**
 * Type for fetch function to allow dependency injection in tests
 */
export interface FetchFunction {
  (url: string): Promise<Response>
}

// Module-level fetch implementation for dependency injection
let fetchImpl: FetchFunction = fetch

/**
 * Set a custom fetch implementation (for testing)
 */
export function setFetchImpl(fn: FetchFunction): void {
  fetchImpl = fn
}

/**
 * Reset fetch to the global fetch function
 */
export function resetFetchImpl(): void {
  fetchImpl = fetch
}

/**
 * Fetch and parse a sitemap.xml from a URL
 */
export async function fetchSitemap(
  sitemapUrl: string,
): Promise<SitemapEntry[]> {
  log.info(`Fetching sitemap from ${sitemapUrl}`)

  const response = await fetchImpl(sitemapUrl)

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap: ${response.status} ${response.statusText}`,
    )
  }

  const xmlText = await response.text()
  return parseSitemapXml(xmlText)
}

/**
 * Parse sitemap XML text into SitemapEntry objects.
 * Uses regex-based parsing for simplicity (no XML parser dependency).
 */
export function parseSitemapXml(xmlText: string): SitemapEntry[] {
  const entries: SitemapEntry[] = []

  // Parse <url> blocks using regex
  const urlBlockRegex = /<url>([\s\S]*?)<\/url>/g
  const locRegex = /<loc>(.*?)<\/loc>/
  const lastmodRegex = /<lastmod>(.*?)<\/lastmod>/

  let match: RegExpExecArray | null
  while ((match = urlBlockRegex.exec(xmlText)) !== null) {
    const block = match[1]

    const locMatch = locRegex.exec(block)
    const lastmodMatch = lastmodRegex.exec(block)

    if (locMatch) {
      const url = locMatch[1].trim()
      // Default to epoch if no lastmod (treat as "very old")
      const lastModified = lastmodMatch
        ? new Date(lastmodMatch[1].trim())
        : new Date(0)

      entries.push({ url, lastModified })
    }
  }

  log.info(`Parsed ${entries.length} entries from sitemap`)
  return entries
}
