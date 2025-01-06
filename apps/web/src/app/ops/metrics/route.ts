import {
  millisecondsToSeconds,
  secondsToMilliseconds,
} from "@/pkgs/isomorphic/duration"
import { revalidateCachedListings } from "@/pkgs/server/listings"
import { createDiag } from "@activescott/diag"
import { unstable_cache } from "next/cache"
import client, { Registry, Gauge } from "prom-client"

const log = createDiag("shopping-agent:ops:metrics")

// default is 10s and without slug and fetching many GPUs 10s isn't enough: https://vercel.com/docs/functions/configuring-functions/duration
// We also have a site monitor ping this that has a max timeout of 25s
// eslint-disable-next-line import/no-unused-modules
export const maxDuration = 25

// don't let vercel cache this page: https://nextjs.org/docs/14/app/api-reference/file-conventions/route-segment-config
// eslint-disable-next-line import/no-unused-modules
export const revalidate = 0

const revalidateCachedListingsWithVercelCache = unstable_cache(
  async (maxDuration: number) => {
    log.info(
      "cache MISS for revalidateCachedListingsWithVercelCache. Fetching from DB...",
    )
    return revalidateCachedListings(maxDuration)
  },
  [],
  // revalidate: The number of seconds after which the cache should be revalidated.
  { revalidate: 30 },
)

// eslint-disable-next-line import/no-unused-modules
export async function GET() {
  const promisedResult = revalidateCachedListingsWithVercelCache(
    secondsToMilliseconds(maxDuration),
  )

  const registry = new Registry<client.OpenMetricsContentType>()

  new Gauge({
    name: "coinpoet_listings_oldest_age_seconds",
    help: "the age of the oldest cached listing in seconds",
    registers: [registry],
    async collect() {
      // Invoked when the registry collects its metrics' values.
      const result = await promisedResult
      // NOTE: unstable_cache will return the dates as strings on cache hit! So we explicitly convert it here
      const oldestCachedAt = new Date(result.oldestCachedAt).getTime()
      this.set(millisecondsToSeconds(Date.now() - oldestCachedAt))
    },
  })

  new Gauge({
    name: "coinpoet_listings_oldest_timestamp_seconds",
    help: "the timestamp of the oldest cached listing in seconds",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      // unstable_cache returns the dates as strings on cache hit!
      const oldestCachedAt = new Date(result.oldestCachedAt).getTime()
      this.set(millisecondsToSeconds(oldestCachedAt))
    },
  })

  new Gauge({
    name: "coinpoet_listings_cached_total",
    help: "the total number of listings cached",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(result.listingCachedCount)
    },
  })

  new Gauge({
    name: "coinpoet_revalidation_duration_seconds",
    help: "the time it took to revalidate the cached listings in seconds",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(millisecondsToSeconds(result.totalDuration))
    },
  })

  new Gauge({
    name: "coinpoet_gpus_stale_start_total",
    help: "The number of GPUs with stale cached listings",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(result.staleGpusAtStart.length)
    },
  })

  new Gauge({
    name: "coinpoet_gpus_stale_remaining_total",
    help: "the number of GPUs that still need to be cached",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(result.staleGpusRemaining)
    },
  })

  new Gauge({
    name: "coinpoet_gpu_max_cache_duration_seconds",
    help: "the maximum time to cache one GPU in seconds",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(millisecondsToSeconds(result.maxTimeToCacheOneGpu))
    },
  })

  const start = Date.now()
  const textResponse = await registry.metrics()
  const duration = Date.now() - start
  log.info(`metrics collection took ${duration}ms`)

  const MAX_CACHE_AGE_SECONDS = 60
  return new Response(textResponse, {
    status: 200,
    headers: {
      "Cache-Control": `max-age=${MAX_CACHE_AGE_SECONDS}`,
      "Content-Type": registry.contentType,
    },
  })
}
