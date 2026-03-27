import { hoursToMilliseconds } from "../isomorphic/duration"

/**
 * Staleness threshold for listing caches. Listings from any source (eBay, Amazon)
 * with a `cachedAt` older than this duration are considered stale and will be
 * refreshed on the next revalidation run.
 */
// eslint-disable-next-line no-magic-numbers
export const CACHED_LISTINGS_DURATION_MS = hoursToMilliseconds(6)
