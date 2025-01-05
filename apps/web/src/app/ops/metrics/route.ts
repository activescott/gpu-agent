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
    return await revalidateCachedListings(maxDuration)
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
    name: "coinpoet_listings_stale_total",
    help: "The number of GPUs with stale cached listings",
    registers: [registry],
    async collect() {
      // Invoked when the registry collects its metrics' values.
      const result = await promisedResult
      this.set(result.staleGpus.length)
    },
  })

  new Gauge({
    name: "coinpoet_listings_oldest_age_seconds",
    help: "the age of the oldest cached listing in seconds",
    registers: [registry],
    async collect() {
      // Invoked when the registry collects its metrics' values.
      const result = await promisedResult
      const age = millisecondsToSeconds(
        Date.now() - result.oldestCachedAt.valueOf(),
      )
      this.set(age)
    },
  })

  new Gauge({
    name: "coinpoet_listings_oldest_timestamp_seconds",
    help: "the timestamp of the oldest cached listing in seconds",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(millisecondsToSeconds(result.oldestCachedAt.valueOf()))
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
    name: "coinpoet_listings_cached_duration",
    help: "the time it took to cache all listings in seconds",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(millisecondsToSeconds(result.totalDuration))
    },
  })

  new Gauge({
    name: "coinpoet_remaining_gpus_to_cache",
    help: "the number of GPUs that still need to be cached",
    registers: [registry],
    async collect() {
      const result = await promisedResult
      this.set(result.remainingGpusToCache)
    },
  })

  const MAX_CACHE_AGE_SECONDS = 60
  return new Response(await registry.metrics(), {
    status: 200,
    headers: {
      "Cache-Control": `max-age=${MAX_CACHE_AGE_SECONDS}`,
      "Content-Type": registry.contentType,
    },
  })
}
