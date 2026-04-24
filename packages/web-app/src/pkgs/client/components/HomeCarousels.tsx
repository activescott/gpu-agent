"use client"
import { useFeatureFlagVariantKey } from "posthog-js/react"
import {
  type GpuSpecKey,
  GpuSpecsDescription,
  type Listing,
  type ListingWithMetric,
} from "@/pkgs/isomorphic/model"
import { Carousel } from "@/pkgs/client/components/Carousel"
import {
  ListingCardSmall,
  type SmallCardMetricInfo,
} from "@/pkgs/client/components/ListingCardSmall"
import {
  mapMetricToSlug,
  canonicalPathForSlug,
} from "@/app/gpu/price-compare/slugs"
import { NewsArticlePair } from "@/pkgs/client/components/NewsArticlePair"
import type { NewsItem } from "@/pkgs/client/components/NewsArticlePair"
import type { ReactNode } from "react"

interface GamingCarouselData {
  slug: string
  name: string
  metricInfo: SmallCardMetricInfo
  listings: ListingWithMetric[]
}

const TOP_N_GROUP_SIZE = 2

export function HomeCarousels({
  aiListingsGroup,
  gamingListingsGroup,
  newsArticles,
}: {
  aiListingsGroup: { spec: GpuSpecKey; listings: Listing[] }[]
  gamingListingsGroup: GamingCarouselData[]
  newsArticles: NewsItem[]
}) {
  const variant = useFeatureFlagVariantKey("home-carousel-order")

  // A/B test "home-carousel-order": control = AI carousels only, test = gaming carousels first then AI
  const showGaming = variant === "test"

  const aiCarousels = aiListingsGroup.map(({ spec, listings }) => (
    <TopListingsCarousel key={spec} spec={spec} listings={listings} />
  ))

  const gamingCarousels = gamingListingsGroup
    .filter((g) => g.listings.length > 0)
    .map((g) => (
      <GamingListingsCarousel
        key={g.slug}
        slug={g.slug}
        name={g.name}
        metricInfo={g.metricInfo}
        listings={g.listings}
      />
    ))

  const allCarousels = showGaming
    ? [...gamingCarousels, ...aiCarousels]
    : aiCarousels

  return (
    <div className="d-flex flex-column">
      {allCarousels.map((carousel, groupIndex) => (
        <div key={carousel.key}>
          {carousel}
          {groupIndex % TOP_N_GROUP_SIZE === 1 &&
            groupIndex < allCarousels.length - 1 && (
              <NewsArticlePair
                startIndex={groupIndex - 1}
                articles={newsArticles.slice(
                  Math.floor(groupIndex / TOP_N_GROUP_SIZE) * TOP_N_GROUP_SIZE,
                  Math.floor(groupIndex / TOP_N_GROUP_SIZE) * TOP_N_GROUP_SIZE +
                    TOP_N_GROUP_SIZE,
                )}
              />
            )}
        </div>
      ))}
    </div>
  )
}

function TopListingsCarousel({
  spec,
  listings,
}: {
  spec: GpuSpecKey
  listings: Listing[]
}): ReactNode {
  return (
    <Carousel
      header={`Top GPUs for ${GpuSpecsDescription[spec].label}`}
      href={canonicalPathForSlug(mapMetricToSlug(spec), "ai")}
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

function GamingListingsCarousel({
  slug,
  name,
  metricInfo,
  listings,
}: GamingCarouselData): ReactNode {
  return (
    <Carousel
      header={`Top GPUs for ${name}`}
      href={canonicalPathForSlug(slug, "gaming")}
    >
      {listings.map((listing) => (
        <ListingCardSmall
          key={listing.itemId}
          item={listing}
          metricInfo={metricInfo}
          metricValue={listing.metricValue}
        />
      ))}
    </Carousel>
  )
}
