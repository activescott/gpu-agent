import { createSign } from "crypto"
import { createLogger } from "./log.js"
import { GoogleIndexingResponse, GoogleIndexingConfig } from "./types.js"

const log = createLogger("google-indexing")

const GOOGLE_INDEXING_ENDPOINT =
  "https://indexing.googleapis.com/v3/urlNotifications:publish"
const GOOGLE_BATCH_ENDPOINT =
  "https://indexing.googleapis.com/batch/v3/urlNotifications:publish"
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
const INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing"

// Google's default quota is 200 requests/day
const MAX_URLS_PER_BATCH = 100
const TOKEN_EXPIRY_SECONDS = 3600

// HTTP status codes
export const HTTP_OK = 200
export const HTTP_BAD_REQUEST = 400
export const HTTP_UNAUTHORIZED = 401
export const HTTP_FORBIDDEN = 403
export const HTTP_NOT_FOUND = 404
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
 * Cached access token and expiry
 */
interface TokenCache {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

/**
 * Type for token getter function to allow dependency injection in tests
 */
export type TokenGetter = (
  config: GoogleIndexingConfig,
) => Promise<string | null>

// Module-level token getter for dependency injection
let tokenGetterImpl: TokenGetter | null = null

/**
 * Set a custom token getter implementation (for testing)
 */
export function setTokenGetter(fn: TokenGetter | null): void {
  tokenGetterImpl = fn
}

/**
 * Base64url encode a string (JWT-safe base64)
 */
function base64urlEncode(data: string | Buffer): string {
  const base64 = Buffer.from(data).toString("base64")
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * Create a signed JWT for Google service account authentication
 */
function createJwt(config: GoogleIndexingConfig): string {
  const now = Math.floor(Date.now() / 1000)
  const expiry = now + TOKEN_EXPIRY_SECONDS

  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const payload = {
    iss: config.serviceAccountEmail,
    scope: INDEXING_SCOPE,
    aud: GOOGLE_TOKEN_ENDPOINT,
    iat: now,
    exp: expiry,
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(payload))
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  // Sign with RSA-SHA256
  const sign = createSign("RSA-SHA256")
  sign.update(signatureInput)
  const signature = sign.sign(config.privateKey)
  const encodedSignature = base64urlEncode(signature)

  return `${signatureInput}.${encodedSignature}`
}

/**
 * Exchange a JWT for an access token
 */
async function getAccessToken(
  config: GoogleIndexingConfig,
): Promise<string | null> {
  // Use custom token getter if set (for testing)
  if (tokenGetterImpl) {
    return tokenGetterImpl(config)
  }

  // Check cache
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60000) {
    log.debug("Using cached access token")
    return tokenCache.accessToken
  }

  log.debug("Fetching new access token")

  try {
    const jwt = createJwt(config)

    const response = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      log.error(`Failed to get access token: ${response.status} - ${errorText}`)
      return null
    }

    const data = (await response.json()) as {
      access_token: string
      expires_in: number
    }

    // Cache the token
    tokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }

    return data.access_token
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log.error(`Error getting access token: ${errorMessage}`)
    return null
  }
}

/**
 * Clear the token cache (useful for testing)
 */
export function clearTokenCache(): void {
  tokenCache = null
}

/**
 * Payload for Google Indexing API
 */
export interface GoogleIndexingPayload {
  url: string
  type: "URL_UPDATED" | "URL_DELETED"
}

/**
 * Notify Google about a single URL update
 */
