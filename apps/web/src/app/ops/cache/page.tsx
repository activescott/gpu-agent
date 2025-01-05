import { secondsToMilliseconds } from "@/pkgs/isomorphic/duration"
import { revalidateCachedListings } from "@/pkgs/server/listings"
import { Metadata } from "next"
import { unstable_cache } from "next/cache"

// default is 10s and without slug and fetching many GPUs 10s isn't enough: https://vercel.com/docs/functions/configuring-functions/duration
// We also have a site monitor ping this that has a max timeout of 25s
export const maxDuration = 25

// don't let vercel cache this page: https://nextjs.org/docs/14/app/api-reference/file-conventions/route-segment-config
// 0=Ensure a layout or page is always dynamically rendered even if no dynamic functions or uncached data fetches are discovered.
// note we don't cache at all since vercel will return a cached page if an error occurs or there is a timeout. We want to detect those errors though in probes. More at https://nextjs.org/docs/14/app/building-your-application/caching#time-based-revalidation
export const revalidate = 0

export const metadata: Metadata = {
  title: "Operational Cache Trigger & Monitor",
  robots: { index: false, follow: false },
}

/**
 * A version of @see revalidateCachedListings that uses the cache to avoid revalidating too often.
 * This is kind of a poor-man's rate limiter by allowing requests to revalidateCachedListings no more often than every 10s.
 * NOTE: we do not use vercel's default route caching because it has a
 */
const revalidateCachedListingsWithCache = unstable_cache(
  async (maxDuration: number) => {
    return await revalidateCachedListings(secondsToMilliseconds(maxDuration))
  },
  ["ops/cache", "revalidateCachedListings"],
  { revalidate: 10 },
)

export default async function Page() {
  const result = await revalidateCachedListingsWithCache(
    secondsToMilliseconds(maxDuration),
  )

  return (
    <main>
      <h1>Operational Cache Trigger & Monitor</h1>
      <ul>
        <li>Cached listings updated: {result.listingCachedCount}</li>
        <li>Oldest cached listing: {result.oldestCachedAt.toString()}</li>
        <li>Total Duration: {result.totalDuration}</li>
        <li>Timeout: {result.timeoutMs}</li>
        <li>Remaining GPUs: {result.remainingGpusToCache}</li>
      </ul>
      <h2>Stale GPUs</h2>
      <ul>
        {result.staleGpus.map((gpu) => (
          <li key={gpu.gpuName}>
            {gpu.gpuName}: {gpu.oldestCachedAt.toString()}
          </li>
        ))}
      </ul>
    </main>
  )
}
