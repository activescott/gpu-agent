import { ListingGallery } from "@/pkgs/client/components/ListingGallery"
import { dollarsPerSpec } from "@/pkgs/isomorphic/gpuTools"
import { Listing } from "@/pkgs/isomorphic/model"
import { GpuSpecKey } from "@/pkgs/isomorphic/model/specs"
import { fetchListingsForAllGPUsWithCache } from "@/pkgs/server/listings"
import { chain } from "irritable-iterable"
import { curry } from "lodash"
import { Metadata } from "next"

// revalidate the data at most every hour:
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Price Compare GPUs for Machine Learning based on specs",
  description: "Dollar/performance price comparisons for Machine Learning GPUs",
  alternates: { canonical: "https://coinpoet.com/ml/shop/gpu" },
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

export default async function Page() {
  const rawListings = await fetchListingsForAllGPUsWithCache()
  const MINIMUM_AI_GPU_MEMORY_GB = 10
  const MAX_LISTINGS_TO_SHOW = 50
  const listings = chain(rawListings)
    // limit results to avoid `LAMBDA_RUNTIME Failed to post handler success response. Http response code: 413` error: https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size
    //   first filter out the low-GPU cards, then sort by price/performance, then take the top 100
    .filter((item) => item.gpu.memoryCapacityGB >= MINIMUM_AI_GPU_MEMORY_GB)
    .collect()
    .sort(curry(lowestSpecPriceListingComparer)("fp32TFLOPS", true))
    .slice(0, MAX_LISTINGS_TO_SHOW)

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
