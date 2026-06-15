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

/** Home page rows of cost/performance carousels (AI + optional gaming) with news pairs interspersed every two rows. */
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
      {allCarousels.map((carousel, groupIndex) => {
        const sliceStart =
          Math.floor(groupIndex / TOP_N_GROUP_SIZE) * TOP_N_GROUP_SIZE
        const articles = newsArticles.slice(
          sliceStart,
          sliceStart + TOP_N_GROUP_SIZE,
        )
        const showNewsPair =
          groupIndex % TOP_N_GROUP_SIZE === 1 &&
          groupIndex < allCarousels.length - 1 &&
          articles.length === TOP_N_GROUP_SIZE
        return (
          <div key={carousel.key}>
            {carousel}
            {showNewsPair && (
              <NewsArticlePair
                startIndex={groupIndex - 1}
                articles={articles}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const AI_CAROUSEL_SUBTITLES: Record<GpuSpecKey, string> = {
  fp32TFLOPS:
    "Best price per FP32 TFLOP — useful for ML training, scientific computing, and rendering.",
  fp16TFLOPS:
    "Best price per FP16 TFLOP — useful for mixed-precision training and inference.",
  tensorCoreCount:
    "Best price per Tensor Core — useful for transformer and deep-learning workloads.",
  int8TOPS:
    "Best price per INT8 TOP — useful for quantized LLM inference and edge AI.",
  memoryCapacityGB:
    "Best price per GB of VRAM — useful for large-model fine-tuning and high-resolution rendering.",
  memoryBandwidthGBs:
    "Best price per GB/s of memory bandwidth — useful for memory-bound LLM inference.",
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
      subtitle={AI_CAROUSEL_SUBTITLES[spec]}
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
      subtitle="Best price per FPS at 1440p — top picks for budget-conscious gaming builds."
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
