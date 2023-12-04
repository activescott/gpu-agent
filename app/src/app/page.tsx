import type { Metadata } from "next"
import { GpuSpecKeys, GpuSpecsDescription } from "@/pkgs/isomorphic/model/specs"
import { ContainerCard } from "@/pkgs/client/components/ContainerCard"
import { mapSpecToSlug } from "./ml/shop/gpu/performance/slugs"
import Link from "next/link"
import { topNListingsByCostPerformance } from "@/pkgs/server/db/ListingRepository"
import { ListingCardSmall } from "@/pkgs/client/components/ListingCardSmall"

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
const MINUTES = 10
const SECONDS_PER_MINUTE = 60
export const revalidate = MINUTES * SECONDS_PER_MINUTE

export const metadata: Metadata = {
  title: "Best GPUs for the Money: Buy on Price-Performance Ratios",
  description:
    "Buy GPUs for training and inference with side-by-side price/performance comparisons. Compare price to performance from industry-standard benchmarks for training and inference.",
  alternates: { canonical: "https://coinpoet.com/" },
}

export default async function Page() {
  const TOP_N = 3
  const promises = GpuSpecKeys.map(async (spec) => {
    const listings = await topNListingsByCostPerformance(spec, TOP_N)
    return { spec, listings }
  })
  const specsAndListings = await Promise.all(promises)

  return (
    <div>
      <h1>Compare Price & Benchmarked of GPUs</h1>
      <div>
        <p>
          Use this site to find machine learning GPUs available for immediate
          purchase. Compare price-to-performance ratios to find the best cards
          on the market.
        </p>
        <p>
          Not sure where to begin? Learn about what to look for in a GPU for
          machine learning <Link href="/ml/learn/gpu/specifications">here</Link>
          .
        </p>
        <div className="d-flex flex-wrap">
          {specsAndListings.map(({ spec, listings }) => {
            return (
              <ContainerCard
                key={spec}
                header={`Top ${TOP_N} GPUs by $ / ${GpuSpecsDescription[spec].label}`}
              >
                {listings.map((listing) => (
                  <ListingCardSmall
                    key={listing.itemId}
                    item={listing}
                    specs={listing.gpu}
                    highlightSpec={spec}
                  />
                ))}
                <div>
                  <Link
                    href={`/ml/shop/gpu/performance/${mapSpecToSlug(spec)}`}
                  >
                    More GPUs...
                  </Link>
                </div>
              </ContainerCard>
            )
          })}
        </div>
      </div>
    </div>
  )
}
