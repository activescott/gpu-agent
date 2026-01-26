import { MetadataRoute } from "next"
import staticPagesSitemap from "./sitemap.static-pages.json"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { IterableElement } from "type-fest"
import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import { listMarketReports } from "@/app/gpu/market-report/reports"
import {
  getLatestListingDate,
  GpuWithListings,
  listCachedListingsGroupedByGpu,
} from "@/pkgs/server/db/ListingRepository"
import {
  listGpus,
  getLatestGpuLastModified,
} from "@/pkgs/server/db/GpuRepository"
import { prismaSingleton } from "@/pkgs/server/db/db"
import { EPOCH } from "@/pkgs/isomorphic/duration"
import { createLogger } from "@/lib/logger"
import { listModels } from "@/pkgs/server/data/ModelRepository"
import { listMetricDefinitions } from "@/pkgs/server/data/MetricRepository"

/* eslint-disable import/no-unused-modules */

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 86_400

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

const log = createLogger("sitemap")

type SitemapItem = IterableElement<MetadataRoute.Sitemap>

type GpuWithLatestListingDate = {
  gpuName: string
  latestListingDate: Date
}

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generating-a-sitemap-using-code-js-ts

// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#addsitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain_url = `https://${ISOMORPHIC_CONFIG.PUBLIC_DOMAIN()}`
  log.debug("Awaiting queries for sitemap generation...")
  const awaitedQueries = await Promise.all([
    homePageSitemapItem(domain_url),
    newsSitemap(domain_url),
    marketReportSitemap(domain_url),
    modelsSitemap(domain_url),
    gpuLearnSitemap(domain_url),
    gpuCardLearnSitemap(domain_url),
    rankingSitemap(domain_url),
    priceCompareSitemap(domain_url),
    benchmarkLearnSitemap(domain_url),
    gpuCompareSitemap(domain_url),
    listCachedListingsGroupedByGpu(false, prismaSingleton),
  ])
  log.debug("Awaiting queries for sitemap generation complete.")
  const [
    homePageItem,
    newsItems,
    marketReportItems,
    modelsEntries,
    gpuLearnEntries,
    gpuCardLearnEntries,
    rankingEntries,
    priceCompareEntries,
    benchmarkLearnEntries,
    gpuCompareEntries,
    gpusAndListings,
  ] = awaitedQueries

  // map the gpu+listings > gpu+latestDate
  const gpusWithLatestDate: GpuWithLatestListingDate[] =
    computeLatestListingDateForGpus(gpusAndListings)

  // these have the same shape, but need flattened:
  const dynamicEntryGroups: SitemapItem[][] = [
    newsItems,
    marketReportItems,
    modelsEntries,
    gpuLearnEntries,
    gpuCardLearnEntries,
    rankingEntries,
    priceCompareEntries,
    benchmarkLearnEntries,
    gpuCompareEntries,
  ]
  const dynamicEntries: SitemapItem[] = dynamicEntryGroups.flat()

  const items: SitemapItem[] = [
    homePageItem,
    ...gpuSlugPathSitemap(gpusWithLatestDate, "/gpu/shop", domain_url),
    ...dynamicEntries,
    ...staticSitemap(domain_url),
  ]

  return items
}

interface SitemapJsonItem {
  path: string
  title: string
  lastModified: string
}

async function homePageSitemapItem(domain_url: string): Promise<SitemapItem> {
  const latestListingDate = await getLatestListingDate()
  return {
    url: `${domain_url}/`,
    changeFrequency: "daily",
    // the home page could be updated anytime the latest listing date changes
    lastModified: latestListingDate,
    priority: 0.9,
  } satisfies SitemapItem
}

/**
 * Generates a sitemap for the specified path with a GPU slug.
 * @param gpus A list of gpus with their latest listing date
 * @param pathPrefixBeforeSlug the prefixed path before the GPU slug
 */
