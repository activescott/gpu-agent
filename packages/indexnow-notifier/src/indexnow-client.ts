import { createLogger } from "./log.js"
import { IndexNowResponse } from "./types.js"

const log = createLogger("indexnow-client")

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
const MAX_URLS_PER_REQUEST = 10000

// HTTP status codes
export const HTTP_OK = 200
export const HTTP_ACCEPTED = 202
export const HTTP_BAD_REQUEST = 400
export const HTTP_FORBIDDEN = 403
export const HTTP_TOO_MANY_REQUESTS = 429

/**
 * Type for fetch function to allow dependency injection in tests
 */
export interface FetchFunction {
  (url: string, init?: RequestInit): Promise<Response>
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
 * Payload structure for IndexNow API
 */
export interface IndexNowPayload {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

/**
 * Notify IndexNow about updated URLs.
 *
 * @param host - The domain (e.g., "gpupoet.com")
 * @param key - The IndexNow API key
 * @param urls - Array of URLs to notify
 * @returns Response indicating success or failure
 */
export async function notifyIndexNow(
  host: string,
  key: string,
  urls: string[],
): Promise<IndexNowResponse> {
  if (urls.length === 0) {
    log.info("No URLs to notify")
    return { success: true, statusCode: HTTP_OK, message: "No URLs to notify" }
  }

  if (urls.length > MAX_URLS_PER_REQUEST) {
    throw new Error(
      `Too many URLs: ${urls.length}. Maximum is ${MAX_URLS_PER_REQUEST}`,
    )
  }

  const payload: IndexNowPayload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  }

  log.info(`Notifying IndexNow with ${urls.length} URLs`)
  log.debug("Payload:", JSON.stringify(payload))

  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  })

  const statusCode = response.status

  // IndexNow returns 200 OK or 202 Accepted for success
  if (statusCode === HTTP_OK || statusCode === HTTP_ACCEPTED) {
    log.info(`IndexNow notification successful: ${statusCode}`)
    return { success: true, statusCode, message: "OK" }
  }

  // Handle error responses
  let errorText: string
  try {
    errorText = await response.text()
  } catch {
    errorText = response.statusText
  }

  log.error(`IndexNow notification failed: ${statusCode} - ${errorText}`)

  return {
    success: false,
    statusCode,
    message: `${statusCode}: ${errorText}`,
  }
}
