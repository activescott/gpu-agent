import { MetadataRoute } from "next"
import staticPagesSitemap from "./sitemap.static-pages.json"
import { ISOMORPHIC_CONFIG } from "@/pkgs/isomorphic/config"
import { IterableElement } from "type-fest"
import { listPublishedArticles } from "@/pkgs/server/db/NewsRepository"
import {
  getLatestListingDateWithThrottle,
  GpuWithListings,
  listCachedListingsGroupedByGpu,
} from "@/pkgs/server/db/ListingRepository"
import { prismaSingleton } from "@/pkgs/server/db/db"
import { EPOCH, hoursToSeconds } from "@/pkgs/isomorphic/duration"
import { listGpuRankingSlugs } from "./ml/learn/gpu/ranking/slugs"
import { createDiag } from "@activescott/diag"
import {
  canonicalPathForSlug,
  listPerformanceSlugs,
} from "./ml/shop/gpu/performance/slugs"

/* eslint-disable import/no-unused-modules */

// revalidate the data at most every N seconds: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#revalidate
const REVALIDATE_HOURS = 24
export const revalidate = hoursToSeconds(REVALIDATE_HOURS)

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
    gpuRankingSitemap(domain_url),
    listCachedListingsGroupedByGpu(false, prismaSingleton),
  ])
  log.debug("Awaiting queries for sitemap generation complete.")
  const [homePageItem, newsItems, gpuRankingEntries, gpusAndListings] =
    awaitedQueries

  // map the gpu+listings > gpu+latestDate
  const gpusWithLatestDate: GpuWithLatestListingDate[] =
    computeLatestListingDateForGpus(gpusAndListings)

  // these have the same shape, but need flattened:
  const dynamicEntryGroups: SitemapItem[][] = [newsItems, gpuRankingEntries]
  const dynamicEntries: SitemapItem[] = dynamicEntryGroups.flat()

  const items: SitemapItem[] = [
    homePageItem,
    ...gpuSlugPathSitemap(gpusWithLatestDate, "/ml/shop/gpu", domain_url),
    ...mlPerformanceSpecSlugsSitemap(domain_url),
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
  const latestListingDate = await getLatestListingDateWithThrottle()
  return {
    url: `${domain_url}/`,
    changeFrequency: "daily",
    // the home page could be updated anytime the latest listing date changes
    lastModified: latestListingDate,
    priority: 0.9,
  } satisfies SitemapItem
}

async function gpuRankingSitemap(domain_url: string): Promise<SitemapItem[]> {
  const slugs = listGpuRankingSlugs()

  // lastModified is effectively the most recent listing data across all GPUs
  const lastModified: Date = await getLatestListingDateWithThrottle()

  const entries = slugs.map((slug) => {
    return {
      url: `${domain_url}/ml/learn/gpu/ranking/${slug}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: lastModified,
    } satisfies SitemapItem
  })
  return entries
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
function mlPerformanceSpecSlugsSitemap(domain_url: string): SitemapItem[] {
  const specSlugs = listPerformanceSlugs()
  const entries = specSlugs.map((slug) => {
    return {
      url: `${domain_url}${canonicalPathForSlug(slug)}`,
      changeFrequency: "daily",
      priority: 0.8,
      lastModified: new Date(),
    } satisfies SitemapItem
  })
  return entries
}
