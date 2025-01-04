import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { dollarsPerSpec } from "@/pkgs/isomorphic/gpuTools"
import { Listing } from "@/pkgs/isomorphic/model"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import { listCachedListings } from "@/pkgs/server/db/ListingRepository"
import { createDiag } from "@activescott/diag"
import { chain } from "irritable-iterable"
import { curry } from "lodash"
import { Metadata } from "next"
import { Integer } from "type-fest"

const log = createDiag("shopping-agent:shop:gpu")

// default is 10s, setting it explicit just to remember this is here: https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 10

// revalidate the data at most every hour:
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Price Compare GPUs for Machine Learning based on specs",
  description: "Dollar/performance price comparisons for Machine Learning GPUs",
  alternates: { canonical: "https://coinpoet.com/ml/shop/gpu" },
}

export default async function Page() {
  // TODO: do this async outside of rendering to update cached listings. Does vercel support cron or something?
  log.info(`Fetching cached listings for gpu ALL ...`)
  const rawListings = await listCachedListings()
  log.info(`Fetching cached listings for gpu ALL complete.`)
  const MINIMUM_AI_GPU_MEMORY_GB = 10

  const listings = chain(rawListings)
    // limit results to avoid `LAMBDA_RUNTIME Failed to post handler success response. Http response code: 413` error: https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size
    //   first filter out the low-GPU cards, then sort by price/performance, then take the top 100
    .filter((item) => item.gpu.memoryCapacityGB >= MINIMUM_AI_GPU_MEMORY_GB)
    .collect()
    .sort(curry(lowestSpecPriceListingComparer)("fp32TFLOPS", true))
    .slice(0, ISOMORPHIC_CONFIG.MAX_LISTINGS_PER_PAGE() as Integer<number>)

  return (
    <main>
      <h1>Find & Buy GPUs by Dollar/performance</h1>
      <ListingGallery
        listings={listings.map((item) => ({
          item,
          specs: item.gpu,
        }))}
        initialSortKey="fp32TFLOPS"
      />
    </main>
  )
}

const lowestSpecPriceListingComparer = (
  compareSpec: GpuSpecKey,
  ascending: boolean,
  a: Listing,
  b: Listing,
): number => {
  const aPrice = Number.parseFloat(a.priceValue)
  const bPrice = Number.parseFloat(b.priceValue)
  const result =
    dollarsPerSpec(a.gpu, aPrice, compareSpec) -
    dollarsPerSpec(b.gpu, bPrice, compareSpec)
  return ascending ? result : -1 * result
}
