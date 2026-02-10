import client, { Registry, Counter } from "prom-client"
import { setFetchMetricsHook } from "@activescott/ebay-client"

const registry = new Registry<client.OpenMetricsContentType>()

const ebayApiCallsCounter = new Counter({
  name: "coinpoet_ebay_api_calls_total",
  help: "Total number of eBay API calls made",
  labelNames: ["path", "status"] as const,
  registers: [registry],
})

setFetchMetricsHook((path: string, status: number) => {
  ebayApiCallsCounter.inc({ path, status: String(status) })
})

export function getEbayMetricsRegistry(): Registry<client.OpenMetricsContentType> {
  return registry
}
