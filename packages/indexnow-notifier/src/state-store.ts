import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createLogger } from "./log.js"
import { NotifierProvider } from "./types.js"

const log = createLogger("state-store")

/**
 * Encode a URL into a safe filename using URL encoding (percent-encoding).
 * This produces human-readable filenames useful for diagnostics.
 * Example: "https://gpupoet.com/gpu/page" -> "https%3A%2F%2Fgpupoet.com%2Fgpu%2Fpage.yaml"
 */
export function encodeUrlToFilename(url: string): string {
  return `${encodeURIComponent(url)}.yaml`
}

/**
 * Decode a filename back to a URL
 */
export function decodeFilenameToUrl(filename: string): string {
  // Remove .yaml extension
  const encoded = filename.replace(/\.yaml$/, "")
  return decodeURIComponent(encoded)
}

/**
 * Extract the domain (hostname) from a URL.
 * Returns the hostname or "unknown" if parsing fails.
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    log.warn(`Failed to parse URL for domain extraction: ${url}`)
    return "unknown"
  }
}

/**
 * Get the domain and provider-specific state directory.
 * Structure: {stateDir}/{domain}/{provider}/
 */
function getProviderStateDir(
  stateDir: string,
  domain: string,
  provider: NotifierProvider,
): string {
  return join(stateDir, domain, provider)
}

/**
 * Get the path to the state file for a URL and provider.
 * Structure: {stateDir}/{domain}/{provider}/{encoded-url}.yaml
 */
function getStateFilePath(
  stateDir: string,
  provider: NotifierProvider,
  url: string,
): string {
  const domain = extractDomain(url)
  return join(
    getProviderStateDir(stateDir, domain, provider),
    encodeUrlToFilename(url),
  )
}

/**
 * Get the last notified timestamp for a URL and provider.
 * Returns null if the URL has never been notified for this provider.
 */
export async function getLastNotified(
  stateDir: string,
  provider: NotifierProvider,
  url: string,
): Promise<Date | null> {
  const filePath = getStateFilePath(stateDir, provider, url)

  try {
    const content = await readFile(filePath, "utf-8")
    // Parse YAML format: "lastModified: 2024-01-15T10:00:00Z"
    const match = /lastModified:\s*["']?(.+?)["']?\s*$/.exec(content)
    if (match) {
      const date = new Date(match[1])
      if (!isNaN(date.getTime())) {
        return date
      }
    }
    log.warn(`Invalid date format in state file: ${filePath}`)
    return null
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      // File doesn't exist, URL was never notified
      return null
    }
    throw error
  }
}

/**
 * Set the last notified timestamp for a URL and provider.
 * Creates the domain/provider-specific state directory if it doesn't exist.
 */
export async function setLastNotified(
  stateDir: string,
  provider: NotifierProvider,
  url: string,
  timestamp: Date,
): Promise<void> {
  // Ensure domain/provider directory exists
  const domain = extractDomain(url)
  const providerDir = getProviderStateDir(stateDir, domain, provider)
  await mkdir(providerDir, { recursive: true })

  const filePath = getStateFilePath(stateDir, provider, url)
  const content = `lastModified: "${timestamp.toISOString()}"\n`

  await writeFile(filePath, content, "utf-8")
  log.debug(
    `Saved state for ${domain}/${provider}/${url}: ${timestamp.toISOString()}`,
  )
}

/**
 * Check if a URL needs notification for a specific provider.
 * Returns true if the URL has been modified since the last notification,
 * or if it has never been notified for this provider.
 */
export async function needsNotification(
  stateDir: string,
  provider: NotifierProvider,
  url: string,
  lastModified: Date,
): Promise<boolean> {
  const lastNotified = await getLastNotified(stateDir, provider, url)

  if (lastNotified === null) {
    // Never notified
    log.debug(`URL never notified for ${provider}: ${url}`)
    return true
  }

  if (lastModified > lastNotified) {
    log.debug(
      `URL updated since last ${provider} notification: ${url} (modified: ${lastModified.toISOString()}, notified: ${lastNotified.toISOString()})`,
    )
    return true
  }

  return false
}
