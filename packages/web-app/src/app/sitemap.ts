import { MetadataRoute } from "next"
import staticPagesSitemap from "./sitemap.static-pages.json"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { IterableElement } from "type-fest"
import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import {
  getLatestListingDate,
  GpuWithListings,
  listCachedListingsGroupedByGpu,
} from "@/pkgs/server/db/ListingRepository"
import { listGpus } from "@/pkgs/server/db/GpuRepository"
import { prismaSingleton } from "@/pkgs/server/db/db"
import { EPOCH } from "@/pkgs/isomorphic/duration"
import { createDiag } from "@activescott/diag"
import { listModels } from "@/pkgs/server/data/ModelRepository"
import { listMetricDefinitions } from "@/pkgs/server/data/MetricRepository"

/* eslint-disable import/no-unused-modules */

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
export const revalidate = 86_400

// Force dynamic rendering to avoid database dependency during Docker build
export const dynamic = "force-dynamic"

const log = createDiag("shopping-agent:sitemap")

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
    modelsSitemap(domain_url),
    gpuLearnSitemap(domain_url),
    gpuCardLearnSitemap(domain_url),
    rankingSitemap(domain_url),
    priceCompareSitemap(domain_url),
    benchmarkLearnSitemap(domain_url),
    listCachedListingsGroupedByGpu(false, prismaSingleton),
  ])
  log.debug("Awaiting queries for sitemap generation complete.")
  const [
    homePageItem,
    newsItems,
    modelsEntries,
    gpuLearnEntries,
    gpuCardLearnEntries,
    rankingEntries,
    priceCompareEntries,
    benchmarkLearnEntries,
    gpusAndListings,
  ] = awaitedQueries

  // map the gpu+listings > gpu+latestDate
  const gpusWithLatestDate: GpuWithLatestListingDate[] =
    computeLatestListingDateForGpus(gpusAndListings)

  // these have the same shape, but need flattened:
  const dynamicEntryGroups: SitemapItem[][] = [
    newsItems,
    modelsEntries,
    gpuLearnEntries,
    gpuCardLearnEntries,
    rankingEntries,
    priceCompareEntries,
    benchmarkLearnEntries,
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
  const metricDefinitions = await listMetricDefinitions()

  const rankingEntries: SitemapItem[] = metricDefinitions.map((metric) => {
    return {
      url: `${domain_url}/gpu/ranking/${metric.category}/${metric.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: new Date(),
    } satisfies SitemapItem
  })

  return rankingEntries
}

async function priceCompareSitemap(domain_url: string): Promise<SitemapItem[]> {
  const metricDefinitions = await listMetricDefinitions()

  const priceCompareEntries: SitemapItem[] = metricDefinitions.map((metric) => {
    return {
      url: `${domain_url}/gpu/price-compare/${metric.category}/${metric.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: new Date(),
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
      lastModified: new Date(),
    } satisfies SitemapItem
  })

  return benchmarkLearnEntries
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
