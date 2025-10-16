import { getPrometheusMetrics } from "@/pkgs/server/metrics/metricsStore"

// keep revalidate=0 to ensure fresh metrics on each request
// eslint-disable-next-line import/no-unused-modules
export const revalidate = 0

/**
 * Prometheus metrics endpoint that serves metrics from the last cache revalidation job.
 *
 * This endpoint is publicly accessible (via ingress) and scraped by Prometheus to monitor
 * the health and performance of the cache revalidation system. Metrics reflect the state
 * of the last job executed by the Kubernetes CronJob, not real-time execution.
 *
 * Returns HTTP 200 with Prometheus-formatted metrics even when no job has run yet
 * (using NaN values) to keep Prometheus scrapes successful.
 */
// eslint-disable-next-line import/no-unused-modules
export async function GET() {
  const registry = getPrometheusMetrics()
  const textResponse = await registry.metrics()

  const MAX_CACHE_AGE_SECONDS = 60
  return new Response(textResponse, {
    status: 200,
    headers: {
      "Cache-Control": `max-age=${MAX_CACHE_AGE_SECONDS}`,
      "Content-Type": registry.contentType,
    },
  })
}