function gpuSlugPathSitemap(
  gpus: GpuWithLatestListingDate[],
  pathPrefixBeforeSlug: string,
  domain_url: string,
) {
  const gpuEntries: SitemapItem[] = gpus.map((gpu) => {
    return {
      url: `${domain_url}${pathPrefixBeforeSlug}/${gpu.gpuName}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: gpu.latestListingDate,
    } satisfies SitemapItem
  })
  return gpuEntries
}

async function newsSitemap(domain_url: string): Promise<SitemapItem[]> {
  const newsArticles = await listPublishedArticles()

  const newsEntries: SitemapItem[] = newsArticles.map((article) => {
    return {
      url: `${domain_url}/news/${article.slug}`,
      changeFrequency: "yearly",
      priority: 0.6,
      lastModified: article.updatedAt,
    } satisfies SitemapItem
  })

  const newsRoot: SitemapItem = {
    url: `${domain_url}/news`,
    changeFrequency: "monthly",
    priority: 0.5,
    lastModified: newsArticles[0].updatedAt,
  }

  return [newsRoot, ...newsEntries]
}

function marketReportSitemap(domain_url: string): SitemapItem[] {
  // Market reports are now TSX files, metadata is in the registry
  const marketReports = listMarketReports()

  const reportEntries: SitemapItem[] = marketReports.map((report) => {
    return {
      url: `${domain_url}/gpu/market-report/${report.slug}`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: report.updatedAt,
    } satisfies SitemapItem
  })

  return reportEntries
}

async function modelsSitemap(domain_url: string): Promise<SitemapItem[]> {
  const models = await listModels()

  const modelEntries: SitemapItem[] = models.map((model) => {
    return {
      url: `${domain_url}/ml/learn/models/${model.name}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: new Date(model.updatedAt),
    } satisfies SitemapItem
  })

  return modelEntries
}

async function gpuLearnSitemap(domain_url: string): Promise<SitemapItem[]> {
  const gpus = await listGpus()

  const gpuEntries: SitemapItem[] = gpus.map((gpu) => {
    return {
      url: `${domain_url}/ml/learn/gpu/${gpu.name}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: gpu.lastModified,
    } satisfies SitemapItem
  })

  return gpuEntries
}

async function gpuCardLearnSitemap(domain_url: string): Promise<SitemapItem[]> {
  const gpus = await listGpus()

  const gpuEntries: SitemapItem[] = gpus.map((gpu) => {
    return {
      url: `${domain_url}/gpu/learn/card/${gpu.name}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: gpu.lastModified,
    } satisfies SitemapItem
  })

  return gpuEntries
}

