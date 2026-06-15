import type { Metadata } from "next"
import { GpuSpecKeys } from "@/pkgs/isomorphic/model"
import {
  topNListingsByCostPerformance,
  listingsByCostPerformanceBySlug,
} from "@/pkgs/server/db/ListingRepository"
import Link from "next/link"
import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import { TipCard } from "../pkgs/client/components/TipCard"
import { PopularComparisons } from "@/pkgs/client/components/PopularComparisons"
import { listMarketReports } from "./gpu/market-report/reports"
import type { NewsItem } from "@/pkgs/client/components/NewsArticlePair"
import { listMetricDefinitions } from "@/pkgs/server/data/MetricRepository"
import { HomeCarousels } from "@/pkgs/client/components/HomeCarousels"
import { HomeEditorialBanner } from "@/pkgs/client/components/HomeEditorialBanner"

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 1800

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Find the Best GPU for Your Money - GPUPoet.com",
  alternates: { canonical: "https://gpupoet.com/" },
}

const TOP_N_LISTINGS = 10
const HOME_GAMING_RESOLUTION = "2560x1440"
const MIN_AI_VRAM_GB = 10
const BANNER_NEWS_COUNT = 2
const CAROUSEL_NEWS_MAX_AGE_MONTHS = 5

export default async function Page() {
  const allMetrics = await listMetricDefinitions()
  const gamingMetrics = allMetrics.filter(
    (m) => m.category === "gaming" && m.slug.includes(HOME_GAMING_RESOLUTION),
  )

  const aiListingsPromises = GpuSpecKeys.map(async (spec) => {
    const listings = await topNListingsByCostPerformance(
      spec,
      TOP_N_LISTINGS,
      undefined,
      { minMemoryGB: MIN_AI_VRAM_GB },
    )
    return { spec, listings }
  })

  const gamingListingsPromises = gamingMetrics.map(async (metric) => {
    const listings = await listingsByCostPerformanceBySlug(
      metric.slug,
      TOP_N_LISTINGS,
    )
    return {
      slug: metric.slug,
      name: metric.name,
      metricInfo: {
        unit: metric.unit,
        descriptionDollarsPer: metric.descriptionDollarsPer,
      },
      listings,
    }
  })

  const newsPromise = listPublishedArticles()

  const [aiListingsGroup, gamingListingsGroup, rawNewsArticles] =
    await Promise.all([
      Promise.all(aiListingsPromises),
      Promise.all(gamingListingsPromises),
      newsPromise,
    ])

  // Filter and sort news articles
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const recentArticles: NewsItem[] = rawNewsArticles
    .filter((article) => article.publishedAt > oneYearAgo)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())

  const latestReport = listMarketReports()[0] ?? null
  const bannerNews = recentArticles.slice(0, BANNER_NEWS_COUNT)

  // Interspersed carousel news: only show articles from the last N months.
  const carouselNewsCutoff = new Date()
  carouselNewsCutoff.setMonth(
    carouselNewsCutoff.getMonth() - CAROUSEL_NEWS_MAX_AGE_MONTHS,
  )
  const carouselNews = recentArticles
    .slice(BANNER_NEWS_COUNT)
    .filter((article) => article.publishedAt > carouselNewsCutoff)

  return (
    <div>
      <h1 className="display-1">
        <span className="text-accent">Save money</span> on your next GPU.
      </h1>
      <h3 className="lead">
        GPU Poet is a free price comparison tool helping you find the best GPU
        for your money.
      </h3>

      <HomeEditorialBanner report={latestReport} latestNews={bannerNews} />

      <div className="my-how-to-cards mt-4 d-flex flex-column flex-md-row justify-content-evenly">
        <TipCard icon="trophy-fill">
          Check <Link href="/gpu/ranking/ai/fp32-flops">GPU Rankings</Link> to
          see the best GPUs for the money.
        </TipCard>
        <TipCard icon="shop-window">
          <Link href="/gpu/price-compare">Browse GPUs for sale</Link> to see
          price vs. performance.
        </TipCard>
        <TipCard icon="book">
          <Link href="/gpu/learn">Learn about GPUs</Link> — guides on AI specs,
          gaming benchmarks, and individual cards.
        </TipCard>
      </div>

      <div className="mt-5">
        <PopularComparisons />
      </div>

      <HomeCarousels
        aiListingsGroup={aiListingsGroup}
        gamingListingsGroup={gamingListingsGroup}
        newsArticles={carouselNews}
      />
    </div>
  )
}
