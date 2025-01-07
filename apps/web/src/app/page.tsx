import type { Metadata } from "next"
import { GpuSpecKeys, GpuSpecsDescription } from "@/pkgs/isomorphic/model/specs"
import { Carousel } from "@/pkgs/client/components/Carousel"
import Link from "next/link"
import { topNListingsByCostPerformance } from "@/pkgs/server/db/ListingRepository"
import { ListingCardSmall } from "@/pkgs/client/components/ListingCardSmall"
import { minutesToSeconds } from "@/pkgs/isomorphic/duration"
import { mapSpecToSlug } from "./ml/shop/gpu/performance/slugs"

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
const REVALIDATE_MINUTES = 30
export const revalidate = minutesToSeconds(REVALIDATE_MINUTES)

export const metadata: Metadata = {
  alternates: { canonical: "https://coinpoet.com/" },
}

export default async function Page() {
  const TOP_N = 10
  const promises = GpuSpecKeys.map(async (spec) => {
    const listings = await topNListingsByCostPerformance(spec, TOP_N)
    return { spec, listings }
  })
  const specsAndListings = await Promise.all(promises)

  return (
    <div>
      <h1 className="display-1">
        <span className="text-accent">Save money</span> on your next GPU.
      </h1>
      <p className="lead">
        Coin Poet is a free price comparison tool showing price-to-performance
        ratios for GPUs.
      </p>
      <div>
        <p>
          Not sure where to begin? Learn about what to look for in a GPU for
          machine learning <Link href="/ml/learn/gpu/specifications">here</Link>
          .
        </p>
        <div className="d-flex flex-column">
          {specsAndListings.map(({ spec, listings }) => {
            return (
              <Carousel
                key={spec}
                header={`Top GPUs for ${GpuSpecsDescription[spec].label}`}
                href={`/ml/shop/gpu/performance/${mapSpecToSlug(spec)}`}
              >
                {listings.map((listing) => (
                  <ListingCardSmall
                    key={listing.itemId}
                    item={listing}
                    specs={listing.gpu}
                    highlightSpec={spec}
                  />
                ))}
              </Carousel>
            )
          })}
        </div>
      </div>
    </div>
  )
}
