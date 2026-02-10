import retry from "async-retry"
import { createLogger } from "../logger"

const logger = createLogger("fetch")

type FetchRequestInfo = Parameters<typeof fetch>[0]

const DEFAULT_RETRIES = 4
const DEFAULT_MIN_TIMEOUT_MS = 2000
const DEFAULT_RETRY_AFTER_CAP_MS = 60000

export function fetchImpl(
  input: FetchRequestInfo,
  init?: RequestInit,
): Promise<Response> {
  return retry(
    async (bail) => {
      const resp = await fetch(input, init)
      if (resp.status === 429) {
        const retryAfterMs = parseRetryAfter(resp.headers.get("Retry-After"))
        const err = new Error(`Rate limited (429) on ${input}`)
        if (retryAfterMs !== null) {
          logger.warn(
            { url: input, retryAfterMs },
            "Rate limited with Retry-After header, waiting",
          )
          await sleep(retryAfterMs)
        }
        throw err
      }
      if (resp.status >= 500) {
        throw new Error(`Server error (${resp.status}) on ${input}`)
      }
      // Non-retryable errors (4xx other than 429) — bail immediately
      if (!resp.ok) {
        bail(new Error(`Request failed (${resp.status}) on ${input}`))
        return resp // unreachable but needed for types
      }
      return resp
    },
    {
      retries: DEFAULT_RETRIES,
      factor: 2,
      minTimeout: DEFAULT_MIN_TIMEOUT_MS,
      randomize: true,
      onRetry: (err: Error, attempt: number) => {
        logger.warn({ err: err.message, attempt, url: input }, "Retrying fetch")
      },
    },
  )
}

function parseRetryAfter(header: string | null): number | null {
  if (!header) return null
  const seconds = Number.parseInt(header, 10)
  if (!Number.isNaN(seconds)) {
    const ms = seconds * 1000
    return Math.min(ms, DEFAULT_RETRY_AFTER_CAP_MS)
  }
  // Retry-After can also be an HTTP date
  const date = Date.parse(header)
  if (!Number.isNaN(date)) {
    const ms = date - Date.now()
    return Math.min(Math.max(0, ms), DEFAULT_RETRY_AFTER_CAP_MS)
  }
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
