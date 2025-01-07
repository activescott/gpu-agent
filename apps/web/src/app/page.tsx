import type { Metadata } from "next"
import {
  GpuSpecKey,
  GpuSpecKeys,
  GpuSpecsDescription,
} from "@/pkgs/isomorphic/model/specs"
import { Carousel } from "@/pkgs/client/components/Carousel"
import { topNListingsByCostPerformance } from "@/pkgs/server/db/ListingRepository"
import { ListingCardSmall } from "@/pkgs/client/components/ListingCardSmall"
import { minutesToSeconds } from "@/pkgs/isomorphic/duration"
import { mapSpecToSlug } from "./ml/shop/gpu/performance/slugs"
import { Listing } from "@/pkgs/isomorphic/model/index"
import {
  BootstrapIcon,
  BootstrapIconName,
} from "@/pkgs/client/components/BootstrapIcon"
import Link from "next/link"
import { ReactNode } from "react"

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
const REVALIDATE_MINUTES = 30
export const revalidate = minutesToSeconds(REVALIDATE_MINUTES)

export const metadata: Metadata = {
  alternates: { canonical: "https://coinpoet.com/" },
}

export default async function Page() {
  const TOP_N = 10
  const topListingsPromises = GpuSpecKeys.map(async (spec) => {
    const listings = await topNListingsByCostPerformance(spec, TOP_N)
    return { spec, listings }
  })

  const NEWS_SPLIT_AT = 2
  const topListingsFirstHalf = await Promise.all(
    topListingsPromises.slice(0, NEWS_SPLIT_AT),
  )
  const topListingsSecondHalf = await Promise.all(
    topListingsPromises.slice(NEWS_SPLIT_AT),
  )

  return (
    <div>
      <h1 className="display-1">
        <span className="text-accent">Save money</span> on your next GPU.
      </h1>
      <h3 className="lead">
        Coin Poet is a free price comparison tool helping you find the best GPU
        for your money.
      </h3>

      <div className="my-how-to-cards mt-2 d-flex flex-row justify-content-evenly">
        <TipCard icon="trophy-fill">
          Check <Link href="ml/learn/gpu/ranking">GPU Rankings</Link> to see the
          best GPUs for the money.
        </TipCard>
        <TipCard icon="shop-window">
          <Link href="ml/shop/gpu">Browse for-sale listings</Link> to see GPUs
          available now and their price vs. performance.
        </TipCard>
      </div>

      <div>
        <div className="d-flex flex-column">
          {topListingsFirstHalf.map(({ spec, listings }) => {
            return TopListingsCarousel(spec, listings)
          })}

          <div className="d-none">news</div>

          {topListingsSecondHalf.map(({ spec, listings }) => {
            return TopListingsCarousel(spec, listings)
          })}
        </div>
      </div>
    </div>
  )
}

function TopListingsCarousel(spec: GpuSpecKey, listings: Listing[]): ReactNode {
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
}

interface TipCardProps {
  icon: BootstrapIconName
  children: ReactNode
}

function TipCard({ children, icon }: TipCardProps) {
  return (
    <div className="d-inline-block max-width-container-sm m-2 rounded-3 shadow p-3 bg-body-tertiary">
      <div className="d-flex flex-row p-2">
        <div className="d-inline-block me-2">
          <BootstrapIcon icon={icon} size="medium" />
        </div>
        <div style={{ minHeight: "2lh" }}>{children}</div>
      </div>
    </div>
  )
}
