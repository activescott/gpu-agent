import { secondsToMilliseconds } from "@/pkgs/isomorphic/duration"
import { revalidateCachedListings } from "@/pkgs/server/listings"
import { Metadata } from "next"

// default is 10s and without slug and fetching many GPUs 10s isn't enough: https://vercel.com/docs/functions/configuring-functions/duration
// We also have a site monitor ping this that has a max timeout of 25s
export const maxDuration = 25

// don't let vercel cache this page (long): https://nextjs.org/docs/14/app/api-reference/file-conventions/route-segment-config
// we use a 10s cache here as kind of a poor man's throttling
export const revalidate = 10

export const metadata: Metadata = {
  title: "Operational Cache Trigger & Monitor",
  robots: { index: false, follow: false },
}

export default async function Page() {
  const result = await revalidateCachedListings(
    secondsToMilliseconds(maxDuration),
  )

  return (
    <main>
      <h1>Operational Cache Trigger & Monitor</h1>
      <ul>
        <li>Cached listings updated: {result.updateCount}</li>
        <li>Oldest cached listing: {result.oldestCachedAt.toString()}</li>
        <li>Total Duration: {result.totalDuration}</li>
        <li>Timeout: {result.timeoutMs}</li>
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
