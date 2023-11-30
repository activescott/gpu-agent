// keys should be from the .env.* files
// NOTE: you must use the dot-syntax on process.env. or the keys won't be there (at least on the client)
import { PHASE_PRODUCTION_BUILD } from "next/constants"

/* eslint-disable no-magic-numbers */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Returns true when doing a `next build`.
 * NOTE: Based on my testing YMMV. I didn't see explicit documentation on this.
 */
export function isNextBuild(): boolean {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
}

export const ISOMORPHIC_CONFIG = {
  NEXT_PUBLIC_DOMAIN: (): string =>
    returnOrThrow("NEXT_PUBLIC_DOMAIN", process.env.NEXT_PUBLIC_DOMAIN),
  NEXT_PUBLIC_POSTHOG_KEY: (): string =>
    returnOrThrow(
      "NEXT_PUBLIC_POSTHOG_KEY",
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
    ),
  NEXT_PUBLIC_POSTHOG_HOST: (): string =>
    returnOrThrow(
      "NEXT_PUBLIC_POSTHOG_HOST",
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
    ),
  MAX_LISTINGS_PER_PAGE: (): number => 50,
}

export const SERVER_CONFIG = {
  EBAY_CLIENT_ID: (): string =>
    returnOrThrow("EBAY_CLIENT_ID", process.env.EBAY_CLIENT_ID),
  EBAY_CLIENT_SECRET: (): string =>
    returnOrThrow("EBAY_CLIENT_SECRET", process.env.EBAY_CLIENT_SECRET),
  EBAY_ENVIRONMENT: (): string =>
    returnOrThrow("EBAY_ENVIRONMENT", process.env.EBAY_ENVIRONMENT),
  EBAY_AFFILIATE_CAMPAIGN_ID: (): string =>
    returnOrThrow(
      "EBAY_AFFILIATE_CAMPAIGN_ID",
      process.env.EBAY_AFFILIATE_CAMPAIGN_ID,
    ),
  MAX_LISTINGS_TO_CACHE_PER_GPU: (): number => 100,
}

const returnOrThrow = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing environment variable ${key}`)
  }
  return value
}