async function notifySingleUrl(
  accessToken: string,
  url: string,
): Promise<GoogleIndexingResponse> {
  const payload: GoogleIndexingPayload = {
    url,
    type: "URL_UPDATED",
  }

  const response = await fetchImpl(GOOGLE_INDEXING_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  const statusCode = response.status

  if (statusCode === HTTP_OK) {
    return { success: true, statusCode, message: "OK" }
  }

  let errorText: string
  try {
    errorText = await response.text()
  } catch {
    errorText = response.statusText
  }

  return {
    success: false,
    statusCode,
    message: `${statusCode}: ${errorText}`,
  }
}

/**
 * Create a multipart/mixed body for batch request
 */
function createBatchBody(urls: string[], boundary: string): string {
  const parts: string[] = []

  for (const url of urls) {
    const payload: GoogleIndexingPayload = {
      url,
      type: "URL_UPDATED",
    }

    parts.push(`--${boundary}`)
    parts.push("Content-Type: application/http")
    parts.push("Content-Transfer-Encoding: binary")
    parts.push("")
    parts.push(`POST /v3/urlNotifications:publish HTTP/1.1`)
    parts.push("Content-Type: application/json")
    parts.push("")
    parts.push(JSON.stringify(payload))
  }

  parts.push(`--${boundary}--`)

  return parts.join("\r\n")
}

/**
 * Parse batch response to count successes and failures
 */
function parseBatchResponse(responseText: string): {
  successes: number
  failures: number
  errors: string[]
} {
  let successes = 0
  let failures = 0
  const errors: string[] = []

  // Split by boundary and look for HTTP status codes
  const parts = responseText.split(/--batch_\w+/)

  for (const part of parts) {
    // Look for HTTP status line
    const statusMatch = /HTTP\/1\.1 (\d{3})/.exec(part)
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10)
      if (status === HTTP_OK) {
        successes++
      } else {
        failures++
        // Try to extract error message
        const errorMatch = /"message":\s*"([^"]+)"/.exec(part)
        if (errorMatch) {
          errors.push(`${status}: ${errorMatch[1]}`)
        } else {
          errors.push(`HTTP ${status}`)
        }
      }
    }
  }

  return { successes, failures, errors }
}

/**
 * Notify Google about updated URLs using batch requests.
 *
 * @param config - Google Indexing API configuration
 * @param urls - Array of URLs to notify
 * @returns Response indicating success or failure
 */
export async function notifyGoogle(
  config: GoogleIndexingConfig,
  urls: string[],
): Promise<GoogleIndexingResponse> {
  if (urls.length === 0) {
    log.info("No URLs to notify")
    return { success: true, statusCode: HTTP_OK, message: "No URLs to notify" }
  }

  // Get access token
  const accessToken = await getAccessToken(config)
  if (!accessToken) {
    return {
      success: false,
      statusCode: HTTP_UNAUTHORIZED,
      message: "Failed to obtain access token",
    }
  }

  // For a single URL, use the simple endpoint
  if (urls.length === 1) {
    log.info(`Notifying Google Indexing API with 1 URL`)
    return notifySingleUrl(accessToken, urls[0])
  }

  // For multiple URLs, use batch requests
  log.info(`Notifying Google Indexing API with ${urls.length} URLs`)

  let totalSuccesses = 0
  let totalFailures = 0
  const allErrors: string[] = []

  // Process in batches of MAX_URLS_PER_BATCH
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_BATCH) {
    const batch = urls.slice(i, i + MAX_URLS_PER_BATCH)
    const batchNumber = Math.floor(i / MAX_URLS_PER_BATCH) + 1
    const totalBatches = Math.ceil(urls.length / MAX_URLS_PER_BATCH)

    log.info(
      `Processing batch ${batchNumber}/${totalBatches} (${batch.length} URLs)`,
    )

    const boundary = `batch_${Date.now()}_${Math.random().toString(36).substring(2)}`
    const body = createBatchBody(batch, boundary)

    try {
      const response = await fetchImpl(GOOGLE_BATCH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": `multipart/mixed; boundary=${boundary}`,
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      })

      if (!response.ok) {
        const errorText = await response.text()
        log.error(`Batch request failed: ${response.status} - ${errorText}`)
        totalFailures += batch.length
        allErrors.push(
          `Batch ${batchNumber}: ${response.status} - ${errorText}`,
        )
        continue
      }

      const responseText = await response.text()
      const { successes, failures, errors } = parseBatchResponse(responseText)

      totalSuccesses += successes
      totalFailures += failures
      allErrors.push(...errors.map((e) => `Batch ${batchNumber}: ${e}`))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      log.error(`Batch request error: ${errorMessage}`)
      totalFailures += batch.length
      allErrors.push(`Batch ${batchNumber}: ${errorMessage}`)
    }
  }

  log.info(
    `Google Indexing complete: ${totalSuccesses} succeeded, ${totalFailures} failed`,
  )

  if (totalFailures === urls.length) {
    return {
      success: false,
      statusCode: HTTP_BAD_REQUEST,
      message: `All ${totalFailures} URLs failed: ${allErrors.join("; ")}`,
    }
  }

  if (totalFailures > 0) {
    return {
      success: true,
      statusCode: HTTP_OK,
      message: `Partial success: ${totalSuccesses} succeeded, ${totalFailures} failed`,
    }
  }

  return {
    success: true,
    statusCode: HTTP_OK,
    message: `Successfully notified ${totalSuccesses} URLs`,
  }
}