async function rankingSitemap(domain_url: string): Promise<SitemapItem[]> {
  const [metricDefinitions, latestGpuLastModified] = await Promise.all([
    listMetricDefinitions(),
    getLatestGpuLastModified(),
  ])

  const rankingEntries: SitemapItem[] = metricDefinitions.map((metric) => {
    // Use the later of metric update or GPU spec update
    const lastModified =
      metric.updatedAt > latestGpuLastModified
        ? metric.updatedAt
        : latestGpuLastModified
    return {
      url: `${domain_url}/gpu/ranking/${metric.category}/${metric.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified,
    } satisfies SitemapItem
  })

  return rankingEntries
}

async function priceCompareSitemap(domain_url: string): Promise<SitemapItem[]> {
  const [metricDefinitions, latestListingDate] = await Promise.all([
    listMetricDefinitions(),
    getLatestListingDate(),
  ])

  const priceCompareEntries: SitemapItem[] = metricDefinitions.map((metric) => {
    // Use the later of metric update or listing update
    const lastModified =
      metric.updatedAt > latestListingDate
        ? metric.updatedAt
        : latestListingDate
    return {
      url: `${domain_url}/gpu/price-compare/${metric.category}/${metric.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified,
    } satisfies SitemapItem
  })

  return priceCompareEntries
}

async function benchmarkLearnSitemap(
  domain_url: string,
): Promise<SitemapItem[]> {
  const metricDefinitions = await listMetricDefinitions()

  // Only gaming benchmarks have learn pages
  const gamingMetrics = metricDefinitions.filter(
    (metric) => metric.category === "gaming",
  )

  const benchmarkLearnEntries: SitemapItem[] = gamingMetrics.map((metric) => {
    return {
      url: `${domain_url}/gpu/learn/benchmark/gaming/${metric.slug}`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: metric.updatedAt,
    } satisfies SitemapItem
  })

  return benchmarkLearnEntries
}

// Popular GPU comparisons that users commonly search for
const POPULAR_GPU_COMPARISONS: [string, string][] = [
  ["amd-radeon-rx-9070-xt", "nvidia-geforce-rtx-4070-ti-super"],
  ["nvidia-geforce-rtx-4080", "nvidia-geforce-rtx-4090"],
  ["nvidia-geforce-rtx-4070-super", "nvidia-geforce-rtx-4070-ti-super"],
  ["nvidia-geforce-rtx-3060-ti", "nvidia-geforce-rtx-4060"],
  ["nvidia-geforce-rtx-3090", "nvidia-geforce-rtx-4090"],
  ["nvidia-geforce-rtx-4060", "nvidia-geforce-rtx-4070"],
  ["nvidia-geforce-rtx-3080", "nvidia-geforce-rtx-4080"],
  ["nvidia-geforce-rtx-3070", "nvidia-geforce-rtx-4070"],
  ["nvidia-geforce-rtx-4080", "nvidia-geforce-rtx-4080-super"],
  ["nvidia-geforce-rtx-4070-super", "nvidia-geforce-rtx-4070-ti-super"],
  ["amd-radeon-rx-7900-xtx", "nvidia-geforce-rtx-4090"],
]

async function gpuCompareSitemap(domain_url: string): Promise<SitemapItem[]> {
  const entries: SitemapItem[] = []

  // Get the latest GPU modification date for the landing page
  // and build a map of GPU names to their lastModified dates
  const [latestGpuLastModified, gpus] = await Promise.all([
    getLatestGpuLastModified(),
    listGpus(),
  ])

  // Build map of GPU name -> lastModified for comparison pages
  const gpuLastModifiedMap = new Map<string, Date>()
  for (const gpu of gpus) {
    gpuLastModifiedMap.set(gpu.name, gpu.lastModified)
  }

  // Add the landing page
  entries.push({
    url: `${domain_url}/gpu/compare`,
    changeFrequency: "monthly",
    priority: 0.7,
    lastModified: latestGpuLastModified,
  })

  // Add popular comparison pages
  for (const [gpu1, gpu2] of POPULAR_GPU_COMPARISONS) {
    const gpu1LastModified = gpuLastModifiedMap.get(gpu1) ?? EPOCH
    const gpu2LastModified = gpuLastModifiedMap.get(gpu2) ?? EPOCH
    const lastModified =
      gpu1LastModified > gpu2LastModified ? gpu1LastModified : gpu2LastModified

    entries.push({
      url: `${domain_url}/gpu/compare/${gpu1}/vs/${gpu2}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified,
    })
  }

  return entries
}

function staticSitemap(domain_url: string): SitemapItem[] {
  const jsonEntries = [...staticPagesSitemap.data] as SitemapJsonItem[]
  return jsonEntries.map((item) => {
    return {
      url: `${domain_url}${item.path}`,
      changeFrequency: chooseChangeFrequency(item),
      priority: 0.8,
      lastModified: item.lastModified,
    } satisfies SitemapItem
  })
}

function chooseChangeFrequency(
  item: SitemapJsonItem,
): SitemapItem["changeFrequency"] {
  const path = item.path
  if (path.startsWith("/policy")) {
    return "yearly"
  }
  return "monthly"
}

function computeLatestListingDateForGpus(
  gpusAndListings: GpuWithListings[],
): GpuWithLatestListingDate[] {
  return gpusAndListings.map((gpuWithListings) => {
    const latestListingDate = gpuWithListings.listings.reduce(
      (prev, current) => {
        const itemCreationDate = current.itemCreationDate
        return itemCreationDate && itemCreationDate > prev
          ? itemCreationDate
          : prev
      },
      EPOCH,
    )
    return {
      gpuName: gpuWithListings.gpuName,
      latestListingDate,
    }
  })
}
