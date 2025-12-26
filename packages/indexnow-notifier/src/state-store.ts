import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createLogger } from "./log.js"

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
 * Get the path to the state file for a URL
 */
function getStateFilePath(stateDir: string, url: string): string {
  return join(stateDir, encodeUrlToFilename(url))
}

/**
 * Get the last notified timestamp for a URL.
 * Returns null if the URL has never been notified.
 */
export async function getLastNotified(
  stateDir: string,
  url: string,
): Promise<Date | null> {
  const filePath = getStateFilePath(stateDir, url)

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
 * Set the last notified timestamp for a URL.
 * Creates the state directory if it doesn't exist.
 */
export async function setLastNotified(
  stateDir: string,
  url: string,
  timestamp: Date,
): Promise<void> {
  // Ensure directory exists
  await mkdir(stateDir, { recursive: true })

  const filePath = getStateFilePath(stateDir, url)
  const content = `lastModified: "${timestamp.toISOString()}"\n`

  await writeFile(filePath, content, "utf-8")
  log.debug(`Saved state for ${url}: ${timestamp.toISOString()}`)
}

/**
 * Check if a URL needs notification based on its last modification date.
 * Returns true if the URL has been modified since the last notification,
 * or if it has never been notified.
 */
export async function needsNotification(
  stateDir: string,
  url: string,
  lastModified: Date,
): Promise<boolean> {
  const lastNotified = await getLastNotified(stateDir, url)

  if (lastNotified === null) {
    // Never notified
    log.debug(`URL never notified: ${url}`)
    return true
  }

  if (lastModified > lastNotified) {
    log.debug(
      `URL updated since last notification: ${url} (modified: ${lastModified.toISOString()}, notified: ${lastNotified.toISOString()})`,
    )
    return true
  }

  return false
}
