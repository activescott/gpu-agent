import client, { Registry, Counter, Gauge } from "prom-client"

const registry = new Registry<client.OpenMetricsContentType>()

const amazonSearchesCounter = new Counter({
  name: "coinpoet_amazon_searches_total",
  help: "Total number of Amazon search attempts",
  labelNames: ["gpu", "status"] as const,
  registers: [registry],
})

const amazonListingsCachedGauge = new Gauge({
  name: "coinpoet_amazon_listings_cached",
  help: "Number of Amazon listings cached in the last search for each GPU",
  labelNames: ["gpu"] as const,
  registers: [registry],
})

const amazonLastSuccessTimestamp = new Gauge({
  name: "coinpoet_amazon_last_success_timestamp_seconds",
  help: "Unix timestamp of the last successful Amazon search",
  registers: [registry],
})

const MS_TO_SECONDS = 1000

export function recordAmazonSearch(
  gpu: string,
  success: boolean,
  listingCount?: number,
): void {
  amazonSearchesCounter.inc({
    gpu,
    status: success ? "success" : "error",
  })
  if (success) {
    amazonLastSuccessTimestamp.set(Date.now() / MS_TO_SECONDS)
    if (listingCount !== undefined) {
      amazonListingsCachedGauge.set({ gpu }, listingCount)
    }
  }
}

export function getAmazonMetricsRegistry(): Registry<client.OpenMetricsContentType> {
  return registry
}
